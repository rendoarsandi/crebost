import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'
import Link from 'next/link'
import { authOptions } from '../lib/auth'
import AdminLayout from '../components/Layout/AdminLayout'
import { formatCurrency } from '@crebost/shared'
import { Button } from '@crebost/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crebost/ui'
import { Badge } from '@crebost/ui'
import { Alert, AlertDescription } from '@crebost/ui'

export default function AdminDashboard() {
  const stats = {
    totalUsers: 1247,
    totalCreators: 342,
    totalPromoters: 905,
    activeCampaigns: 23,
    totalCampaigns: 156,
    pendingPromotions: 45,
    totalPromotions: 892,
    pendingWithdrawals: 12,
    totalRevenue: 125000000, // IDR
    monthlyRevenue: 18500000, // IDR
    pendingReports: 8,
    totalReports: 67,
  }

  const recentActivity = [
    {
      id: 1,
      type: 'user_registered',
      title: 'New user registered: John Doe (Creator)',
      time: '5 minutes ago',
      status: 'info',
    },
    {
      id: 2,
      type: 'withdrawal_requested',
      title: 'Withdrawal request: Rp 2,500,000 by Sarah Kim',
      time: '15 minutes ago',
      status: 'warning',
    },
    {
      id: 3,
      type: 'campaign_completed',
      title: 'Campaign "Summer Fashion" completed successfully',
      time: '1 hour ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'report_submitted',
      title: 'New report submitted against user @techreviewer',
      time: '2 hours ago',
      status: 'error',
    },
    {
      id: 5,
      type: 'promotion_approved',
      title: 'Promotion approved for "Tech Product Review"',
      time: '3 hours ago',
      status: 'success',
    },
  ]

  const pendingActions = [
    {
      id: 1,
      type: 'withdrawal',
      title: 'Withdrawal Request',
      description: 'Rp 2,500,000 - Sarah Kim',
      action: 'Review',
      href: '/withdrawals',
      urgent: true,
    },
    {
      id: 2,
      type: 'report',
      title: 'User Report',
      description: 'Spam complaint against @techreviewer',
      action: 'Investigate',
      href: '/reports',
      urgent: true,
    },
    {
      id: 3,
      type: 'promotion',
      title: 'Promotion Review',
      description: '12 promotions pending approval',
      action: 'Review',
      href: '/promotions',
      urgent: false,
    },
    {
      id: 4,
      type: 'campaign',
      title: 'Campaign Verification',
      description: '3 campaigns need verification',
      action: 'Verify',
      href: '/campaigns',
      urgent: false,
    },
  ]

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - Crebost</title>
      </Head>

      <div className="py-6">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Overview of platform activity and pending actions
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Stats */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="text-green-600 font-medium">{stats.totalCreators}</span> Creators, <span className="text-blue-600 font-medium">{stats.totalPromoters}</span> Promoters
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Stats */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Campaigns</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalCampaigns}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="text-green-600 font-medium">{stats.activeCampaigns}</span> Active
                </div>
              </CardContent>
            </Card>

            {/* Promotions Stats */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Promotions</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalPromotions}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="text-yellow-600 font-medium">{stats.pendingPromotions}</span> Pending Review
                </div>
              </CardContent>
            </Card>

            {/* Revenue Stats */}
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <span className="text-green-600 font-medium">{formatCurrency(stats.monthlyRevenue)}</span> This Month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                  <CardDescription>Items that require your immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingActions.map((action) => (
                      <Alert
                        key={action.id}
                        variant={action.urgent ? 'destructive' : 'default'}
                        className="p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">
                                {action.title}
                              </h4>
                              {action.urgent && (
                                <Badge variant="destructive">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <AlertDescription className="mt-1">
                              {action.description}
                            </AlertDescription>
                          </div>
                          <div className="ml-4">
                            <Button
                              variant={action.urgent ? 'destructive' : 'default'}
                              size="sm"
                              asChild
                            >
                              <Link href={action.href}>
                                {action.action}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform events and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Badge
                            variant={
                              activity.status === 'success' ? 'success' :
                              activity.status === 'warning' ? 'warning' :
                              activity.status === 'error' ? 'destructive' : 'info'
                            }
                            className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
                          >
                            {activity.status === 'success' && (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {activity.status === 'warning' && (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                            {activity.status === 'error' && (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            {activity.status === 'info' && (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            )}
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

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingReports}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/reports">
                      View all reports →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                    <p className="text-2xl font-bold text-foreground">{stats.pendingWithdrawals}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/withdrawals">
                      Process withdrawals →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Platform Analytics</p>
                    <p className="text-2xl font-bold text-foreground">View Details</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/analytics">
                      View analytics →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
