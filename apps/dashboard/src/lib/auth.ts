// BetterAuth client configuration for dashboard app
export const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crebost.com',
  endpoints: {
    signIn: '/signin',
    signUp: '/signup',
    signOut: '/signout',
    session: '/api/auth/session',
  },
}

// Auth utility functions
export async function getSession() {
  try {
    const response = await fetch(`${authConfig.baseURL}/api/auth/session`, {
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export async function signOut() {
  try {
    await fetch(`${authConfig.baseURL}/api/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    })

    // Redirect to auth service
    window.location.href = `${authConfig.baseURL}/signin`
  } catch (error) {
    console.error('Failed to sign out:', error)
  }
}

export function redirectToAuth(path: string = '/signin') {
  window.location.href = `${authConfig.baseURL}${path}`
}

// Types for BetterAuth
export interface User {
  id: string
  email: string
  name: string
  image?: string
  role: string
  status: string
}

export interface Session {
  user: User
  expires: string
}
