import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@crebost/database'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.status = user.status
        token.userId = user.id
      }

      // Handle OAuth sign-in
      if (account?.provider === 'google' && user) {
        // Check if user exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          // Create new user with default role
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              avatarUrl: user.image,
              role: 'PROMOTER', // Default role
              status: 'ACTIVE',
            },
          })
          token.role = newUser.role
          token.status = newUser.status
          token.userId = newUser.id
        } else {
          token.role = existingUser.role
          token.status = existingUser.status
          token.userId = existingUser.id
        }
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
      // Redirect to dashboard after sign in
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return process.env.NEXT_PUBLIC_DASHBOARD_URL || baseUrl
    },
  },
  pages: {
    signIn: '/signin',
    signUp: '/signup',
    error: '/error',
  },
  events: {
    async signIn({ user, account, profile }) {
      // Log sign-in event
      if (user.id) {
        await prisma.analyticsEvent.create({
          data: {
            userId: user.id,
            eventType: 'user_signin',
            eventData: {
              provider: account?.provider,
              userAgent: '', // Will be filled by middleware
            },
          },
        })
      }
    },
    async signOut({ session }) {
      // Log sign-out event
      if (session?.user?.id) {
        await prisma.analyticsEvent.create({
          data: {
            userId: session.user.id,
            eventType: 'user_signout',
            eventData: {},
          },
        })
      }
    },
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
