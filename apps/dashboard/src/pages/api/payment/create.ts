import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '@crebost/database'
import { 
  MidtransPayment, 
  generateOrderId, 
  calculatePlatformFee,
  PAYMENT_STATUS 
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
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { campaignId, budgetIdr } = req.body

    if (!campaignId || !budgetIdr || budgetIdr < 100000) {
      return res.status(400).json({ 
        error: 'Invalid request. Campaign ID and budget (min Rp 100,000) are required.' 
      })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    })

    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'User account is not active' })
    }

    if (user.role !== 'CREATOR') {
      return res.status(403).json({ error: 'Only creators can make payments for campaigns' })
    }

    // Get campaign details
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        title: true,
        creatorId: true,
        status: true,
        budgetIdr: true,
      },
    })

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    if (campaign.creatorId !== user.id) {
      return res.status(403).json({ error: 'You can only make payments for your own campaigns' })
    }

    if (campaign.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Can only make payments for draft campaigns' })
    }

    // Calculate fees
    const platformFee = calculatePlatformFee(budgetIdr, 10) // 10% platform fee
    const totalAmount = budgetIdr + platformFee

    // Generate order ID
    const orderId = generateOrderId('CAMPAIGN')

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        id: orderId,
        userId: user.id,
        campaignId: campaign.id,
        type: 'CAMPAIGN_PAYMENT',
        amountIdr: budgetIdr,
        platformFeeIdr: platformFee,
        totalAmountIdr: totalAmount,
        status: 'PENDING',
        paymentMethod: 'MIDTRANS',
        description: `Payment for campaign: ${campaign.title}`,
      },
    })

    // Create Midtrans payment
    const paymentRequest = {
      orderId,
      grossAmount: totalAmount,
      customerDetails: {
        firstName: user.name?.split(' ')[0] || 'User',
        lastName: user.name?.split(' ').slice(1).join(' '),
        email: user.email,
      },
      itemDetails: [
        {
          id: 'campaign-budget',
          price: budgetIdr,
          quantity: 1,
          name: `Campaign Budget: ${campaign.title}`,
        },
        {
          id: 'platform-fee',
          price: platformFee,
          quantity: 1,
          name: 'Platform Fee (10%)',
        },
      ],
      customExpiry: {
        orderTime: new Date().toISOString(),
        expiryDuration: 24,
        unit: 'hour' as const,
      },
    }

    const midtransResponse = await midtrans.createTransaction(paymentRequest)

    // Update transaction with Midtrans token
    await prisma.transaction.update({
      where: { id: orderId },
      data: {
        midtransToken: midtransResponse.token,
        midtransRedirectUrl: midtransResponse.redirectUrl,
      },
    })

    res.status(200).json({
      success: true,
      data: {
        orderId,
        token: midtransResponse.token,
        redirectUrl: midtransResponse.redirectUrl,
        amount: totalAmount,
        platformFee,
        campaignBudget: budgetIdr,
      },
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    res.status(500).json({ 
      error: 'Failed to create payment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}
