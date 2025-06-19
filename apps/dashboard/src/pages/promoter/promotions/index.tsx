import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { authOptions } from '../../../lib/auth'
import DashboardLayout from '../../../components/Layout/DashboardLayout'
import { formatCurrency, formatDate } from '@crebost/shared'

interface Promotion {
  id: string
  campaign: {
    id: string
    title: string
    creator: {
      name: string
      avatar?: string
    }
  }
  platform: string
  contentUrl: string
  proofUrl?: string
  viewersCount: number
  earningsIdr: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  submittedAt: string
  approvedAt?: string
  rejectionReason?: string
}

export default function MyPromotions() {
  const [promotions] = useState<Promotion[]>([
    {
      id: '1',
      campaign: {
        id: '1',
        title: 'Summer Fashion Collection 2024',
        creator: {
          name: 'Fashion Brand Co.',
          avatar: '/avatars/fashion-brand.jpg',
        },
      },
      platform: 'TIKTOK',
      contentUrl: 'https://tiktok.com/@user/video/123',
      proofUrl: 'https://example.com/proof1.jpg',
      viewersCount: 15420,
      earningsIdr: 23130000,
      status: 'COMPLETED',
      submittedAt: '2024-01-10T10:00:00Z',
      approvedAt: '2024-01-11T14:30:00Z',
    },
    {
      id: '2',
      campaign: {
        id: '2',
        title: 'Tech Product Review Campaign',
        creator: {
          name: 'TechCorp',
          avatar: '/avatars/techcorp.jpg',
        },
      },
      platform: 'YOUTUBE',
      contentUrl: 'https://youtube.com/watch?v=abc123',
      proofUrl: 'https://example.com/proof2.jpg',
      viewersCount: 8750,
      earningsIdr: 10500000,
      status: 'APPROVED',
      submittedAt: '2024-01-15T09:00:00Z',
      approvedAt: '2024-01-16T11:00:00Z',
    },
    {
      id: '3',
      campaign: {
        id: '3',
        title: 'Food Delivery App Promotion',
        creator: {
          name: 'FoodieApp',
          avatar: '/avatars/foodieapp.jpg',
        },
      },
      platform: 'INSTAGRAM',
      contentUrl: 'https://instagram.com/p/abc123',
      proofUrl: 'https://example.com/proof3.jpg',
      viewersCount: 0,
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
          avatar: '/avatars/fashion-brand.jpg',
        },
      },
      platform: 'INSTAGRAM',
      contentUrl: 'https://instagram.com/p/def456',
      viewersCount: 0,
      earningsIdr: 0,
      status: 'REJECTED',
      submittedAt: '2024-01-12T14:00:00Z',
      rejectionReason: 'Content does not meet campaign requirements. Please ensure hashtags are included.',
    },
  ])

  const [filter, setFilter] = useState<string>('all')

  const filteredPromotions = promotions.filter(promotion => {
    if (filter === 'all') return true
    return promotion.status.toLowerCase() === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
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

  const totalEarnings = promotions
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.earningsIdr, 0)

  const pendingEarnings = promotions
    .filter(p => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.earningsIdr, 0)

  return (
    <DashboardLayout>
      <Head>
        <title>My Promotions - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">My Promotions</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track your promotional campaigns and earnings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {promotions.filter(p => p.status === 'COMPLETED').length}
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalEarnings)}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Earnings</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(pendingEarnings)}</dd>
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
                  { key: 'all', label: 'All Promotions' },
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
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
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
                        <img
                          className="h-10 w-10 rounded-full"
                          src={promotion.campaign.creator.avatar || '/default-avatar.png'}
                          alt={promotion.campaign.creator.name}
                        />
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {promotion.campaign.title}
                            </p>
                            <span className="ml-2 text-lg">{getPlatformIcon(promotion.platform)}</span>
                          </div>
                          <p className="text-sm text-gray-500">{promotion.campaign.creator.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {promotion.earningsIdr > 0 ? formatCurrency(promotion.earningsIdr) : '-'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {promotion.viewersCount > 0 ? `${promotion.viewersCount.toLocaleString()} views` : 'No views yet'}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                          {promotion.status}
                        </span>
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

                    {promotion.status === 'PENDING' && (
                      <div className="mt-3 flex space-x-3">
                        <Link
                          href={`/promoter/promotions/${promotion.id}/edit`}
                          className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                        >
                          Edit Submission
                        </Link>
                        <button className="text-sm border border-red-600 text-red-600 px-3 py-1 rounded-md hover:bg-red-50">
                          Cancel
                        </button>
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
                {filter === 'all' 
                  ? "You haven't submitted any promotions yet."
                  : `No promotions with status "${filter}" found.`
                }
              </p>
              <div className="mt-6">
                <Link
                  href="/campaigns"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Available Campaigns
                </Link>
              </div>
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

  if (session.user.role !== 'PROMOTER' && session.user.role !== 'ADMIN') {
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
