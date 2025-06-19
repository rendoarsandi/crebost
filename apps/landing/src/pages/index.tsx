import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@crebost/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@crebost/ui'
import { Badge } from '@crebost/ui'
import { Separator } from '@crebost/ui'
import { ThemeToggle } from '@crebost/ui'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <Head>
        <title>Crebost - Platform Promosi Konten Kreator</title>
        <meta name="description" content="Platform yang membantu konten kreator berkembang dengan sistem promosi berbayar per viewer. Dapatkan lebih banyak engagement dan followers dengan mudah." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border fixed w-full z-50">
        <div className="container-custom">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">Crebost</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Fitur
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Cara Kerja
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Harga
              </a>
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}/signin`}>
                  Masuk
                </Link>
              </Button>
              <Button asChild>
                <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}/signup`}>
                  Daftar Gratis
                </Link>
              </Button>
            </div>

            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              <a href="#features" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">
                Fitur
              </a>
              <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">
                Cara Kerja
              </a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">
                Harga
              </a>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}/signin`}>
                  Masuk
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}/signup`}>
                  Daftar Gratis
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container-custom">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-8 lg:mb-0 animate-fade-in">
              <h1 className="text-hero text-foreground mb-6">
                Kembangkan Konten Anda dengan
                <span className="gradient-text"> Promosi Berbayar</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Platform yang menghubungkan konten kreator dengan promoter untuk meningkatkan engagement,
                followers, dan jangkauan konten Anda di berbagai platform sosial media.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg" asChild>
                  <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}/signup`}>
                    Mulai Sekarang
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg">
                  Lihat Demo
                </Button>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <Card className="glass shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Campaign Dashboard</CardTitle>
                    <Badge variant="success">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-semibold">Rp 15,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Views:</span>
                    <span className="font-semibold">100,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Views:</span>
                    <span className="font-semibold text-primary">75,432</span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
                    </div>
                    <div className="text-sm text-muted-foreground">75% Complete</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-section-title text-foreground mb-4">
              Fitur Unggulan Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Semua yang Anda butuhkan untuk mengembangkan konten dan mendapatkan engagement yang lebih tinggi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sistem Pembayaran Per View</h3>
                <p className="text-muted-foreground">
                  Bayar hanya untuk view yang benar-benar didapat. Rate mulai dari Rp 1,500 per view dengan tracking yang akurat.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics Real-time</h3>
                <p className="text-muted-foreground">
                  Monitor performa campaign Anda secara real-time dengan dashboard analytics yang komprehensif.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Platform Support</h3>
                <p className="text-muted-foreground">
                  Dukung promosi di TikTok, Instagram, YouTube, Twitter, dan platform sosial media lainnya.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="bg-yellow-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Keamanan Terjamin</h3>
                <p className="text-muted-foreground">
                  Sistem keamanan berlapis dengan verifikasi promoter dan escrow payment untuk melindungi investasi Anda.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Hasil Cepat</h3>
                <p className="text-muted-foreground">
                  Dapatkan hasil promosi dalam 24-48 jam dengan network promoter yang sudah terverifikasi.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="pt-6">
                <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Support 24/7</h3>
                <p className="text-muted-foreground">
                  Tim support yang siap membantu Anda kapan saja untuk memastikan campaign berjalan lancar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cara Kerja Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proses yang sederhana dan transparan untuk mendapatkan promosi terbaik
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For Creators */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Untuk Konten Kreator</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Buat Campaign</h4>
                    <p className="text-gray-600">
                      Daftarkan konten Anda, set budget, target audience, dan requirements untuk promoter.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Terima Aplikasi</h4>
                    <p className="text-gray-600">
                      Review dan approve promoter yang ingin mempromosikan konten Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Monitor Progress</h4>
                    <p className="text-gray-600">
                      Pantau performa campaign secara real-time melalui dashboard analytics.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Bayar Hasil</h4>
                    <p className="text-gray-600">
                      Bayar hanya untuk view dan engagement yang benar-benar didapat.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Promoters */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Untuk Promoter</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Pilih Campaign</h4>
                    <p className="text-gray-600">
                      Browse campaign yang tersedia dan pilih yang sesuai dengan audience Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Apply & Promosikan</h4>
                    <p className="text-gray-600">
                      Apply ke campaign dan mulai promosikan konten sesuai requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Submit Bukti</h4>
                    <p className="text-gray-600">
                      Upload bukti promosi dan data engagement untuk verifikasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Terima Pembayaran</h4>
                    <p className="text-gray-600">
                      Dapatkan pembayaran otomatis setelah hasil terverifikasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding bg-secondary/20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-section-title text-foreground mb-4">
              Harga yang Transparan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tidak ada biaya tersembunyi. Bayar hanya untuk hasil yang Anda dapatkan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-xl">Basic</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Rp 1,500</span>
                  <span className="text-muted-foreground">/view</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    TikTok & Instagram
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic Analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Email Support
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Mulai Basic
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="text-center border-2 border-primary relative scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge>Populer</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Rp 1,200</span>
                  <span className="text-muted-foreground">/view</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Semua Platform
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced Analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority Support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Campaign Optimization
                  </li>
                </ul>
                <Button className="w-full">
                  Mulai Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
                <span className="text-gray-600">/view</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Volume Discount
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Dedicated Manager
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom Integration
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 Phone Support
                </li>
              </ul>
              <button className="w-full border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50">
                Hubungi Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary to-primary/80">
        <div className="container-custom text-center">
          <h2 className="text-section-title text-primary-foreground mb-4">
            Siap Mengembangkan Konten Anda?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
            Bergabunglah dengan ribuan konten kreator yang sudah merasakan manfaat platform Crebost
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg" asChild>
              <Link href={`${process.env.NEXT_PUBLIC_AUTH_URL}/signup`}>
                Daftar Gratis Sekarang
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Konsultasi Gratis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Crebost</h3>
              <p className="text-gray-400 mb-4">
                Platform promosi konten kreator terpercaya di Indonesia
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Fitur</a></li>
                <li><a href="#" className="hover:text-white">Harga</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrasi</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Dokumentasi</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Kontak</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Tentang</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Karir</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Crebost. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
