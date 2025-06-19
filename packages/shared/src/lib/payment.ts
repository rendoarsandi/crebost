import crypto from 'crypto'

export interface MidtransConfig {
  serverKey: string
  clientKey: string
  isProduction: boolean
  merchantId: string
}

export interface PaymentRequest {
  orderId: string
  grossAmount: number
  customerDetails: {
    firstName: string
    lastName?: string
    email: string
    phone?: string
  }
  itemDetails: {
    id: string
    price: number
    quantity: number
    name: string
  }[]
  customExpiry?: {
    orderTime: string
    expiryDuration: number
    unit: 'second' | 'minute' | 'hour' | 'day'
  }
}

export interface MidtransResponse {
  token: string
  redirectUrl: string
}

export interface WebhookNotification {
  transactionTime: string
  transactionStatus: string
  transactionId: string
  statusMessage: string
  statusCode: string
  signatureKey: string
  paymentType: string
  orderId: string
  merchantId: string
  grossAmount: string
  fraudStatus: string
  currency: string
}

export class MidtransPayment {
  private config: MidtransConfig
  private baseUrl: string

  constructor(config: MidtransConfig) {
    this.config = config
    this.baseUrl = config.isProduction 
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2'
  }

  private getAuthHeader(): string {
    return Buffer.from(this.config.serverKey + ':').toString('base64')
  }

  async createTransaction(paymentRequest: PaymentRequest): Promise<MidtransResponse> {
    const payload = {
      transaction_details: {
        order_id: paymentRequest.orderId,
        gross_amount: paymentRequest.grossAmount,
      },
      customer_details: {
        first_name: paymentRequest.customerDetails.firstName,
        last_name: paymentRequest.customerDetails.lastName || '',
        email: paymentRequest.customerDetails.email,
        phone: paymentRequest.customerDetails.phone || '',
      },
      item_details: paymentRequest.itemDetails.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      custom_expiry: paymentRequest.customExpiry ? {
        order_time: paymentRequest.customExpiry.orderTime,
        expiry_duration: paymentRequest.customExpiry.expiryDuration,
        unit: paymentRequest.customExpiry.unit,
      } : undefined,
      enabled_payments: [
        'credit_card',
        'bca_va',
        'bni_va',
        'bri_va',
        'echannel',
        'permata_va',
        'other_va',
        'gopay',
        'shopeepay',
        'qris',
      ],
    }

    try {
      const response = await fetch(`${this.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.getAuthHeader()}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Midtrans API Error: ${errorData.error_messages?.join(', ') || response.statusText}`)
      }

      const data = await response.json()
      
      return {
        token: data.token,
        redirectUrl: data.redirect_url,
      }
    } catch (error) {
      console.error('Midtrans transaction creation failed:', error)
      throw error
    }
  }

  async getTransactionStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.getAuthHeader()}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get transaction status: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get transaction status:', error)
      throw error
    }
  }

  verifyWebhookSignature(notification: WebhookNotification): boolean {
    const { orderId, statusCode, grossAmount, signatureKey } = notification
    
    const payload = orderId + statusCode + grossAmount + this.config.serverKey
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(payload)
      .digest('hex')

    return calculatedSignature === signatureKey
  }

  async cancelTransaction(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.getAuthHeader()}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to cancel transaction: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to cancel transaction:', error)
      throw error
    }
  }

  async refundTransaction(orderId: string, amount?: number, reason?: string): Promise<any> {
    const payload: any = {}
    if (amount) payload.amount = amount
    if (reason) payload.reason = reason

    try {
      const response = await fetch(`${this.baseUrl}/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.getAuthHeader()}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to refund transaction: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to refund transaction:', error)
      throw error
    }
  }
}

// Payment status mapping
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SETTLEMENT: 'settlement',
  CAPTURE: 'capture',
  DENY: 'deny',
  CANCEL: 'cancel',
  EXPIRE: 'expire',
  FAILURE: 'failure',
  REFUND: 'refund',
  PARTIAL_REFUND: 'partial_refund',
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// Helper function to map Midtrans status to our internal status
export function mapMidtransStatus(midtransStatus: string): PaymentStatus {
  switch (midtransStatus.toLowerCase()) {
    case 'pending':
      return PAYMENT_STATUS.PENDING
    case 'settlement':
    case 'capture':
      return PAYMENT_STATUS.SETTLEMENT
    case 'deny':
      return PAYMENT_STATUS.DENY
    case 'cancel':
      return PAYMENT_STATUS.CANCEL
    case 'expire':
      return PAYMENT_STATUS.EXPIRE
    case 'failure':
      return PAYMENT_STATUS.FAILURE
    case 'refund':
      return PAYMENT_STATUS.REFUND
    case 'partial_refund':
      return PAYMENT_STATUS.PARTIAL_REFUND
    default:
      return PAYMENT_STATUS.PENDING
  }
}

// Helper function to check if payment is successful
export function isPaymentSuccessful(status: PaymentStatus): boolean {
  return status === PAYMENT_STATUS.SETTLEMENT || status === PAYMENT_STATUS.CAPTURE
}

// Helper function to check if payment is failed
export function isPaymentFailed(status: PaymentStatus): boolean {
  return [
    PAYMENT_STATUS.DENY,
    PAYMENT_STATUS.CANCEL,
    PAYMENT_STATUS.EXPIRE,
    PAYMENT_STATUS.FAILURE,
  ].includes(status)
}

// Helper function to generate order ID
export function generateOrderId(prefix: string = 'CREBOST'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Helper function to calculate platform fee
export function calculatePlatformFee(amount: number, feePercentage: number = 10): number {
  return Math.round(amount * (feePercentage / 100))
}

// Helper function to format currency for display
export function formatPaymentAmount(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
