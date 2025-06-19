import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import { useState } from 'react'
import { authOptions } from '../../lib/auth'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import { formatCurrency, formatDate } from '@crebost/shared'

interface Transaction {
  id: string
  type: 'CAMPAIGN_PAYMENT' | 'PROMOTION_PAYOUT' | 'WITHDRAWAL' | 'REFUND'
  amountIdr: number
  platformFeeIdr: number
  totalAmountIdr: number
  status: 'PENDING' | 'SETTLEMENT' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  paymentMethod: string
  description: string
  createdAt: string
  paidAt?: string
  campaign?: {
    id: string
    title: string
  }
  midtransStatus?: string
  midtransFraudStatus?: string
}

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>([
    {
      id: 'CAMPAIGN-1705123456-ABC123',
      type: 'CAMPAIGN_PAYMENT',
      amountIdr: 15000000,
      platformFeeIdr: 1500000,
      totalAmountIdr: 16500000,
      status: 'SETTLEMENT',
      paymentMethod: 'MIDTRANS',
      description: 'Payment for campaign: Summer Fashion Collection 2024',
      createdAt: '2024-01-15T10:00:00Z',
      paidAt: '2024-01-15T10:15:00Z',
      campaign: {
        id: '1',
        title: 'Summer Fashion Collection 2024',
      },
      midtransStatus: 'settlement',
    },
    {
      id: 'CAMPAIGN-1705023456-DEF456',
      type: 'CAMPAIGN_PAYMENT',
      amountIdr: 8000000,
      platformFeeIdr: 800000,
      totalAmountIdr: 8800000,
      status: 'PENDING',
      paymentMethod: 'MIDTRANS',
      description: 'Payment for campaign: Tech Product Review',
      createdAt: '2024-01-14T14:30:00Z',
      campaign: {
        id: '2',
        title: 'Tech Product Review',
      },
      midtransStatus: 'pending',
    },
    {
      id: 'CAMPAIGN-1704923456-GHI789',
      type: 'CAMPAIGN_PAYMENT',
      amountIdr: 5000000,
      platformFeeIdr: 500000,
      totalAmountIdr: 5500000,
      status: 'FAILED',
      paymentMethod: 'MIDTRANS',
      description: 'Payment for campaign: Food Delivery App',
      createdAt: '2024-01-13T09:15:00Z',
      campaign: {
        id: '3',
        title: 'Food Delivery App',
      },
      midtransStatus: 'expire',
    },
  ])

  const [filter, setFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'all' && transaction.status.toLowerCase() !== filter) return false
    if (typeFilter !== 'all' && transaction.type.toLowerCase() !== typeFilter.toLowerCase()) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SETTLEMENT':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CAMPAIGN_PAYMENT':
        return 'bg-indigo-100 text-indigo-800'
      case 'PROMOTION_PAYOUT':
        return 'bg-green-100 text-green-800'
      case 'WITHDRAWAL':
        return 'bg-purple-100 text-purple-800'
      case 'REFUND':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CAMPAIGN_PAYMENT':
        return 'Campaign Payment'
      case 'PROMOTION_PAYOUT':
        return 'Promotion Payout'
      case 'WITHDRAWAL':
        return 'Withdrawal'
      case 'REFUND':
        return 'Refund'
      default:
        return type
    }
  }

  const totalSpent = transactions
    .filter(t => t.type === 'CAMPAIGN_PAYMENT' && t.status === 'SETTLEMENT')
    .reduce((sum, t) => sum + t.totalAmountIdr, 0)

  const pendingAmount = transactions
    .filter(t => t.status === 'PENDING')
    .reduce((sum, t) => sum + t.totalAmountIdr, 0)

  return (
    <DashboardLayout>
      <Head>
        <title>Transactions - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Transaction History</h1>
            <p className="mt-1 text-sm text-gray-600">
              View your payment history and transaction details
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalSpent)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(pendingAmount)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                      <dd className="text-lg font-medium text-gray-900">{transactions.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="settlement">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="campaign_payment">Campaign Payment</option>
                    <option value="promotion_payout">Promotion Payout</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilter('all')
                      setTypeFilter('all')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                              {getTypeLabel(transaction.type)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Transaction ID: {transaction.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.totalAmountIdr)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: {formatCurrency(transaction.amountIdr)}
                        </p>
                        {transaction.platformFeeIdr > 0 && (
                          <p className="text-xs text-gray-400">
                            Fee: {formatCurrency(transaction.platformFeeIdr)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Created: {formatDate(transaction.createdAt, 'DISPLAY_WITH_TIME')}
                        </p>
                        {transaction.paidAt && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Paid: {formatDate(transaction.paidAt, 'DISPLAY_WITH_TIME')}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Payment Method: {transaction.paymentMethod}</p>
                      </div>
                    </div>

                    {transaction.campaign && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Campaign:</span> {transaction.campaign.title}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No transactions match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: `${process.env.NEXT_PUBLIC_AUTH_URL}/signin`,
        permanent: false,
      },
    }
  }

  return {
    props: {
      session,
    },
  }
}
