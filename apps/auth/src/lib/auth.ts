import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from '@crebost/database'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite", // or your database provider
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "PROMOTER",
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
      },
    },
  },
  callbacks: {
    async signUp({ user }) {
      // Log sign-up event
      try {
        await prisma.analyticsEvent.create({
          data: {
            userId: user.id,
            eventType: 'user_signup',
            eventData: {
              email: user.email,
              name: user.name,
            },
          },
        })
      } catch (error) {
        console.error('Failed to log signup event:', error)
      }
    },
    async signIn({ user }) {
      // Log sign-in event
      try {
        await prisma.analyticsEvent.create({
          data: {
            userId: user.id,
            eventType: 'user_signin',
            eventData: {
              email: user.email,
            },
          },
        })
      } catch (error) {
        console.error('Failed to log signin event:', error)
      }
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_LANDING_URL || 'https://landing.crebost.com',
    process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.crebost.com',
    process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.crebost.com',
  ],
})
