# 🚀 Crebost - Cloudflare Deployment Guide

This guide will help you deploy the complete Crebost platform to Cloudflare Pages with all necessary resources.

## 📋 Prerequisites

Before starting the deployment, ensure you have:

1. **Cloudflare Account** with Pages, D1, KV, and R2 access
2. **Domain** configured in Cloudflare (e.g., `crebost.com`)
3. **Wrangler CLI** installed globally: `npm install -g wrangler`
4. **Node.js 18+** and npm installed
5. **PostgreSQL Database** (or use Cloudflare D1)
6. **Midtrans Account** for payment processing
7. **Google OAuth App** for authentication

## 🛠️ Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Clone and setup the repository:**
   ```bash
   git clone <repository-url>
   cd crebost
   npm install
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.production.template .env.production
   # Edit .env.production with your actual values
   ```

4. **Run automated deployment:**
   ```bash
   chmod +x scripts/deploy-cloudflare.sh
   ./scripts/deploy-cloudflare.sh
   ```

5. **Setup environment variables:**
   ```bash
   chmod +x scripts/setup-env-vars.sh
   ./scripts/setup-env-vars.sh
   ```

### Option 2: Manual Deployment

Follow the detailed steps in `cloudflare-deployment.md`.

## 🔧 Configuration

### Required Environment Variables

Copy `.env.production.template` to `.env.production` and configure:

#### Essential Variables:
```env
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://auth.crebost.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Payment
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_MERCHANT_ID="your-midtrans-merchant-id"

# Application URLs
NEXT_PUBLIC_LANDING_URL="https://landing.crebost.com"
NEXT_PUBLIC_AUTH_URL="https://auth.crebost.com"
NEXT_PUBLIC_DASHBOARD_URL="https://dashboard.crebost.com"
NEXT_PUBLIC_ADMIN_URL="https://admin.crebost.com"
```

### DNS Configuration

Add these CNAME records to your domain:

```
Type: CNAME, Name: landing, Target: crebost-landing.pages.dev
Type: CNAME, Name: auth, Target: crebost-auth.pages.dev
Type: CNAME, Name: dashboard, Target: crebost-dashboard.pages.dev
Type: CNAME, Name: admin, Target: crebost-admin.pages.dev
```

## 🏗️ Architecture Overview

```
crebost.com/
├── landing.crebost.com     → Landing Page (Static)
├── auth.crebost.com        → Authentication Service
├── dashboard.crebost.com   → User Dashboard
└── admin.crebost.com       → Admin Panel
```

### Cloudflare Resources:
- **4 Pages Projects** (one for each subdomain)
- **1 D1 Database** (shared across all apps)
- **3 KV Namespaces** (sessions, cache, analytics)
- **2 R2 Buckets** (uploads, static assets)

## 🔍 Verification

After deployment, verify each service:

1. **Landing Page**: https://landing.crebost.com
   - Should load the marketing site
   - Check all links work correctly

2. **Auth Service**: https://auth.crebost.com
   - Test user registration
   - Test Google OAuth login
   - Verify redirects work

3. **Dashboard**: https://dashboard.crebost.com
   - Login as Creator/Promoter
   - Test campaign creation
   - Test payment flow

4. **Admin Panel**: https://admin.crebost.com
   - Login as Admin
   - Test user management
   - Test promotion approval

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures:**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

2. **Database Connection Issues:**
   - Verify `DATABASE_URL` format
   - Check database permissions
   - Run migrations: `npx prisma db push`

3. **Authentication Problems:**
   - Verify `NEXTAUTH_URL` matches deployment URL
   - Check Google OAuth redirect URIs
   - Ensure `NEXTAUTH_SECRET` is set

4. **Payment Issues:**
   - Verify Midtrans credentials
   - Check webhook URLs in Midtrans dashboard
   - Test in sandbox mode first

5. **CORS Errors:**
   - Verify all `NEXT_PUBLIC_*_URL` variables
   - Check subdomain configuration
   - Ensure SSL certificates are active

### Debug Commands:

```bash
# Check deployment status
wrangler pages deployment list --project crebost-dashboard

# View logs
wrangler pages deployment logs <deployment-id>

# Test API endpoints
curl -f https://dashboard.crebost.com/api/health

# Check environment variables
wrangler pages secret list --project crebost-dashboard
```

## 📊 Monitoring

### Health Checks:
- `/api/health` endpoint on each service
- Automated health checks via GitHub Actions
- Cloudflare Analytics for performance monitoring

### Logging:
- Cloudflare Pages logs
- Application logs via console
- Error tracking (configure Sentry if needed)

## 🔄 CI/CD

The repository includes GitHub Actions for automated deployment:

1. **On Pull Request**: Deploy to staging
2. **On Main Branch**: Deploy to production
3. **Health Checks**: Verify all services after deployment

### Required GitHub Secrets:
```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
DATABASE_URL
NEXTAUTH_SECRET
MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY
MIDTRANS_MERCHANT_ID
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

## 🔒 Security

### Production Security Checklist:
- [ ] SSL/TLS certificates active
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Webhook signatures verified
- [ ] User input validation active

## 📈 Performance

### Optimization Features:
- Cloudflare CDN and caching
- Image optimization
- Minification (CSS, JS, HTML)
- Brotli compression
- Browser caching

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Cloudflare Pages logs
3. Verify environment variables
4. Test individual components
5. Check DNS propagation

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

**🎉 Congratulations!** Your Crebost platform should now be fully deployed and operational on Cloudflare Pages!
