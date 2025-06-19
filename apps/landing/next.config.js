/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  transpilePackages: ['@crebost/shared', '@crebost/ui'],
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_AUTH_URL}/:path*`,
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/:path*`,
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: `${process.env.NEXT_PUBLIC_ADMIN_URL}/:path*`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
