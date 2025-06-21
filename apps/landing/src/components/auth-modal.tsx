import { useState } from 'react'
import { Button, Separator, GradientText } from '@crebost/ui' // Added GradientText
// Removed Input, Card, Label, Select as they are not used
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@crebost/ui'
import { Tabs, TabsList, TabsTrigger } from '@crebost/ui' // Added Tabs imports

interface AuthModalProps {
  children: React.ReactNode
  defaultTab?: 'signin' | 'signup'
}

type TabValue = 'signin' | 'signup';

export function AuthModal({ children, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab)
  const [open, setOpen] = useState(false)

  const handleAuthRedirect = (type: TabValue) => {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crebost.com'
    window.location.href = `${authUrl}/${type}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <GradientText>
              {activeTab === 'signin' ? 'Masuk ke Crebost' : 'Daftar di Crebost'}
            </GradientText>
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === 'signin' 
              ? 'Masuk untuk mengakses dashboard Anda'
              : 'Bergabunglah dengan ribuan creator dan promoter'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quick Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleAuthRedirect(activeTab)}
              className="w-full"
              size="lg"
            >
              {activeTab === 'signin' ? '🚀 Masuk Sekarang' : '🎯 Daftar Sekarang'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Atau lanjutkan dengan</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crebost.com'
                window.location.href = `${authUrl}/${activeTab}?provider=google`
              }}
              className="w-full"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
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
              {activeTab === 'signin' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
            </Button>
          </div>

          {/* Info Section */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'signin' 
                ? 'Belum punya akun?' 
                : 'Sudah punya akun?'
              }
              <button
                onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                className="ml-1 font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {activeTab === 'signin' ? 'Daftar di sini' : 'Masuk di sini'}
              </button>
            </p>
            
            {activeTab === 'signup' && (
              <div className="text-xs text-muted-foreground">
                Dengan mendaftar, Anda menyetujui{' '}
                <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a>
                {' '}dan{' '}
                <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick Auth Buttons Component
export function QuickAuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <AuthModal defaultTab="signin">
        <Button variant="outline" size="lg" className="flex-1">
          Masuk
        </Button>
      </AuthModal>
      
      <AuthModal defaultTab="signup">
        <Button size="lg" className="flex-1">
          Daftar Gratis
        </Button>
      </AuthModal>
    </div>
  )
}
