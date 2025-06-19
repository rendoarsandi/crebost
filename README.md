# Crebost - Platform Promosi Konten Kreator

Platform yang membantu konten kreator berkembang dengan sistem promosi berbayar per viewer.

## 🚀 Fitur Utama

- **Sistem Promosi Berbayar**: Konten kreator dapat memberikan budget untuk promosi dengan rate per viewer
- **Multi-Platform Tracking**: Tracking engagement di TikTok, Instagram, dan platform lainnya
- **Payment Gateway**: Integrasi dengan Midtrans untuk pembayaran dalam Rupiah
- **Role-Based Access**: Creator, Promoter, dan Admin dengan dashboard masing-masing
- **Content Management**: Upload dan manage materi promosi (Google Drive, YouTube, Social Media)
- **Analytics Dashboard**: Monitor performance dan ROI campaign

## 🏗️ Arsitektur

### Subdomain Structure
- `landing.crebost.com` - Landing page utama
- `auth.crebost.com` - Authentication service
- `dashboard.crebost.com` - User dashboard (creator & promoter)
- `admin.crebost.com` - Admin panel

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **Authentication**: NextAuth.js
- **Payment**: Midtrans
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Pages
- **Database**: Supabase PostgreSQL

## 📁 Repository Structure

```
crebost/
├── apps/
│   ├── landing/          # Landing page (landing.crebost.com)
│   ├── auth/             # Authentication service (auth.crebost.com)
│   ├── dashboard/        # User dashboard (dashboard.crebost.com)
│   └── admin/            # Admin panel (admin.crebost.com)
├── packages/
│   ├── shared/           # Shared components & utilities
│   ├── database/         # Database schema & queries
│   ├── ui/               # UI component library
│   └── config/           # Shared configurations
└── docs/                 # Documentation
```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm 8+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 🚀 Deployment

Platform ini di-deploy menggunakan Cloudflare Pages dengan konfigurasi subdomain untuk setiap aplikasi.

## 📊 Business Model

- Budget per campaign: $1000 (dalam Rupiah)
- Rate per viewer: $0.1 (dalam Rupiah)
- Platform fee: 10% dari total campaign budget
- Minimum payout: Rp 50,000

## 🔐 Security

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation & sanitization
- HTTPS enforcement
