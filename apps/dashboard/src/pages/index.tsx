import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { authOptions } from '../lib/auth'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { formatCurrency } from '@crebost/shared'
import { Button } from '@crebost/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crebost/ui'
import { Badge } from '@crebost/ui'
import { Separator } from '@crebost/ui'

export default function Dashboard() {
  const { data: session } = useSession()

  const stats = {
    creator: {
      totalCampaigns: 5,
      activeCampaigns: 2,
      totalSpent: 75000000, // IDR
      totalViews: 125000,
    },
    promoter: {
      totalPromotions: 12,
      activePromotions: 3,
      totalEarnings: 2500000, // IDR
      completionRate: 95,
    },
  }

  const recentActivity = [
    {
      id: 1,
      type: 'campaign_created',
      title: 'New campaign "Summer Collection" created',
      time: '2 hours ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'promotion_submitted',
      title: 'Promotion proof submitted for "Tech Review"',
      time: '4 hours ago',
      status: 'pending',
    },
    {
      id: 3,
      type: 'payment_received',
      title: 'Payment received: Rp 150,000',
      time: '1 day ago',
      status: 'success',
    },
  ]

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Here's what's happening with your {session?.user?.role?.toLowerCase()} account today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {session?.user?.role === 'CREATOR' && (
              <>
                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                        <p className="text-2xl font-bold text-foreground">{stats.creator.totalCampaigns}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                        <p className="text-2xl font-bold text-foreground">{stats.creator.activeCampaigns}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.creator.totalSpent)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold text-foreground">{stats.creator.totalViews.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {session?.user?.role === 'PROMOTER' && (
              <>
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
                          <dd className="text-lg font-medium text-gray-900">{stats.promoter.totalPromotions}</dd>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Promotions</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.promoter.activePromotions}</dd>
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
                          <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.promoter.totalEarnings)}</dd>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.promoter.completionRate}%</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {session?.user?.role === 'CREATOR' && (
                    <>
                      <Button asChild>
                        <Link href="/creator/campaigns/new">
                          Create Campaign
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/analytics">
                          View Analytics
                        </Link>
                      </Button>
                    </>
                  )}
                  {session?.user?.role === 'PROMOTER' && (
                    <>
                      <Button asChild>
                        <Link href="/campaigns">
                          Browse Campaigns
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/withdrawals">
                          Request Withdrawal
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, activityIdx) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            activity.status === 'success' ? 'success' :
                            activity.status === 'pending' ? 'warning' : 'secondary'
                          }
                          className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
