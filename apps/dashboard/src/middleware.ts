import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Check if user is banned or suspended
    if (token?.status === 'BANNED' || token?.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/suspended', req.url))
    }

    // Role-based access control
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Creator-only routes
    if (pathname.startsWith('/creator')) {
      if (token?.role !== 'CREATOR' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Promoter-only routes
    if (pathname.startsWith('/promoter')) {
      if (token?.role !== 'PROMOTER' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

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
