import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { authOptions } from '../../lib/auth'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import { formatCurrency, formatAnalyticsNumber } from '@crebost/shared'

interface AnalyticsData {
  overview: {
    totalCampaigns: number
    activeCampaigns: number
    totalSpent: number
    totalViews: number
    totalEngagement: number
    averageEngagementRate: number
  }
  campaignPerformance: {
    campaignId: string
    title: string
    views: number
    engagement: number
    engagementRate: number
    spent: number
    roi: number
  }[]
  platformBreakdown: {
    platform: string
    campaigns: number
    views: number
    engagement: number
    averageEngagementRate: number
  }[]
  timeSeriesData: {
    date: string
    views: number
    engagement: number
    spend: number
  }[]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [selectedMetric, setSelectedMetric] = useState('views')

  useEffect(() => {
    fetchAnalyticsData()
  }, [period])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/overview?period=${period}`)
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    overview: {
      totalCampaigns: 12,
      activeCampaigns: 5,
      totalSpent: 125000000,
      totalViews: 2450000,
      totalEngagement: 185000,
      averageEngagementRate: 7.55,
    },
    campaignPerformance: [
      {
        campaignId: '1',
        title: 'Summer Fashion Collection 2024',
        views: 850000,
        engagement: 68000,
        engagementRate: 8.0,
        spent: 45000000,
        roi: 2.3,
      },
      {
        campaignId: '2',
        title: 'Tech Product Review',
        views: 620000,
        engagement: 42000,
        engagementRate: 6.8,
        spent: 32000000,
        roi: 1.9,
      },
      {
        campaignId: '3',
        title: 'Food Delivery App',
        views: 480000,
        engagement: 38000,
        engagementRate: 7.9,
        spent: 28000000,
        roi: 2.1,
      },
    ],
    platformBreakdown: [
      {
        platform: 'TikTok',
        campaigns: 8,
        views: 1200000,
        engagement: 96000,
        averageEngagementRate: 8.0,
      },
      {
        platform: 'Instagram',
        campaigns: 6,
        views: 750000,
        engagement: 52500,
        averageEngagementRate: 7.0,
      },
      {
        platform: 'YouTube',
        campaigns: 4,
        views: 500000,
        engagement: 36500,
        averageEngagementRate: 7.3,
      },
    ],
    timeSeriesData: [
      { date: '2024-01-01', views: 45000, engagement: 3200, spend: 2500000 },
      { date: '2024-01-02', views: 52000, engagement: 3800, spend: 3200000 },
      { date: '2024-01-03', views: 48000, engagement: 3500, spend: 2800000 },
      { date: '2024-01-04', views: 61000, engagement: 4200, spend: 3800000 },
      { date: '2024-01-05', views: 58000, engagement: 4000, spend: 3500000 },
      { date: '2024-01-06', views: 65000, engagement: 4800, spend: 4200000 },
      { date: '2024-01-07', views: 72000, engagement: 5200, spend: 4500000 },
    ],
  }

  const data = analyticsData || mockData

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

  return (
    <DashboardLayout>
      <Head>
        <title>Analytics - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Track your campaign performance and audience engagement
                </p>
              </div>
              <div className="flex space-x-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="day">Last 24 Hours</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                          <dd className="text-lg font-medium text-gray-900">{data.overview.totalCampaigns}</dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <span className="text-green-600">{data.overview.activeCampaigns}</span> Active
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Views</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatAnalyticsNumber(data.overview.totalViews)}</dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <span className="text-green-600">+12.5%</span> from last period
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Engagement</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatAnalyticsNumber(data.overview.totalEngagement)}</dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <span className="text-green-600">{data.overview.averageEngagementRate.toFixed(1)}%</span> avg rate
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                          <dd className="text-lg font-medium text-gray-900">{formatCurrency(data.overview.totalSpent)}</dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <span className="text-blue-600">{formatCurrency(data.overview.totalSpent / data.overview.totalViews)}</span> per view
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Performance Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
                    <select
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="views">Views</option>
                      <option value="engagement">Engagement</option>
                      <option value="spend">Spend</option>
                    </select>
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">Chart visualization would go here</p>
                    <p className="text-xs text-gray-400 ml-2">(Integration with Chart.js or similar)</p>
                  </div>
                </div>

                {/* Platform Breakdown */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Performance</h3>
                  <div className="space-y-4">
                    {data.platformBreakdown.map((platform) => (
                      <div key={platform.platform} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getPlatformIcon(platform.platform)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{platform.platform}</p>
                            <p className="text-xs text-gray-500">{platform.campaigns} campaigns</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatAnalyticsNumber(platform.views)} views
                          </p>
                          <p className="text-xs text-gray-500">
                            {platform.averageEngagementRate.toFixed(1)}% engagement
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campaign Performance Table */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Top Performing Campaigns
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Engagement
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Engagement Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ROI
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.campaignPerformance.map((campaign) => (
                          <tr key={campaign.campaignId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatAnalyticsNumber(campaign.views)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatAnalyticsNumber(campaign.engagement)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{campaign.engagementRate.toFixed(1)}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(campaign.spent)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                campaign.roi >= 2 ? 'text-green-600' : 
                                campaign.roi >= 1.5 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {campaign.roi.toFixed(1)}x
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
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
