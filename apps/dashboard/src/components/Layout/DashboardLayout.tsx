import { ReactNode, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Input, GradientText } from '@crebost/ui' // Added GradientText
import { LayoutDashboard, Megaphone, Briefcase, BarChart3, Landmark, HandCoins, ShieldCheck, Bell, Search, Menu, X, Settings, LogOut, UserCircle } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userRole = session?.user?.role || ''

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['CREATOR', 'PROMOTER', 'ADMIN'] },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone, roles: ['CREATOR', 'PROMOTER', 'ADMIN'] },
    { name: 'My Campaigns', href: '/creator/campaigns', icon: Briefcase, roles: ['CREATOR'] },
    { name: 'My Promotions', href: '/promoter/promotions', icon: Briefcase, roles: ['PROMOTER'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['CREATOR', 'ADMIN'] },
    { name: 'Transactions', href: '/transactions', icon: Landmark, roles: ['CREATOR', 'PROMOTER', 'ADMIN'] },
    { name: 'Withdrawals', href: '/withdrawals', icon: HandCoins, roles: ['PROMOTER'] },
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheck, roles: ['ADMIN'] },
  ]

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole))

  const handleSignOut = () => {
    signOut({ callbackUrl: process.env.NEXT_PUBLIC_LANDING_URL || '/' })
  }

  const NavLink = ({ href, currentPath, icon: Icon, name }: { href: string, currentPath: string, icon: React.ElementType, name: string }) => (
    <Link
      href={href}
      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                  ${ currentPath === href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
    >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      {name}
    </Link>
  );

  const renderNavLinks = (isMobile = false) => (
    <nav className={`mt-5 flex-1 px-2 space-y-1 ${isMobile ? 'text-base' : 'text-sm'}`}>
      {filteredNavigation.map((item) => (
        <NavLink key={item.name} href={item.href} currentPath={router.pathname} icon={item.icon} name={item.name} />
      ))}
    </nav>
  );


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button variant="ghost" size="icon" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-foreground" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex flex-shrink-0 items-center px-4">
               <GradientText className="text-2xl font-bold">Crebost</GradientText>
            </div>
            {renderNavLinks(true)}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-border bg-card">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <GradientText className="text-2xl font-bold">Crebost</GradientText>
            </div>
            {renderNavLinks()}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-border bg-card shadow-sm">
          <Button variant="ghost" size="icon" className="px-4 text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <form className="flex w-full md:ml-0" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">Search</label>
                <div className="relative w-full text-muted-foreground focus-within:text-foreground">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                    <Search className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Input
                    id="search-field"
                    className="block h-full w-full border-transparent bg-transparent py-2 pl-8 pr-3 text-foreground placeholder-muted-foreground focus:border-transparent focus:placeholder-foreground focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="Search campaigns, promotions..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                <Bell className="h-6 w-6" aria-hidden="true" />
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="ml-3 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
                      <AvatarFallback>
                        {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5"/>}
                      </AvatarFallback>
                    </Avatar>
                     <span className="ml-2 text-sm font-medium text-foreground hidden md:block">
                      {session?.user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-background"> {/* Changed main bg to theme background */}
          {children}
        </main>
      </div>
    </div>
  )
}
