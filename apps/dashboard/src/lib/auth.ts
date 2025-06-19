import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@crebost/database'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [], // Providers will be handled by auth service
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard
      return baseUrl
    },
  },
  pages: {
    signIn: `${process.env.NEXT_PUBLIC_AUTH_URL}/signin`,
    signUp: `${process.env.NEXT_PUBLIC_AUTH_URL}/signup`,
    error: `${process.env.NEXT_PUBLIC_AUTH_URL}/error`,
  },
}

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role: string
    status: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
      status: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    role: string
    status: string
  }
}
