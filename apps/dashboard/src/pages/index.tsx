import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { authOptions } from '../lib/auth'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { formatCurrency } from '@crebost/shared'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@crebost/ui'
// Removed Separator as it's not directly used here, might be in sub-components
import { Briefcase, TrendingUp, DollarSign, Eye, CheckCircle, Activity, PlusCircle, Search } from 'lucide-react' // Lucide icons

// Interface for stat items for cleaner mapping
interface StatCardItem {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColorClass: string; // e.g., "text-primary", "text-green-600"
  bgColorClass: string; // e.g., "bg-primary/10", "bg-green-500/10"
}


export default function Dashboard() {
  const { data: session } = useSession()
  const userRole = session?.user?.role;

  // Mock stats data
  const creatorStatsData = [
    { title: 'Total Campaigns', value: 5, icon: Briefcase, iconColorClass: 'text-primary', bgColorClass: 'bg-primary/10' },
    { title: 'Active Campaigns', value: 2, icon: TrendingUp, iconColorClass: 'text-green-600', bgColorClass: 'bg-green-600/10' },
    { title: 'Total Spent', value: formatCurrency(75000000), icon: DollarSign, iconColorClass: 'text-blue-600', bgColorClass: 'bg-blue-600/10' },
    { title: 'Total Views', value: (125000).toLocaleString(), icon: Eye, iconColorClass: 'text-purple-600', bgColorClass: 'bg-purple-600/10' },
  ];

  const promoterStatsData = [
    { title: 'Total Promotions', value: 12, icon: Briefcase, iconColorClass: 'text-primary', bgColorClass: 'bg-primary/10' },
    { title: 'Active Promotions', value: 3, icon: TrendingUp, iconColorClass: 'text-green-600', bgColorClass: 'bg-green-600/10' },
    { title: 'Total Earnings', value: formatCurrency(2500000), icon: DollarSign, iconColorClass: 'text-blue-600', bgColorClass: 'bg-blue-600/10' },
    { title: 'Completion Rate', value: '95%', icon: CheckCircle, iconColorClass: 'text-purple-600', bgColorClass: 'bg-purple-600/10' },
  ];

  const statsToDisplay = userRole === 'CREATOR' ? creatorStatsData : promoterStatsData;


  const recentActivity = [
    { id: 1, type: 'campaign_created', title: 'New campaign "Summer Collection" created', time: '2 hours ago', status: 'success', icon: PlusCircle },
    { id: 2, type: 'promotion_submitted', title: 'Promotion proof submitted for "Tech Review"', time: '4 hours ago', status: 'pending', icon: Activity },
    { id: 3, type: 'payment_received', title: `Payment received: ${formatCurrency(150000)}`, time: '1 day ago', status: 'success', icon: DollarSign },
  ]

  const StatCard = ({ title, value, icon: Icon, iconColorClass, bgColorClass }: StatCardItem) => (
    <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${bgColorClass}`}>
            <Icon className={`h-6 w-6 ${iconColorClass}`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );


  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - Crebost</title>
      </Head>

      <div className="py-8 px-4 sm:px-6 lg:px-8 container mx-auto"> {/* Replaced container-custom and adjusted padding */}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's what's happening with your {userRole?.toLowerCase()} account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsToDisplay.map(stat => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userRole === 'CREATOR' && (
                  <>
                    <Button asChild size="lg">
                      <Link href="/creator/campaigns/new" className="flex items-center justify-center">
                        <PlusCircle className="mr-2 h-5 w-5" /> Create Campaign
                      </Link>
                    </Button>
                    <Button variant="outline" asChild size="lg">
                      <Link href="/analytics" className="flex items-center justify-center">
                        <Search className="mr-2 h-5 w-5" /> View Analytics
                      </Link>
                    </Button>
                  </>
                )}
                {userRole === 'PROMOTER' && (
                  <>
                    <Button asChild size="lg">
                      <Link href="/campaigns" className="flex items-center justify-center">
                        <Search className="mr-2 h-5 w-5" /> Browse Campaigns
                      </Link>
                    </Button>
                    <Button variant="outline" asChild size="lg">
                      <Link href="/withdrawals" className="flex items-center justify-center">
                        <DollarSign className="mr-2 h-5 w-5" /> Request Withdrawal
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActivityIcon = activity.icon;
                  let badgeVariant: "success" | "warning" | "info" | "destructive" | "default" | "secondary" | "outline" | null | undefined = 'secondary';
                  if (activity.status === 'success') badgeVariant = 'success';
                  else if (activity.status === 'pending') badgeVariant = 'warning';

                  return (
                    <div key={activity.id} className="flex items-center space-x-4 py-2 border-b border-border last:border-b-0">
                       <div className="flex-shrink-0">
                        <Badge
                          variant={badgeVariant}
                          className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
                        >
                          <ActivityIcon className="h-4 w-4" />
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                )}
              </div>
            </CardContent>
          </Card>
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
        // Ensure this points to your actual auth app's signin page
        destination: `${process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'}/signin`,
        permanent: false,
      },
    }
  }

  return {
    props: {
      session, // Pass session to the page
    },
  }
}
