import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { authOptions } from '../lib/auth'
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, Alert, AlertDescription, Label, Separator, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, GradientText } from '@crebost/ui' // Added GradientText

type UserRole = 'CREATOR' | 'PROMOTER';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PROMOTER' as UserRole,
    phone: '',
    // bio: '', // bio field was not in the form, removed for now
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { // Select is handled by onValueChange
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as UserRole }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) { // Basic password length validation
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone || undefined,
          // bio: formData.bio || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.')
      }

      // Auto sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError('Registration successful, but auto sign-in failed. Please sign in manually.')
        // Optionally redirect to sign-in page or show success message with link to sign-in
        // router.push('/signin');
      } else if (signInResult?.ok) {
        router.push(process.env.NEXT_PUBLIC_DASHBOARD_URL || '/')
      } else {
        setError('Registration successful. Please proceed to sign in.');
        // router.push('/signin');
      }
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    // For Google sign-up, we might want to pass role or other info if needed,
    // or handle it post-Google callback. For now, just standard Google sign-in.
    signIn('google', { callbackUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL || '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-2xl border-border/20"> {/* Removed glass, added subtle border */}
          <CardHeader className="text-center space-y-2">
            <GradientText className="text-3xl font-bold">
              Create your Crebost account
            </GradientText>
            <CardDescription>
              Or{' '}
              <Link href="/signin" className="font-medium text-primary hover:text-primary/80 transition-colors">
                sign in to your existing account
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                    <SelectTrigger id="role" name="role">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROMOTER">Promoter - I want to promote content</SelectItem>
                      <SelectItem value="CREATOR">Creator - I want my content promoted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. +1234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : 'Create Account'}
              </Button>
            </form>

            <div className="space-y-6"> {/* Ensured consistent spacing */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase"> {/* Adjusted text style */}
                  <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"> {/* Adjusted margin */}
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return {
      redirect: {
        destination: process.env.NEXT_PUBLIC_DASHBOARD_URL || '/',
        permanent: false,
      },
    }
  }

  return {
    props: {}, // No specific props needed for sign-up page if not using providers list
  }
}
