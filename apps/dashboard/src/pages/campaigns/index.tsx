import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { authOptions } from '../../lib/auth'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import { formatCurrency, formatDate } from '@crebost/shared'

interface Campaign {
  id: string
  title: string
  description: string
  budgetIdr: number
  ratePerViewerIdr: number
  targetViewers: number
  currentViewers: number
  requirements: {
    platform: string
    minFollowers: number
    contentType: string[]
    description: string
  }[]
  endDate: string
  creator: {
    name: string
    avatar?: string
  }
}

export default function AvailableCampaigns() {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Summer Fashion Collection 2024',
      description: 'Promote our latest summer fashion collection targeting young adults aged 18-25. Looking for influencers with fashion-focused content.',
      budgetIdr: 15000000,
      ratePerViewerIdr: 1500,
      targetViewers: 100000,
      currentViewers: 75432,
      requirements: [
        {
          platform: 'TIKTOK',
          minFollowers: 10000,
          contentType: ['POST', 'STORY'],
          description: 'Create engaging TikTok content showcasing our summer collection',
        },
        {
          platform: 'INSTAGRAM',
          minFollowers: 5000,
          contentType: ['POST', 'STORY', 'REEL'],
          description: 'Instagram posts and stories featuring our products',
        },
      ],
      endDate: '2024-02-15T23:59:59Z',
      creator: {
        name: 'Fashion Brand Co.',
        avatar: '/avatars/fashion-brand.jpg',
      },
    },
    {
      id: '2',
      title: 'Tech Product Review Campaign',
      description: 'Looking for tech reviewers to showcase our new smartphone. Must have experience with tech content and honest reviews.',
      budgetIdr: 8000000,
      ratePerViewerIdr: 1200,
      targetViewers: 50000,
      currentViewers: 25000,
      requirements: [
        {
          platform: 'YOUTUBE',
          minFollowers: 15000,
          contentType: ['VIDEO'],
          description: 'Create detailed review video of our smartphone',
        },
        {
          platform: 'TIKTOK',
          minFollowers: 8000,
          contentType: ['VIDEO'],
          description: 'Short-form tech review content',
        },
      ],
      endDate: '2024-01-31T23:59:59Z',
      creator: {
        name: 'TechCorp',
        avatar: '/avatars/techcorp.jpg',
      },
    },
    {
      id: '3',
      title: 'Food Delivery App Promotion',
      description: 'Promote our new food delivery app in Jakarta area. Looking for food bloggers and lifestyle influencers.',
      budgetIdr: 12000000,
      ratePerViewerIdr: 1800,
      targetViewers: 80000,
      currentViewers: 10000,
      requirements: [
        {
          platform: 'INSTAGRAM',
          minFollowers: 5000,
          contentType: ['POST', 'STORY'],
          description: 'Show the app ordering process and food delivery experience',
        },
        {
          platform: 'TIKTOK',
          minFollowers: 3000,
          contentType: ['VIDEO'],
          description: 'Creative content showing app features',
        },
      ],
      endDate: '2024-03-01T23:59:59Z',
      creator: {
        name: 'FoodieApp',
        avatar: '/avatars/foodieapp.jpg',
      },
    },
  ])

  const [filters, setFilters] = useState({
    platform: 'all',
    minBudget: '',
    maxBudget: '',
    sortBy: 'newest',
  })

  const [searchQuery, setSearchQuery] = useState('')

  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    if (searchQuery && !campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !campaign.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Platform filter
    if (filters.platform !== 'all') {
      const hasMatchingPlatform = campaign.requirements.some(req => 
        req.platform.toLowerCase() === filters.platform.toLowerCase()
      )
      if (!hasMatchingPlatform) return false
    }

    // Budget filters
    if (filters.minBudget && campaign.budgetIdr < Number(filters.minBudget)) return false
    if (filters.maxBudget && campaign.budgetIdr > Number(filters.maxBudget)) return false

    return true
  })

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (filters.sortBy) {
      case 'budget_high':
        return b.budgetIdr - a.budgetIdr
      case 'budget_low':
        return a.budgetIdr - b.budgetIdr
      case 'rate_high':
        return b.ratePerViewerIdr - a.ratePerViewerIdr
      case 'rate_low':
        return a.ratePerViewerIdr - b.ratePerViewerIdr
      case 'ending_soon':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      default: // newest
        return b.id.localeCompare(a.id)
    }
  })

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

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Available Campaigns - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Available Campaigns</h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse and apply to promotional campaigns that match your audience
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Campaigns
                </label>
                <input
                  type="text"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.platform}
                  onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                >
                  <option value="all">All Platforms</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Budget (IDR)
                </label>
                <input
                  type="number"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                  value={filters.minBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  <option value="newest">Newest First</option>
                  <option value="budget_high">Highest Budget</option>
                  <option value="budget_low">Lowest Budget</option>
                  <option value="rate_high">Highest Rate</option>
                  <option value="rate_low">Lowest Rate</option>
                  <option value="ending_soon">Ending Soon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {sortedCampaigns.length} of {campaigns.length} campaigns
            </p>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={campaign.creator.avatar || '/default-avatar.png'}
                        alt={campaign.creator.name}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{campaign.creator.name}</p>
                        <p className="text-sm text-gray-500">Campaign Creator</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{formatCurrency(campaign.ratePerViewerIdr)}/view</p>
                      <p className="text-xs text-gray-500">Rate</p>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>

                  {/* Platforms */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {campaign.requirements.map((req, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        <span className="mr-1">{getPlatformIcon(req.platform)}</span>
                        {req.platform}
                        <span className="ml-1 text-blue-600">({req.minFollowers.toLocaleString()}+ followers)</span>
                      </span>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{campaign.currentViewers.toLocaleString()} / {campaign.targetViewers.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(campaign.currentViewers, campaign.targetViewers)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(campaign.budgetIdr)}</p>
                      <p className="text-xs text-gray-500">Total Budget</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{campaign.targetViewers.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Target Views</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(campaign.endDate, 'DISPLAY')}</p>
                      <p className="text-xs text-gray-500">Ends</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="flex-1 bg-indigo-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/campaigns/${campaign.id}/apply`}
                      className="flex-1 border border-indigo-600 text-indigo-600 text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedCampaigns.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
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
