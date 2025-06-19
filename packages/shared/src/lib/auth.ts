import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!process.env.GOOGLE_CLIENT_ID,
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
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
      balanceIdr: {
        type: "number",
        defaultValue: 0,
        required: false,
      },
      totalEarnedIdr: {
        type: "number",
        defaultValue: 0,
        required: false,
      },
      totalSpentIdr: {
        type: "number",
        defaultValue: 0,
        required: false,
      },
    },
  },
})

// Type inference from auth instance
export type Session = {
  id: string
  userId: string
  expiresAt: Date
  user: User
}

export type User = {
  id: string
  email: string
  name: string
  role: string
  status: string
  balanceIdr: number
  totalEarnedIdr: number
  avatarUrl?: string
  phone?: string
  bio?: string
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

// Auth client for frontend
export const authClient = {
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001",
}

// Helper functions
export async function getSession(): Promise<Session | null> {
  try {
    // This would be implemented with actual Better Auth client
    return null
  } catch (error) {
    console.error("Failed to get session:", error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    // This would be implemented with actual Better Auth client
    const response = await fetch(`${authClient.baseURL}/api/auth/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return await response.json()
  } catch (error) {
    console.error("Sign in failed:", error)
    throw error
  }
}

export async function signUp(email: string, password: string, name: string, role: "CREATOR" | "PROMOTER" = "PROMOTER") {
  try {
    // This would be implemented with actual Better Auth client
    const response = await fetch(`${authClient.baseURL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    })
    return await response.json()
  } catch (error) {
    console.error("Sign up failed:", error)
    throw error
  }
}

export async function signOut() {
  try {
    // This would be implemented with actual Better Auth client
    await fetch(`${authClient.baseURL}/api/auth/sign-out`, {
      method: 'POST',
    })
  } catch (error) {
    console.error("Sign out failed:", error)
    throw error
  }
}

export async function updateUser(data: Partial<User>) {
  try {
    // This would be implemented with actual Better Auth client
    const response = await fetch(`${authClient.baseURL}/api/auth/update-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error("Update user failed:", error)
    throw error
  }
}

// Role checking helpers
export function isCreator(user: User | null): boolean {
  return user?.role === "CREATOR"
}

export function isPromoter(user: User | null): boolean {
  return user?.role === "PROMOTER"
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "ADMIN"
}

export function isActiveUser(user: User | null): boolean {
  return user?.status === "ACTIVE"
}

// Middleware helper
export function requireAuth(allowedRoles?: string[]) {
  return async (req: any, res: any, next: any) => {
    try {
      const session = await getSession()

      if (!session?.user) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      if (!isActiveUser(session.user)) {
        return res.status(403).json({ error: "Account is not active" })
      }

      if (allowedRoles && !allowedRoles.includes(session.user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" })
      }

      req.user = session.user
      next()
    } catch (error) {
      console.error("Auth middleware error:", error)
      return res.status(500).json({ error: "Authentication error" })
    }
  }
}

// Server-side session helper
export async function getServerSession(req: any) {
  try {
    // Extract session from request headers or cookies
    const sessionToken = req.headers.authorization?.replace("Bearer ", "") ||
                        req.cookies?.["better-auth.session_token"]

    if (!sessionToken) {
      return null
    }

    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers: new Headers({
        "authorization": `Bearer ${sessionToken}`,
      }),
    })

    return session
  } catch (error) {
    console.error("Failed to get server session:", error)
    return null
  }
}
