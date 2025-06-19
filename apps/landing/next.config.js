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
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crebost.com';
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.crebost.com';
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.crebost.com';

    return [
      {
        source: '/auth/:path*',
        destination: `${authUrl}/:path*`,
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: `${dashboardUrl}/:path*`,
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: `${adminUrl}/:path*`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
