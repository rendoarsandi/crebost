/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@crebost/shared', '@crebost/database', '@crebost/ui'],
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'images.unsplash.com'],
  },
  async rewrites() {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crebost.com';
    return [
      {
        source: '/api/auth/:path*',
        destination: `${authUrl}/api/auth/:path*`,
      },
    ]
  },
  async redirects() {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crebost.com';
    return [
      {
        source: '/auth/:path*',
        destination: `${authUrl}/:path*`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
