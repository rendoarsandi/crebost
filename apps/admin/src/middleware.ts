import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Check if user is admin
    if (token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Check if admin account is active
    if (token?.status === 'BANNED' || token?.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/suspended', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow admins
        return !!token && token.role === 'ADMIN'
      },
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
     * - unauthorized page
     * - suspended page
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|unauthorized|suspended).*)',
  ],
}
