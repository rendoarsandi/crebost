import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { authOptions } from '../../../lib/auth'
import DashboardLayout from '../../../components/Layout/DashboardLayout'
import { formatCurrency, formatDate } from '@crebost/shared'

interface Campaign {
  id: string
  title: string
  description: string
  budgetIdr: number
  targetViewers: number
  currentViewers: number
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  endDate: string
}

export default function CreatorCampaigns() {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Summer Fashion Collection 2024',
      description: 'Promote our latest summer fashion collection targeting young adults',
      budgetIdr: 15000000,
      targetViewers: 100000,
      currentViewers: 75432,
      status: 'ACTIVE',
      createdAt: '2024-01-15T10:00:00Z',
      endDate: '2024-02-15T23:59:59Z',
    },
    {
      id: '2',
      title: 'Tech Product Review',
      description: 'Review and promote our new smartphone model',
      budgetIdr: 8000000,
      targetViewers: 50000,
      currentViewers: 50000,
      status: 'COMPLETED',
      createdAt: '2024-01-01T10:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
    },
    {
      id: '3',
      title: 'Food Delivery App Launch',
      description: 'Promote our new food delivery app in Jakarta area',
      budgetIdr: 12000000,
      targetViewers: 80000,
      currentViewers: 0,
      status: 'DRAFT',
      createdAt: '2024-01-20T10:00:00Z',
      endDate: '2024-03-01T23:59:59Z',
    },
  ])

  const [filter, setFilter] = useState<string>('all')

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true
    return campaign.status.toLowerCase() === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <DashboardLayout>
      <Head>
        <title>My Campaigns - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">My Campaigns</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and monitor your promotional campaigns
                </p>
              </div>
              <Link
                href="/creator/campaigns/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Campaign
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Campaigns' },
                  { key: 'active', label: 'Active' },
                  { key: 'draft', label: 'Draft' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'paused', label: 'Paused' },
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

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        href={`/creator/campaigns/${campaign.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/creator/campaigns/${campaign.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget:</span>
                      <span className="font-medium">{formatCurrency(campaign.budgetIdr)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress:</span>
                      <span className="font-medium">
                        {campaign.currentViewers.toLocaleString()} / {campaign.targetViewers.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(campaign.currentViewers, campaign.targetViewers)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{formatDate(campaign.createdAt)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ends:</span>
                      <span className="font-medium">{formatDate(campaign.endDate)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <Link
                      href={`/creator/campaigns/${campaign.id}`}
                      className="flex-1 bg-indigo-600 text-white text-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      View Details
                    </Link>
                    {campaign.status === 'ACTIVE' && (
                      <button className="flex-1 bg-gray-200 text-gray-800 text-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-300">
                        Pause
                      </button>
                    )}
                    {campaign.status === 'DRAFT' && (
                      <button className="flex-1 bg-green-600 text-white text-center px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? "You haven't created any campaigns yet."
                  : `No campaigns with status "${filter}" found.`
                }
              </p>
              <div className="mt-6">
                <Link
                  href="/creator/campaigns/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create your first campaign
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

  if (session.user.role !== 'CREATOR' && session.user.role !== 'ADMIN') {
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
