import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import AdminLayout from '../components/Layout/AdminLayout'
import { formatCurrency } from '@crebost/shared'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Alert, AlertDescription } from '@crebost/ui'
import { Users, Megaphone, Briefcase, DollarSign, ShieldAlert, HandCoins, BarChart3, CheckCircle, Info, AlertCircle as LucideAlertCircle, Activity as ActivityIcon } from 'lucide-react'
import { authOptions, Session } from '../lib/auth' // Assuming Session type is exported from auth.ts
import { getServerSession } from 'next-auth/next' // Using next-auth/next for getServerSession


// Interface for stat items for cleaner mapping
interface AdminStatCardItem {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColorClass: string;
  bgColorClass: string;
  subText?: string;
  subTextColorClass?: string;
}

// Interface for recent activity items
interface RecentActivityItem {
  id: number;
  type: string;
  title: string;
  time: string;
  status: 'info' | 'warning' | 'success' | 'error';
  icon: React.ElementType;
}

// Interface for pending actions
interface PendingActionItem {
  id: number;
  type: string;
  title: string;
  description: string;
  action: string;
  href: string;
  urgent: boolean;
  icon: React.ElementType;
}


export default function AdminDashboard() {
  // Mock data - in a real app, this would come from an API
  const statsData: AdminStatCardItem[] = [
    { title: 'Total Users', value: (1247).toLocaleString(), icon: Users, iconColorClass: 'text-blue-600', bgColorClass: 'bg-blue-600/10', subText: `${(342).toLocaleString()} Creators, ${(905).toLocaleString()} Promoters`, subTextColorClass: 'text-muted-foreground' },
    { title: 'Campaigns', value: (156).toLocaleString(), icon: Megaphone, iconColorClass: 'text-green-600', bgColorClass: 'bg-green-600/10', subText: `${(23).toLocaleString()} Active`, subTextColorClass: 'text-green-600' },
    { title: 'Promotions', value: (892).toLocaleString(), icon: Briefcase, iconColorClass: 'text-purple-600', bgColorClass: 'bg-purple-600/10', subText: `${(45).toLocaleString()} Pending Review`, subTextColorClass: 'text-yellow-600' },
    { title: 'Total Revenue', value: formatCurrency(125000000), icon: DollarSign, iconColorClass: 'text-yellow-600', bgColorClass: 'bg-yellow-600/10', subText: `${formatCurrency(18500000)} This Month`, subTextColorClass: 'text-green-600' },
  ];

  const quickStatsData: AdminStatCardItem[] = [
    { title: 'Pending Reports', value: 8, icon: ShieldAlert, iconColorClass: 'text-red-600', bgColorClass: 'bg-red-600/10', subText: 'View all reports →', href: '/reports' },
    { title: 'Pending Withdrawals', value: 12, icon: HandCoins, iconColorClass: 'text-orange-600', bgColorClass: 'bg-orange-600/10', subText: 'Process withdrawals →', href: '/withdrawals' },
    { title: 'Platform Analytics', value: 'View Details', icon: BarChart3, iconColorClass: 'text-primary', bgColorClass: 'bg-primary/10', subText: 'View analytics →', href: '/analytics' },
  ];

  const recentActivity: RecentActivityItem[] = [
    { id: 1, type: 'user_registered', title: 'New user: John Doe (Creator)', time: '5m ago', status: 'info', icon: Users },
    { id: 2, type: 'withdrawal_requested', title: `Withdrawal: ${formatCurrency(2500000)} by S. Kim`, time: '15m ago', status: 'warning', icon: HandCoins },
    { id: 3, type: 'campaign_completed', title: 'Campaign "Summer Fashion" ended', time: '1h ago', status: 'success', icon: Megaphone },
    { id: 4, type: 'report_submitted', title: 'Report: @techreviewer (spam)', time: '2h ago', status: 'error', icon: ShieldAlert },
    { id: 5, type: 'promotion_approved', title: 'Promotion approved: "Tech Review"', time: '3h ago', status: 'success', icon: Briefcase },
  ];

  const pendingActions: PendingActionItem[] = [
    { id: 1, type: 'withdrawal', title: 'Withdrawal Request', description: `${formatCurrency(2500000)} - Sarah Kim`, action: 'Review', href: '/withdrawals', urgent: true, icon: HandCoins },
    { id: 2, type: 'report', title: 'User Report', description: 'Spam: @techreviewer', action: 'Investigate', href: '/reports', urgent: true, icon: ShieldAlert },
    { id: 3, type: 'promotion', title: 'Promotion Review', description: '12 pending approval', action: 'Review', href: '/promotions', urgent: false, icon: Briefcase },
    { id: 4, type: 'campaign', title: 'Campaign Verification', description: '3 need verification', action: 'Verify', href: '/campaigns', urgent: false, icon: Megaphone },
  ];

  const AdminStatCard = ({ title, value, icon: Icon, iconColorClass, bgColorClass, subText, subTextColorClass, href }: AdminStatCardItem & { href?: string }) => (
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
        {subText && (
          <div className={`mt-3 text-sm ${subTextColorClass || 'text-muted-foreground'}`}>
            {href ? (
              <Button variant="link" asChild className="p-0 h-auto text-sm">
                <Link href={href}>{subText}</Link>
              </Button>
            ) : (
              subText
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const RecentActivityBadgeIcon = ({ status, icon: Icon }: { status: RecentActivityItem['status'], icon: React.ElementType }) => {
    let badgeVariant: "success" | "warning" | "info" | "destructive" | "default" | "secondary" | "outline" | null | undefined = 'default';
    if (status === 'success') badgeVariant = 'success';
    else if (status === 'warning') badgeVariant = 'warning';
    else if (status === 'error') badgeVariant = 'destructive';
    else if (status === 'info') badgeVariant = 'info';

    return (
      <Badge variant={badgeVariant} className="h-8 w-8 rounded-full p-0 flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </Badge>
    );
  };


  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - Crebost</title>
      </Head>

      <div className="py-8 px-4 sm:px-6 lg:px-8 container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of platform activity and pending actions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map(stat => <AdminStatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Actions</CardTitle>
                <CardDescription>Items that require your immediate attention.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingActions.map((item) => (
                    <Alert key={item.id} variant={item.urgent ? 'destructive' : 'default'} className="p-4">
                       <item.icon className={`h-5 w-5 ${item.urgent ? 'text-destructive' : 'text-foreground'}`} />
                      <div className="ml-3 flex-1 md:flex md:items-center md:justify-between">
                        <div>
                           <AlertDescription className="font-medium">{item.title}</AlertDescription>
                           <AlertDescription className="text-xs text-muted-foreground">{item.description}</AlertDescription>
                        </div>
                        <Button variant={item.urgent ? 'destructive' : 'outline'} size="sm" asChild className="mt-2 md:mt-0 md:ml-4">
                          <Link href={item.href}>{item.action}</Link>
                        </Button>
                      </div>
                    </Alert>
                  ))}
                   {pendingActions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No pending actions.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 py-2.5 border-b border-border last:border-b-0">
                      <RecentActivityBadgeIcon status={activity.status} icon={activity.icon} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium truncate" title={activity.title}>{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickStatsData.map(stat => <AdminStatCard key={stat.title} {...stat} href={stat.href} />)}
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions) as Session | null;

  if (!session) {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001';
    return { redirect: { destination: `${authUrl}/signin`, permanent: false } };
  }

  if (session.user?.role !== 'ADMIN') {
    // Redirect to a generic unauthorized page or dashboard if not an admin
    return { redirect: { destination: process.env.NEXT_PUBLIC_DASHBOARD_URL || '/', permanent: false } };
  }

  return {
    props: {
      session, // Pass session to the page
    },
  }
}
