import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@crebost/database'
import { 
  MidtransPayment, 
  mapMidtransStatus, 
  isPaymentSuccessful,
  isPaymentFailed,
  WebhookNotification 
} from '@crebost/shared'

const midtrans = new MidtransPayment({
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  isProduction: process.env.NODE_ENV === 'production',
  merchantId: process.env.MIDTRANS_MERCHANT_ID!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const notification: WebhookNotification = req.body

    // Verify webhook signature
    if (!midtrans.verifyWebhookSignature(notification)) {
      console.error('Invalid webhook signature:', notification)
      return res.status(400).json({ error: 'Invalid signature' })
    }

    const { orderId, transactionStatus, fraudStatus } = notification

    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            creatorId: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!transaction) {
      console.error('Transaction not found:', orderId)
      return res.status(404).json({ error: 'Transaction not found' })
    }

    // Map Midtrans status to our internal status
    const paymentStatus = mapMidtransStatus(transactionStatus)
    
    // Handle fraud detection
    let finalStatus = paymentStatus
    if (fraudStatus === 'challenge' || fraudStatus === 'deny') {
      finalStatus = 'FRAUD_DETECTED'
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: orderId },
      data: {
        status: finalStatus,
        midtransStatus: transactionStatus,
        midtransFraudStatus: fraudStatus,
        paidAt: isPaymentSuccessful(paymentStatus) ? new Date() : null,
        updatedAt: new Date(),
      },
    })

    // Handle successful payment
    if (isPaymentSuccessful(paymentStatus) && fraudStatus !== 'deny') {
      await handleSuccessfulPayment(transaction)
    }

    // Handle failed payment
    if (isPaymentFailed(paymentStatus) || fraudStatus === 'deny') {
      await handleFailedPayment(transaction)
    }

    // Log the webhook for debugging
    await prisma.webhookLog.create({
      data: {
        provider: 'MIDTRANS',
        event: 'payment_notification',
        orderId,
        payload: JSON.stringify(notification),
        status: finalStatus,
        processedAt: new Date(),
      },
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Log failed webhook
    try {
      await prisma.webhookLog.create({
        data: {
          provider: 'MIDTRANS',
          event: 'payment_notification',
          orderId: req.body?.orderId || 'unknown',
          payload: JSON.stringify(req.body),
          status: 'ERROR',
          error: error.message,
          processedAt: new Date(),
        },
      })
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    res.status(500).json({ error: 'Webhook processing failed' })
  }
}

async function handleSuccessfulPayment(transaction: any) {
  try {
    // Update campaign status and budget
    await prisma.campaign.update({
      where: { id: transaction.campaignId },
      data: {
        status: 'ACTIVE',
        budgetIdr: transaction.amountIdr,
        startDate: new Date(),
        updatedAt: new Date(),
      },
    })

    // Update user balance (for platform fee revenue tracking)
    await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        totalSpentIdr: {
          increment: transaction.totalAmountIdr,
        },
        updatedAt: new Date(),
      },
    })

    // Create analytics record
    await prisma.analytics.create({
      data: {
        userId: transaction.userId,
        campaignId: transaction.campaignId,
        event: 'CAMPAIGN_FUNDED',
        metadata: {
          amount: transaction.amountIdr,
          platformFee: transaction.platformFeeIdr,
          totalAmount: transaction.totalAmountIdr,
        },
        createdAt: new Date(),
      },
    })

    // Send notification to user (you can implement email/push notification here)
    console.log(`Campaign ${transaction.campaign.title} has been successfully funded and activated`)

  } catch (error) {
    console.error('Error handling successful payment:', error)
    throw error
  }
}

async function handleFailedPayment(transaction: any) {
  try {
    // Keep campaign in draft status
    await prisma.campaign.update({
      where: { id: transaction.campaignId },
      data: {
        status: 'DRAFT',
        updatedAt: new Date(),
      },
    })

    // Create analytics record for failed payment
    await prisma.analytics.create({
      data: {
        userId: transaction.userId,
        campaignId: transaction.campaignId,
        event: 'PAYMENT_FAILED',
        metadata: {
          amount: transaction.amountIdr,
          reason: 'Payment failed or was cancelled',
        },
        createdAt: new Date(),
      },
    })

    // Send notification to user about failed payment
    console.log(`Payment failed for campaign ${transaction.campaign.title}`)

  } catch (error) {
    console.error('Error handling failed payment:', error)
    throw error
  }
}

// Disable body parser for webhook
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}
