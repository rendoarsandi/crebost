import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public') ||
    pathname === '/unauthorized' ||
    pathname === '/suspended'
  ) {
    return NextResponse.next()
  }

  // Check for session cookie or redirect to auth
  const sessionCookie = request.cookies.get('better-auth.session_token')

  if (!sessionCookie) {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crebost.com'
    return NextResponse.redirect(`${authUrl}/signin?redirect=${encodeURIComponent(request.url)}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
