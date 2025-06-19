import { useState, useEffect } from 'react'
import { formatCurrency } from '@crebost/shared'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  campaignTitle: string
  budgetIdr: number
  onPaymentSuccess: (orderId: string) => void
  onPaymentError: (error: string) => void
}

declare global {
  interface Window {
    snap: any
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  budgetIdr,
  onPaymentSuccess,
  onPaymentError,
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [snapLoaded, setSnapLoaded] = useState(false)

  // Load Midtrans Snap script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.snap) {
      const script = document.createElement('script')
      script.src = process.env.NODE_ENV === 'production' 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
      script.onload = () => setSnapLoaded(true)
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    } else if (window.snap) {
      setSnapLoaded(true)
    }
  }, [])

  const platformFee = Math.round(budgetIdr * 0.1) // 10% platform fee
  const totalAmount = budgetIdr + platformFee

  const handlePayment = async () => {
    if (!snapLoaded) {
      onPaymentError('Payment system is not ready. Please try again.')
      return
    }

    setLoading(true)

    try {
      // Create payment transaction
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          budgetIdr,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Open Midtrans Snap
      window.snap.pay(data.data.token, {
        onSuccess: function(result: any) {
          console.log('Payment success:', result)
          onPaymentSuccess(data.data.orderId)
          onClose()
        },
        onPending: function(result: any) {
          console.log('Payment pending:', result)
          // You can handle pending payment here
          onClose()
        },
        onError: function(result: any) {
          console.error('Payment error:', result)
          onPaymentError('Payment failed. Please try again.')
        },
        onClose: function() {
          console.log('Payment popup closed')
          setLoading(false)
        }
      })
    } catch (error) {
      console.error('Payment creation error:', error)
      onPaymentError(error.message || 'Failed to create payment')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900">Campaign Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Campaign Details</h4>
            <p className="text-sm text-gray-600">{campaignTitle}</p>
          </div>

          <div className="mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Campaign Budget:</span>
              <span className="text-sm font-medium">{formatCurrency(budgetIdr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Platform Fee (10%):</span>
              <span className="text-sm font-medium">{formatCurrency(platformFee)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-base font-medium text-gray-900">Total Amount:</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <svg className="flex-shrink-0 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Payment Information</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your campaign will be activated after successful payment</li>
                    <li>Multiple payment methods available (Bank Transfer, E-Wallet, Credit Card)</li>
                    <li>Payment is secure and processed by Midtrans</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePayment}
              disabled={loading || !snapLoaded}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : !snapLoaded ? (
                'Loading Payment System...'
              ) : (
                'Pay Now'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
