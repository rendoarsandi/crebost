import Head from 'next/head'
import { Button } from '@crebost/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@crebost/ui'
import { Badge } from '@crebost/ui'
import { Separator } from '@crebost/ui'
import { AuthModal, QuickAuthButtons } from '../components/auth-modal'

export default function Home() {
  return (
    <>
      <Head>
        <title>Crebost - Platform Content Creator Terdepan</title>
        <meta name="description" content="Platform yang menghubungkan content creator dengan promoter untuk kolaborasi yang menguntungkan" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container-custom flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-xl gradient-text">Crebost</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Harga</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Tentang</a>
              <AuthModal defaultTab="signin">
                <Button variant="outline" size="sm">Masuk</Button>
              </AuthModal>
              <AuthModal defaultTab="signup">
                <Button size="sm">Daftar</Button>
              </AuthModal>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container-custom section-padding">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 animate-fade-in">
                🚀 Platform Terbaru untuk Creator
              </Badge>
              
              <h1 className="text-hero gradient-text mb-6 animate-slide-up">
                Revolusi Kolaborasi
                <br />
                <span className="text-foreground">Content Creator & Promoter</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up">
                Platform yang menghubungkan content creator dengan promoter untuk menciptakan 
                kolaborasi yang menguntungkan semua pihak dengan sistem pembayaran per view yang transparan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
                <AuthModal defaultTab="signup">
                  <Button size="lg" className="text-lg px-8 py-6 hover-lift">
                    🎯 Mulai Sekarang
                  </Button>
                </AuthModal>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover-lift">
                  📹 Lihat Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">Content Creator</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Brand Partner</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10M+</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">99%</div>
                  <div className="text-sm text-muted-foreground">Kepuasan</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="section-padding bg-muted/30">
          <div className="container-custom">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">✨ Fitur Unggulan</Badge>
              <h2 className="text-section-title mb-4">
                Mengapa Memilih <span className="gradient-text">Crebost</span>?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Platform yang dirancang khusus untuk memaksimalkan potensi kolaborasi 
                antara content creator dan promoter
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <CardTitle className="text-xl">Per View Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Sistem pembayaran yang adil berdasarkan jumlah view yang didapat. 
                    Transparansi penuh untuk semua pihak.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Real-time tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Pembayaran otomatis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Laporan detail
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <CardTitle className="text-xl">Real-time Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Monitor performa konten secara real-time dengan dashboard 
                    yang komprehensif dan mudah dipahami.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Dashboard interaktif
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Insights mendalam
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Export data
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <CardTitle className="text-xl">Multi Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Support untuk semua platform media sosial populer. 
                    Kelola semua konten dari satu dashboard.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      TikTok, Instagram, YouTube
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Sinkronisasi otomatis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Cross-platform analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <CardTitle className="text-xl">Smart Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    AI-powered matching system yang menghubungkan creator 
                    dengan brand yang sesuai dengan niche dan audience.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      AI recommendation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Audience analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Perfect match score
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <CardTitle className="text-xl">Secure & Trusted</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Keamanan data dan transaksi terjamin dengan enkripsi 
                    tingkat bank dan sistem escrow yang aman.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Bank-level security
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Escrow system
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      24/7 monitoring
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <CardTitle className="text-xl">Fast & Easy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Setup dalam hitungan menit. Interface yang intuitif 
                    dan user-friendly untuk semua level pengguna.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Quick onboarding
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      Intuitive interface
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      24/7 support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container-custom relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                🎉 Bergabung Sekarang
              </Badge>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Siap Memulai Perjalanan
                <br />
                <span className="text-primary-foreground/90">Creator Anda?</span>
              </h2>

              <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan content creator dan promoter yang sudah
                merasakan manfaat platform Crebost. Mulai kolaborasi yang menguntungkan hari ini!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <AuthModal defaultTab="signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    🚀 Daftar Gratis Sekarang
                  </Button>
                </AuthModal>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  📞 Konsultasi Gratis
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm text-primary-foreground/70">Gratis Daftar</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-primary-foreground/70">Support</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">5 Menit</div>
                  <div className="text-sm text-primary-foreground/70">Setup</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Instant</div>
                  <div className="text-sm text-primary-foreground/70">Payment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 border-t border-border">
          <div className="container-custom py-16">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">C</span>
                  </div>
                  <span className="font-bold text-xl gradient-text">Crebost</span>
                </div>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Platform terdepan yang menghubungkan content creator dengan promoter
                  untuk menciptakan kolaborasi yang menguntungkan semua pihak.
                </p>
                <QuickAuthButtons />
              </div>

              <div>
                <h3 className="font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Fitur</a></li>
                  <li><a href="#pricing" className="hover:text-foreground transition-colors">Harga</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Integrasi</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Dukungan</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Dokumentasi</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Kontak</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                </ul>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2024 Crebost. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
