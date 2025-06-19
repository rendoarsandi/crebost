# Cloudflare Deployment Guide

## Overview
Platform Crebost menggunakan arsitektur multi-subdomain yang di-deploy di Cloudflare Pages dengan konfigurasi sebagai berikut:

- `landing.crebost.com` - Landing page utama
- `auth.crebost.com` - Authentication service  
- `dashboard.crebost.com` - User dashboard
- `admin.crebost.com` - Admin panel

## Prerequisites

1. **Cloudflare Account** dengan domain yang sudah dikonfigurasi
2. **GitHub Repository** untuk source code
3. **Supabase Project** untuk database
4. **Midtrans Account** untuk payment gateway

## Deployment Steps

### 1. Setup Domain di Cloudflare

1. Login ke Cloudflare Dashboard
2. Add domain `crebost.com` 
3. Update nameservers di domain registrar
4. Tunggu DNS propagation

### 2. Create Cloudflare Pages Projects

Buat 4 project terpisah di Cloudflare Pages:

#### Landing Page Project
- **Project Name**: `crebost-landing`
- **Git Repository**: Connect to your GitHub repo
- **Build Command**: `cd apps/landing && npm run build`
- **Build Output Directory**: `apps/landing/.next`
- **Root Directory**: `/`
- **Environment Variables**: Set sesuai `.env.example`

#### Auth Service Project  
- **Project Name**: `crebost-auth`
- **Build Command**: `cd apps/auth && npm run build`
- **Build Output Directory**: `apps/auth/.next`
- **Environment Variables**: Include NextAuth and database configs

#### Dashboard Project
- **Project Name**: `crebost-dashboard` 
- **Build Command**: `cd apps/dashboard && npm run build`
- **Build Output Directory**: `apps/dashboard/.next`
- **Environment Variables**: Include API endpoints and auth configs

#### Admin Project
- **Project Name**: `crebost-admin`
- **Build Command**: `cd apps/admin && npm run build` 
- **Build Output Directory**: `apps/admin/.next`
- **Environment Variables**: Include admin-specific configs

### 3. Configure Custom Domains

Di setiap Cloudflare Pages project:

1. Go to **Custom Domains** tab
2. Add custom domain:
   - Landing: `landing.crebost.com` dan `crebost.com`
   - Auth: `auth.crebost.com`
   - Dashboard: `dashboard.crebost.com` 
   - Admin: `admin.crebost.com`

### 4. Setup DNS Records

Di Cloudflare DNS:

```
Type    Name        Content                     Proxy
CNAME   landing     crebost-landing.pages.dev   ✅
CNAME   auth        crebost-auth.pages.dev      ✅  
CNAME   dashboard   crebost-dashboard.pages.dev ✅
CNAME   admin       crebost-admin.pages.dev     ✅
CNAME   @           crebost-landing.pages.dev   ✅
```

### 5. Environment Variables

Set environment variables di setiap project sesuai kebutuhan:

**Common Variables (All Projects):**
```
DATABASE_URL=your-supabase-db-url
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_APP_URL=https://crebost.com
```

**Auth Project Additional:**
```
NEXTAUTH_URL=https://auth.crebost.com
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

**Dashboard/Admin Additional:**
```
MIDTRANS_SERVER_KEY=your-midtrans-key
CLOUDFLARE_R2_ACCESS_KEY=your-r2-key
```

### 6. Build Configuration

Create `wrangler.toml` for each app if using Cloudflare Workers:

```toml
name = "crebost-landing"
compatibility_date = "2023-12-01"

[env.production]
name = "crebost-landing"
route = "landing.crebost.com/*"
```

### 7. Database Setup

1. Create Supabase project
2. Run database migrations
3. Setup Row Level Security (RLS)
4. Configure API keys

### 8. Testing Deployment

1. Test each subdomain individually
2. Verify authentication flow across domains
3. Test payment integration
4. Check admin panel functionality

## Monitoring & Analytics

1. **Cloudflare Analytics** - Monitor traffic dan performance
2. **Cloudflare Web Analytics** - User behavior tracking  
3. **Supabase Dashboard** - Database monitoring
4. **Custom Logging** - Application-specific logs

## Security Considerations

1. **SSL/TLS** - Automatic dengan Cloudflare
2. **CORS Configuration** - Allow cross-subdomain requests
3. **Rate Limiting** - Implement di Cloudflare Workers
4. **DDoS Protection** - Automatic dengan Cloudflare Pro

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build commands dan dependencies
   - Verify environment variables
   - Check Node.js version compatibility

2. **Domain Not Working**
   - Verify DNS propagation
   - Check CNAME records
   - Ensure SSL certificate is active

3. **Authentication Issues**
   - Verify NEXTAUTH_URL configuration
   - Check OAuth provider settings
   - Ensure session cookies work across subdomains

4. **Database Connection**
   - Verify DATABASE_URL
   - Check Supabase project status
   - Ensure connection pooling is configured

## Cost Estimation

**Cloudflare Pages:**
- Free tier: 1 build per minute, 500 builds/month
- Pro: $20/month for unlimited builds

**Cloudflare Pro (recommended):**
- $20/month per domain
- Includes advanced security features

**Total estimated cost:** $40-60/month untuk production deployment
