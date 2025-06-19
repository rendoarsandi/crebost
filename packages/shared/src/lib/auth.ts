import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
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
  advanced: {
    generateId: () => {
      // Generate custom ID format
      return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User

// Auth client for frontend
export const authClient = auth.createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001",
})

// Helper functions
export async function getSession() {
  try {
    const session = await authClient.getSession()
    return session
  } catch (error) {
    console.error("Failed to get session:", error)
    return null
  }
}

export async function signIn(email: string, password: string) {
  try {
    const result = await authClient.signIn.email({
      email,
      password,
    })
    return result
  } catch (error) {
    console.error("Sign in failed:", error)
    throw error
  }
}

export async function signUp(email: string, password: string, name: string, role: "CREATOR" | "PROMOTER" = "PROMOTER") {
  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
      role,
    })
    return result
  } catch (error) {
    console.error("Sign up failed:", error)
    throw error
  }
}

export async function signOut() {
  try {
    await authClient.signOut()
  } catch (error) {
    console.error("Sign out failed:", error)
    throw error
  }
}

export async function updateUser(data: Partial<User>) {
  try {
    const result = await authClient.updateUser(data)
    return result
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
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    })

    return session
  } catch (error) {
    console.error("Failed to get server session:", error)
    return null
  }
}
