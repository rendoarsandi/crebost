# Crebost - Cloudflare Deployment Guide

## 🧹 Step 1: Cleanup Existing Resources

### Using MCP Cloudflare Commands:

```bash
# List and delete all Pages deployments
cf pages list
cf pages delete --name <project-name> --confirm

# List and delete all R2 buckets
cf r2 bucket list
cf r2 bucket delete <bucket-name> --confirm

# List and delete all D1 databases
cf d1 list
cf d1 delete <database-name> --confirm

# List and delete all KV namespaces
cf kv namespace list
cf kv namespace delete --namespace-id <namespace-id> --confirm

# List and delete all Workers
cf worker list
cf worker delete <worker-name> --confirm
```

## 🚀 Step 2: Setup New Deployment

### 2.1 Create D1 Database
```bash
# Create main database
cf d1 create crebost-production

# Get database ID and update wrangler.toml files
```

### 2.2 Create KV Namespaces
```bash
# Create KV namespaces for sessions and cache
cf kv namespace create "crebost-sessions"
cf kv namespace create "crebost-cache"
cf kv namespace create "crebost-analytics"
```

### 2.3 Create R2 Buckets
```bash
# Create R2 buckets for file storage
cf r2 bucket create crebost-uploads
cf r2 bucket create crebost-static-assets
```

### 2.4 Deploy Applications

#### Landing Page (landing.crebost.com)
```bash
cd apps/landing
cf pages deploy dist --project-name crebost-landing
cf pages custom-domain add crebost-landing landing.crebost.com
```

#### Auth Service (auth.crebost.com)
```bash
cd apps/auth
cf pages deploy .next --project-name crebost-auth
cf pages custom-domain add crebost-auth auth.crebost.com
```

#### Dashboard (dashboard.crebost.com)
```bash
cd apps/dashboard
cf pages deploy .next --project-name crebost-dashboard
cf pages custom-domain add crebost-dashboard dashboard.crebost.com
```

#### Admin Panel (admin.crebost.com)
```bash
cd apps/admin
cf pages deploy .next --project-name crebost-admin
cf pages custom-domain add crebost-admin admin.crebost.com
```

## 🔧 Step 3: Environment Variables

### Set environment variables for each application:

```bash
# For all applications
cf pages secret put DATABASE_URL --project crebost-auth
cf pages secret put NEXTAUTH_SECRET --project crebost-auth
cf pages secret put NEXTAUTH_URL --project crebost-auth

# For dashboard and admin
cf pages secret put MIDTRANS_SERVER_KEY --project crebost-dashboard
cf pages secret put MIDTRANS_CLIENT_KEY --project crebost-dashboard
cf pages secret put MIDTRANS_MERCHANT_ID --project crebost-dashboard

# Repeat for other projects...
```

## 📋 Required Environment Variables

### Database & Auth:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Base URL for auth service
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Payment (Midtrans):
- `MIDTRANS_SERVER_KEY` - Midtrans server key
- `MIDTRANS_CLIENT_KEY` - Midtrans client key  
- `MIDTRANS_MERCHANT_ID` - Midtrans merchant ID

### Application URLs:
- `NEXT_PUBLIC_LANDING_URL=https://landing.crebost.com`
- `NEXT_PUBLIC_AUTH_URL=https://auth.crebost.com`
- `NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.crebost.com`
- `NEXT_PUBLIC_ADMIN_URL=https://admin.crebost.com`

### Analytics & Tracking:
- `ANALYTICS_API_KEY` - Internal analytics API key
- `PLATFORM_API_KEYS` - Social media platform API keys

## 🌐 Step 4: DNS Configuration

### Add DNS records for subdomains:
```
Type: CNAME
Name: landing
Target: crebost-landing.pages.dev

Type: CNAME  
Name: auth
Target: crebost-auth.pages.dev

Type: CNAME
Name: dashboard  
Target: crebost-dashboard.pages.dev

Type: CNAME
Name: admin
Target: crebost-admin.pages.dev
```

## 🔄 Step 5: Database Migration

### Run Prisma migrations:
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

## ✅ Step 6: Verification

### Test each subdomain:
- https://landing.crebost.com - Landing page
- https://auth.crebost.com - Authentication service  
- https://dashboard.crebost.com - User dashboard
- https://admin.crebost.com - Admin panel

### Test functionality:
- User registration/login
- Campaign creation
- Payment processing
- Analytics tracking
- Admin functions

## 🔧 Troubleshooting

### Common Issues:
1. **CORS errors**: Check NEXTAUTH_URL and application URLs
2. **Database connection**: Verify DATABASE_URL format
3. **Payment issues**: Check Midtrans credentials and webhook URLs
4. **Subdomain routing**: Verify DNS propagation and SSL certificates

### Logs and Monitoring:
```bash
# View deployment logs
cf pages deployment list --project crebost-dashboard
cf pages deployment logs <deployment-id>

# Monitor real-time logs
cf pages tail --project crebost-dashboard
```

## 📊 Performance Optimization

### Enable Cloudflare features:
- Auto Minify (CSS, JS, HTML)
- Brotli compression
- Browser cache TTL
- Always Online
- Image optimization

### Security settings:
- SSL/TLS encryption mode: Full (strict)
- HSTS enabled
- Security level: Medium
- Bot fight mode: On

## 🔄 CI/CD Setup (Optional)

### GitHub Actions for auto-deployment:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: crebost-dashboard
          directory: apps/dashboard/.next
```
