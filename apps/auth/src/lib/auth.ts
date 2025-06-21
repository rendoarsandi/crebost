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
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_ID!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      // Contoh jika perlu scope atau profile mapping (sesuaikan dengan dokumentasi better-auth & TikTok):
      // authorization: { params: { scope: "user.info.basic" } },
      // profile: (profile: any) => {
      //   return {
      //     id: profile.open_id,
      //     name: profile.display_name,
      //     email: profile.email, // TikTok mungkin tidak selalu memberikan email
      //     image: profile.avatar_url_100,
      //   };
      // },
    },
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      // Contoh jika perlu scope atau profile mapping (sesuaikan dengan dokumentasi better-auth & Instagram):
      // authorization: { params: { scope: "user_profile" } }, // user_media jika perlu
      // profile: (profile: any) => {
      //   return {
      //     id: profile.id,
      //     name: profile.username,
      //     // Email tidak disediakan oleh Instagram Basic Display API
      //     // image: profile.profile_picture_url,
      //   };
      // },
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
    async signUp({ user, account }) { // Menambahkan `account` untuk info provider
      // Log sign-up event
      try {
        await prisma.analyticsEvent.create({
          data: {
            userId: user.id,
            eventType: 'user_signup',
            eventData: {
              email: user.email,
              name: user.name,
              provider: account?.provider || 'email_password', // Fallback jika provider tidak dari OAuth
            } as Prisma.InputJsonObject,
          },
        })
      } catch (error) {
        console.error('Failed to log signup event:', error)
      }
    },
    async signIn({ user, account }) { // Menambahkan `account` untuk info provider
      // Log sign-in event
      try {
        await prisma.analyticsEvent.create({
          data: {
            userId: user.id,
            eventType: 'user_signin',
            eventData: {
              email: user.email,
              provider: account?.provider || 'email_password', // Fallback jika provider tidak dari OAuth
            } as Prisma.InputJsonObject,
          },
        })
      } catch (error) {
        console.error('Failed to log signin event:', error)
      }
    },
    // Pertimbangkan untuk menambahkan callback jwt dan session jika perlu kustomisasi token/sesi lebih lanjut:
    // async jwt({ token, user, account, profile }) {
    //   if (account && user) {
    //     token.accessToken = account.access_token;
    //     token.provider = account.provider;
    //     token.id = user.id; // Menambahkan user id ke token JWT
    //   }
    //   return token;
    // },
    // async session({ session, token, user }) {
    //   if (session.user && token.id) {
    //     (session.user as any).id = token.id; // Menambahkan id ke objek session.user
    //   }
    //   if (session.user && token.provider) {
    //     (session.user as any).provider = token.provider; // Menambahkan provider ke objek session.user
    //   }
    //   return session;
    // },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_LANDING_URL || 'https://landing.crebost.com',
    process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.crebost.com',
    process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.crebost.com',
  ],
})
