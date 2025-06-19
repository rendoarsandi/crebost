import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import { useState } from 'react'
import { authOptions } from '../../lib/auth'
import AdminLayout from '../../components/Layout/AdminLayout'
import { formatCurrency, formatDate } from '@crebost/shared'

interface Promotion {
  id: string
  campaign: {
    id: string
    title: string
    creator: {
      name: string
    }
  }
  promoter: {
    id: string
    name: string
    email: string
  }
  platform: string
  contentUrl: string
  proofUrl?: string
  estimatedReach: number
  actualViews: number
  earningsIdr: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: {
    name: string
  }
  rejectionReason?: string
  metrics?: {
    views: number
    likes: number
    comments: number
    shares: number
    engagementRate: number
  }
}

export default function PromotionsManagement() {
  const [promotions] = useState<Promotion[]>([
    {
      id: '1',
      campaign: {
        id: '1',
        title: 'Summer Fashion Collection 2024',
        creator: {
          name: 'Fashion Brand Co.',
        },
      },
      promoter: {
        id: '2',
        name: 'Sarah Kim',
        email: 'sarah@example.com',
      },
      platform: 'TIKTOK',
      contentUrl: 'https://tiktok.com/@user/video/123',
      proofUrl: 'https://example.com/proof1.jpg',
      estimatedReach: 15000,
      actualViews: 15420,
      earningsIdr: 2313000,
      status: 'COMPLETED',
      submittedAt: '2024-01-10T10:00:00Z',
      reviewedAt: '2024-01-11T14:30:00Z',
      reviewedBy: {
        name: 'Admin User',
      },
      metrics: {
        views: 15420,
        likes: 1250,
        comments: 89,
        shares: 156,
        engagementRate: 9.8,
      },
    },
    {
      id: '2',
      campaign: {
        id: '2',
        title: 'Tech Product Review Campaign',
        creator: {
          name: 'TechCorp',
        },
      },
      promoter: {
        id: '4',
        name: 'Lisa Chen',
        email: 'lisa@example.com',
      },
      platform: 'YOUTUBE',
      contentUrl: 'https://youtube.com/watch?v=abc123',
      proofUrl: 'https://example.com/proof2.jpg',
      estimatedReach: 8000,
      actualViews: 8750,
      earningsIdr: 1050000,
      status: 'APPROVED',
      submittedAt: '2024-01-15T09:00:00Z',
      reviewedAt: '2024-01-16T11:00:00Z',
      reviewedBy: {
        name: 'Admin User',
      },
      metrics: {
        views: 8750,
        likes: 567,
        comments: 43,
        shares: 78,
        engagementRate: 8.3,
      },
    },
    {
      id: '3',
      campaign: {
        id: '3',
        title: 'Food Delivery App Promotion',
        creator: {
          name: 'FoodieApp',
        },
      },
      promoter: {
        id: '6',
        name: 'Tom Wilson',
        email: 'tom@example.com',
      },
      platform: 'INSTAGRAM',
      contentUrl: 'https://instagram.com/p/abc123',
      proofUrl: 'https://example.com/proof3.jpg',
      estimatedReach: 5000,
      actualViews: 0,
      earningsIdr: 0,
      status: 'PENDING',
      submittedAt: '2024-01-18T16:00:00Z',
    },
    {
      id: '4',
      campaign: {
        id: '1',
        title: 'Summer Fashion Collection 2024',
        creator: {
          name: 'Fashion Brand Co.',
        },
      },
      promoter: {
        id: '7',
        name: 'Anna Davis',
        email: 'anna@example.com',
      },
      platform: 'INSTAGRAM',
      contentUrl: 'https://instagram.com/p/def456',
      estimatedReach: 3000,
      actualViews: 0,
      earningsIdr: 0,
      status: 'REJECTED',
      submittedAt: '2024-01-12T14:00:00Z',
      reviewedAt: '2024-01-13T10:30:00Z',
      reviewedBy: {
        name: 'Admin User',
      },
      rejectionReason: 'Content does not meet campaign requirements. Please ensure hashtags are included.',
    },
  ])

  const [filter, setFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject' | null, promotion: Promotion | null }>({ type: null, promotion: null })
  const [rejectionReason, setRejectionReason] = useState('')

  const filteredPromotions = promotions.filter(promotion => {
    if (filter !== 'all' && promotion.status.toLowerCase() !== filter) return false
    if (platformFilter !== 'all' && promotion.platform.toLowerCase() !== platformFilter) return false
    return true
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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok':
        return '🎵'
      case 'instagram':
        return '📷'
      case 'youtube':
        return '📺'
      case 'twitter':
        return '🐦'
      case 'facebook':
        return '👥'
      default:
        return '📱'
    }
  }

  const handleAction = (type: 'approve' | 'reject', promotion: Promotion) => {
    setActionModal({ type, promotion })
    setRejectionReason('')
  }

  const confirmAction = () => {
    if (!actionModal.promotion) return
    if (actionModal.type === 'reject' && !rejectionReason.trim()) return
    
    console.log(`${actionModal.type} promotion ${actionModal.promotion.id}`, {
      rejectionReason: actionModal.type === 'reject' ? rejectionReason : undefined,
    })
    
    // Here you would make API call to process the promotion
    setActionModal({ type: null, promotion: null })
    setRejectionReason('')
  }

  const pendingPromotions = promotions.filter(p => p.status === 'PENDING').length
  const totalEarnings = promotions
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.earningsIdr, 0)
  const totalViews = promotions
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.actualViews, 0)

  return (
    <AdminLayout>
      <Head>
        <title>Promotions Management - Crebost Admin</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Promotions Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and approve promotion submissions from promoters
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                      <dd className="text-lg font-medium text-gray-900">{pendingPromotions}</dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Promotions</dt>
                      <dd className="text-lg font-medium text-gray-900">{promotions.length}</dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                      <dd className="text-lg font-medium text-gray-900">{totalViews.toLocaleString()}</dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalEarnings)}</dd>
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
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                  >
                    <option value="all">All Platforms</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilter('all')
                      setPlatformFilter('all')
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Promotions List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredPromotions.map((promotion) => (
                <li key={promotion.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getPlatformIcon(promotion.platform)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {promotion.campaign.title}
                            </p>
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                              {promotion.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            by {promotion.promoter.name} • {promotion.platform}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {promotion.actualViews > 0 ? promotion.actualViews.toLocaleString() : promotion.estimatedReach.toLocaleString()} views
                          </p>
                          <p className="text-sm text-gray-500">
                            {promotion.earningsIdr > 0 ? formatCurrency(promotion.earningsIdr) : 'No earnings yet'}
                          </p>
                        </div>
                        {promotion.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAction('approve', promotion)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction('reject', promotion)}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <a href={promotion.contentUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                            View Content
                          </a>
                        </p>
                        {promotion.proofUrl && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <a href={promotion.proofUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">
                              View Proof
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>
                          Submitted on {formatDate(promotion.submittedAt, 'DISPLAY_WITH_TIME')}
                        </p>
                      </div>
                    </div>

                    {promotion.status === 'REJECTED' && promotion.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                          <svg className="flex-shrink-0 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
                            <p className="mt-1 text-sm text-red-700">{promotion.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {promotion.reviewedAt && promotion.reviewedBy && (
                      <div className="mt-3 text-sm text-gray-500">
                        Reviewed by {promotion.reviewedBy.name} on {formatDate(promotion.reviewedAt, 'DISPLAY_WITH_TIME')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {filteredPromotions.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No promotions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No promotions match your current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.type && actionModal.promotion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionModal.type === 'approve' ? 'Approve' : 'Reject'} Promotion
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Campaign: <span className="font-medium">{actionModal.promotion.campaign.title}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Promoter: <span className="font-medium">{actionModal.promotion.promoter.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Platform: <span className="font-medium">{actionModal.promotion.platform}</span>
                </p>
              </div>
              {actionModal.type === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Explain why this promotion is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={confirmAction}
                  disabled={actionModal.type === 'reject' && !rejectionReason.trim()}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white ${
                    actionModal.type === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Confirm {actionModal.type === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => setActionModal({ type: null, promotion: null })}
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
