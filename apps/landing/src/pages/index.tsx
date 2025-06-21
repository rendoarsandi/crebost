import Head from 'next/head'
import { Button, GradientText } from '@crebost/ui' // Added GradientText
import { Card, CardContent, CardHeader, CardTitle } from '@crebost/ui'
import { Badge } from '@crebost/ui'
import { Separator } from '@crebost/ui'
import { AuthModal, QuickAuthButtons } from '../components/auth-modal'
import { CheckCircle } from 'lucide-react' // Example icon

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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <GradientText className="font-bold text-xl">Crebost</GradientText>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Harga</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tentang</a>
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
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" style={{ mixBlendMode: 'overlay' }}></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 animate-fade-in">
                🚀 Platform Terbaru untuk Creator
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-slide-up">
                <GradientText>Revolusi Kolaborasi</GradientText>
                <br />
                <span className="text-foreground">Content Creator & Promoter</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up">
                Platform yang menghubungkan content creator dengan promoter untuk menciptakan 
                kolaborasi yang menguntungkan semua pihak dengan sistem pembayaran per view yang transparan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
                <AuthModal defaultTab="signup">
                  <Button size="lg" className="text-lg px-8 py-3 transform transition-transform duration-200 hover:scale-105">
                    🎯 Mulai Sekarang
                  </Button>
                </AuthModal>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 transform transition-transform duration-200 hover:scale-105">
                  📹 Lihat Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
                {[
                  { value: "1000+", label: "Content Creator" },
                  { value: "500+", label: "Brand Partner" },
                  { value: "10M+", label: "Total Views" },
                  { value: "99%", label: "Kepuasan" },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-4 bg-card/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">✨ Fitur Unggulan</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Mengapa Memilih <GradientText>Crebost</GradientText>?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Platform yang dirancang khusus untuk memaksimalkan potensi kolaborasi 
                antara content creator dan promoter.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Per View Payment", icon: "💰", description: "Sistem pembayaran yang adil berdasarkan jumlah view. Transparansi penuh.", points: ["Real-time tracking", "Pembayaran otomatis", "Laporan detail"], colorFrom: "from-blue-500", colorTo: "to-blue-600" },
                { title: "Real-time Analytics", icon: "📈", description: "Monitor performa konten secara real-time dengan dashboard komprehensif.", points: ["Dashboard interaktif", "Insights mendalam", "Export data"], colorFrom: "from-green-500", colorTo: "to-green-600" },
                { title: "Multi Platform", icon: "🌐", description: "Support untuk semua platform media sosial populer. Kelola semua dari satu dashboard.", points: ["TikTok, Instagram, YouTube", "Sinkronisasi otomatis", "Cross-platform analytics"], colorFrom: "from-purple-500", colorTo: "to-purple-600" },
                { title: "Smart Matching", icon: "🤝", description: "AI-powered matching menghubungkan creator dengan brand yang sesuai.", points: ["AI recommendation", "Audience analysis", "Perfect match score"], colorFrom: "from-orange-500", colorTo: "to-orange-600" },
                { title: "Secure & Trusted", icon: "🔒", description: "Keamanan data dan transaksi terjamin dengan enkripsi tingkat bank.", points: ["Bank-level security", "Escrow system", "24/7 monitoring"], colorFrom: "from-red-500", colorTo: "to-red-600" },
                { title: "Fast & Easy", icon: "⚡", description: "Setup dalam hitungan menit. Interface intuitif dan user-friendly.", points: ["Quick onboarding", "Intuitive interface", "24/7 support"], colorFrom: "from-teal-500", colorTo: "to-teal-600" },
              ].map(feature => (
                <Card key={feature.title} className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.colorFrom} ${feature.colorTo} flex items-center justify-center mb-4`}>
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {feature.description}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {feature.points.map(point => (
                        <li key={point} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" style={{ mixBlendMode: 'overlay' }}></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                🎉 Bergabung Sekarang
              </Badge>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Siap Memulai Perjalanan
                <br />
                <span className="text-primary-foreground/90">Creator Anda?</span>
              </h2>

              <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan content creator dan promoter yang sudah
                merasakan manfaat platform Crebost. Mulai kolaborasi yang menguntungkan hari ini!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <AuthModal defaultTab="signup">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-3 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transform transition-transform duration-200 hover:scale-105">
                    🚀 Daftar Gratis Sekarang
                  </Button>
                </AuthModal>
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transform transition-transform duration-200 hover:scale-105">
                  📞 Konsultasi Gratis
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { value: "100%", label: "Gratis Daftar" },
                  { value: "24/7", label: "Support" },
                  { value: "5 Menit", label: "Setup" },
                  { value: "Instant", label: "Payment" },
                ].map(stat => (
                  <div key={stat.label} className="p-4 bg-black/10 rounded-lg">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-primary-foreground/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-muted/50 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">C</span>
                  </div>
                  <GradientText className="font-bold text-xl">Crebost</GradientText>
                </div>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                  Platform terdepan yang menghubungkan content creator dengan promoter
                  untuk menciptakan kolaborasi yang menguntungkan semua pihak.
                </p>
                <QuickAuthButtons />
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Fitur</a></li>
                  <li><a href="#pricing" className="hover:text-foreground transition-colors">Harga</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Integrasi</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Dukungan</h3>
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
                © {new Date().getFullYear()} Crebost. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm text-muted-foreground mt-4 md:mt-0">
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
