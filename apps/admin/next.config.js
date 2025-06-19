/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ['@crebost/shared', '@crebost/database', '@crebost/ui'],
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'images.unsplash.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/:path*`,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_AUTH_URL}/:path*`,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
