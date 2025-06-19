import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import { useState } from 'react'
import { authOptions } from '../../lib/auth'
import AdminLayout from '../../components/Layout/AdminLayout'
import { formatCurrency, formatDate } from '@crebost/shared'

interface WithdrawalRequest {
  id: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  amountIdr: number
  adminFeeIdr: number
  netAmountIdr: number
  bankName: string
  accountNumber: string
  accountName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  notes?: string
  createdAt: string
  processedAt?: string
  processedBy?: {
    name: string
  }
}

export default function WithdrawalsManagement() {
  const [withdrawals] = useState<WithdrawalRequest[]>([
    {
      id: '1',
      user: {
        id: '2',
        name: 'Sarah Kim',
        email: 'sarah@example.com',
        role: 'PROMOTER',
      },
      amountIdr: 2500000,
      adminFeeIdr: 62500,
      netAmountIdr: 2437500,
      bankName: 'Bank BCA',
      accountNumber: '1234567890',
      accountName: 'Sarah Kim',
      status: 'PENDING',
      createdAt: '2024-01-20T10:00:00Z',
    },
    {
      id: '2',
      user: {
        id: '4',
        name: 'Lisa Chen',
        email: 'lisa@example.com',
        role: 'PROMOTER',
      },
      amountIdr: 1500000,
      adminFeeIdr: 37500,
      netAmountIdr: 1462500,
      bankName: 'Bank Mandiri',
      accountNumber: '9876543210',
      accountName: 'Lisa Chen',
      status: 'APPROVED',
      createdAt: '2024-01-19T14:30:00Z',
      processedAt: '2024-01-19T16:45:00Z',
      processedBy: {
        name: 'Admin User',
      },
    },
    {
      id: '3',
      user: {
        id: '6',
        name: 'Tom Wilson',
        email: 'tom@example.com',
        role: 'PROMOTER',
      },
      amountIdr: 800000,
      adminFeeIdr: 20000,
      netAmountIdr: 780000,
      bankName: 'Bank BRI',
      accountNumber: '5555666677',
      accountName: 'Tom Wilson',
      status: 'COMPLETED',
      createdAt: '2024-01-18T09:15:00Z',
      processedAt: '2024-01-18T11:30:00Z',
      processedBy: {
        name: 'Admin User',
      },
    },
    {
      id: '4',
      user: {
        id: '7',
        name: 'Anna Davis',
        email: 'anna@example.com',
        role: 'PROMOTER',
      },
      amountIdr: 300000,
      adminFeeIdr: 7500,
      netAmountIdr: 292500,
      bankName: 'Bank BNI',
      accountNumber: '1111222233',
      accountName: 'Anna Davis',
      status: 'REJECTED',
      notes: 'Insufficient balance verification',
      createdAt: '2024-01-17T13:20:00Z',
      processedAt: '2024-01-17T15:45:00Z',
      processedBy: {
        name: 'Admin User',
      },
    },
  ])

  const [filter, setFilter] = useState<string>('all')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | null, withdrawal: WithdrawalRequest | null }>({ type: null, withdrawal: null })
  const [actionNotes, setActionNotes] = useState('')

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (filter === 'all') return true
    return withdrawal.status.toLowerCase() === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAction = (type: 'approve' | 'reject', withdrawal: WithdrawalRequest) => {
    setActionModal({ type, withdrawal })
    setActionNotes('')
  }

  const confirmAction = () => {
    if (!actionModal.withdrawal) return
    
    console.log(`${actionModal.type} withdrawal ${actionModal.withdrawal.id}`, {
      notes: actionNotes,
    })
    
    // Here you would make API call to process the withdrawal
    setActionModal({ type: null, withdrawal: null })
    setActionNotes('')
  }

  const totalPendingAmount = withdrawals
    .filter(w => w.status === 'PENDING')
    .reduce((sum, w) => sum + w.netAmountIdr, 0)

  const totalProcessedToday = withdrawals
    .filter(w => w.processedAt && new Date(w.processedAt).toDateString() === new Date().toDateString())
    .reduce((sum, w) => sum + w.netAmountIdr, 0)

  return (
    <AdminLayout>
      <Head>
        <title>Withdrawals Management - Crebost Admin</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Withdrawals Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and process withdrawal requests from promoters
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {withdrawals.filter(w => w.status === 'PENDING').length}
                      </dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalPendingAmount)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Processed Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalProcessedToday)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                      <dd className="text-lg font-medium text-gray-900">{withdrawals.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Requests' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'rejected', label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`${
                      filter === tab.key
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Withdrawals List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredWithdrawals.map((withdrawal) => (
                <li key={withdrawal.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {withdrawal.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {withdrawal.user.name}
                            </p>
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                              {withdrawal.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{withdrawal.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(withdrawal.netAmountIdr)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Gross: {formatCurrency(withdrawal.amountIdr)}
                          </p>
                        </div>
                        {withdrawal.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction('approve', withdrawal)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction('reject', withdrawal)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {withdrawal.bankName} - {withdrawal.accountNumber}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {withdrawal.accountName}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>
                          Requested on {formatDate(withdrawal.createdAt, 'DISPLAY_WITH_TIME')}
                        </p>
                      </div>
                    </div>

                    {withdrawal.notes && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {withdrawal.notes}
                        </p>
                      </div>
                    )}

                    {withdrawal.processedAt && withdrawal.processedBy && (
                      <div className="mt-3 text-sm text-gray-500">
                        Processed by {withdrawal.processedBy.name} on {formatDate(withdrawal.processedAt, 'DISPLAY_WITH_TIME')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {filteredWithdrawals.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawal requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? "No withdrawal requests have been submitted yet."
                  : `No withdrawal requests with status "${filter}" found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.type && actionModal.withdrawal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionModal.type === 'approve' ? 'Approve' : 'Reject'} Withdrawal Request
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  User: <span className="font-medium">{actionModal.withdrawal.user.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Amount: <span className="font-medium">{formatCurrency(actionModal.withdrawal.netAmountIdr)}</span>
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes {actionModal.type === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={actionModal.type === 'approve' ? 'Optional notes...' : 'Reason for rejection...'}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={confirmAction}
                  disabled={actionModal.type === 'reject' && !actionNotes.trim()}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white ${
                    actionModal.type === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Confirm {actionModal.type === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => setActionModal({ type: null, withdrawal: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
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

  if (session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/unauthorized',
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
