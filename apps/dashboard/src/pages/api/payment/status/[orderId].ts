import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '@crebost/database'
import { MidtransPayment, mapMidtransStatus } from '@crebost/shared'

const midtrans = new MidtransPayment({
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
  isProduction: process.env.NODE_ENV === 'production',
  merchantId: process.env.MIDTRANS_MERCHANT_ID!,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { orderId } = req.query

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
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
      return res.status(404).json({ error: 'Transaction not found' })
    }

    // Check if user owns this transaction
    if (transaction.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Get latest status from Midtrans
    let midtransStatus = null
    try {
      midtransStatus = await midtrans.getTransactionStatus(orderId)
    } catch (error) {
      console.error('Failed to get Midtrans status:', error)
      // Continue with database status if Midtrans call fails
    }

    // Update transaction status if Midtrans status is different
    if (midtransStatus && midtransStatus.transaction_status !== transaction.midtransStatus) {
      const newStatus = mapMidtransStatus(midtransStatus.transaction_status)
      
      await prisma.transaction.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          midtransStatus: midtransStatus.transaction_status,
          midtransFraudStatus: midtransStatus.fraud_status,
          updatedAt: new Date(),
        },
      })

      // Update the transaction object with new status
      transaction.status = newStatus
      transaction.midtransStatus = midtransStatus.transaction_status
      transaction.midtransFraudStatus = midtransStatus.fraud_status
    }

    // Prepare response
    const response = {
      orderId: transaction.id,
      status: transaction.status,
      amount: transaction.amountIdr,
      platformFee: transaction.platformFeeIdr,
      totalAmount: transaction.totalAmountIdr,
      paymentMethod: transaction.paymentMethod,
      description: transaction.description,
      createdAt: transaction.createdAt,
      paidAt: transaction.paidAt,
      campaign: transaction.campaign,
      midtransStatus: transaction.midtransStatus,
      midtransFraudStatus: transaction.midtransFraudStatus,
      midtransToken: transaction.midtransToken,
      midtransRedirectUrl: transaction.midtransRedirectUrl,
    }

    res.status(200).json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    res.status(500).json({ 
      error: 'Failed to check payment status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}
