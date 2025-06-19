# 🚀 Crebost - Platform Kreator Indonesia

Platform terdepan untuk kreator Indonesia. Monetisasi konten, kelola audience, dan kembangkan bisnis kreatif Anda.

## 🌐 Live Services

### ✅ Currently Deployed
- **Landing Page**: https://crebost-landing.pages.dev
- **Auth Service**: https://crebost-auth.pages.dev
- **Dashboard**: https://crebost-dashboard.pages.dev
- **Admin Panel**: https://crebost-admin.pages.dev
- **API Worker**: https://crebost-api.rendoarsandi.workers.dev
- **Webhooks Worker**: https://crebost-webhooks.rendoarsandi.workers.dev

### 🔄 Next Steps
- Test inter-service communication with Pages domains
- Implement BetterAuth authentication flows
- Deploy database schema to D1

## 🏗️ Architecture

```
crebost platform/
├── crebost-landing.pages.dev     # Landing page (Cloudflare Pages)
├── crebost-auth.pages.dev        # Authentication (BetterAuth + Pages)
├── crebost-dashboard.pages.dev   # User dashboard (Pages)
├── crebost-admin.pages.dev       # Admin panel (Pages)
├── crebost-api.rendoarsandi.workers.dev    # API worker
└── crebost-webhooks.rendoarsandi.workers.dev # Webhooks worker
```

## 🔧 Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2, KV
- **Auth**: BetterAuth
- **Payment**: Midtrans
- **Deployment**: Cloudflare Pages + Workers

## 📦 Cloudflare Resources

### Database & Storage
- **D1 Database**: `crebost-production` (ID: 23bed93f-255c-4394-95d8-3408fd23e3e5)
- **KV Namespaces**:
  - `crebost-sessions` (ID: 4ba509d0217e4fa3878c7b9df162ae79)
  - `crebost-cache` (ID: 11ac1ff7bee34d709cb2d155600a17150)
  - `crebost-analytics` (ID: 647612dcd178469bbf1b2800e4cb3451)
- **R2 Buckets**: `crebost-uploads`, `crebost-static-assets`

### Workers
- **API Worker**: Handles all API requests, authentication, data operations
- **Webhooks Worker**: Processes payment webhooks from Midtrans

## 🚀 Quick Start

### Prerequisites
```bash
npm install -g wrangler
wrangler auth login
```

### Development
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build all apps
npm run build
```

### Deployment

#### Deploy Workers
```bash
# API Worker
cd workers/api
wrangler deploy

# Webhooks Worker  
cd workers/webhooks
wrangler deploy
```

#### Deploy Pages
```bash
# Create and deploy pages
wrangler pages project create crebost-landing
wrangler pages deploy temp-static/landing --project-name crebost-landing

wrangler pages project create crebost-auth
wrangler pages deploy temp-static/auth --project-name crebost-auth

wrangler pages project create crebost-dashboard
wrangler pages deploy temp-static/dashboard --project-name crebost-dashboard

wrangler pages project create crebost-admin
wrangler pages deploy temp-static/admin --project-name crebost-admin
```

## 🔐 Environment Variables

### BetterAuth Configuration
```bash
BETTER_AUTH_SECRET=L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN
BETTER_AUTH_URL=https://auth.crebost.com
```

### Service URLs
```bash
NEXT_PUBLIC_AUTH_URL=https://crebost-auth.pages.dev
NEXT_PUBLIC_LANDING_URL=https://crebost-landing.pages.dev
NEXT_PUBLIC_DASHBOARD_URL=https://crebost-dashboard.pages.dev
NEXT_PUBLIC_ADMIN_URL=https://crebost-admin.pages.dev
```

### Payment Integration
```bash
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
```

## 🔍 API Endpoints

### Health Checks
- **API**: `GET /api/health`
- **Webhooks**: `GET /webhooks/health`

### Authentication
- **Session**: `GET /api/auth/session`
- **Login**: `POST /api/auth/login`
- **Logout**: `POST /api/auth/logout`

### Content Management
- **Get Content**: `GET /api/content`
- **Create Content**: `POST /api/content`
- **Update Content**: `PUT /api/content`
- **Delete Content**: `DELETE /api/content`

### Webhooks
- **Midtrans**: `POST /webhooks/midtrans`
- **Payment**: `POST /webhooks/payment`

## 🧪 Testing

### Test API Health
```bash
curl https://crebost-api.rendoarsandi.workers.dev/api/health
```

### Test Webhooks Health
```bash
curl https://crebost-webhooks.rendoarsandi.workers.dev/webhooks/health
```

### Test All Services
```bash
# Run communication test script
powershell -ExecutionPolicy Bypass -File scripts/test-subdomain-communication.ps1
```

## 📁 Project Structure

```
crebost/
├── apps/
│   ├── landing/          # Landing page app
│   ├── auth/             # Authentication app
│   ├── dashboard/        # User dashboard app
│   └── admin/            # Admin panel app
├── workers/
│   ├── api/              # API worker
│   └── webhooks/         # Webhooks worker
├── temp-static/          # Static pages for deployment
├── scripts/              # Deployment and test scripts
├── packages/             # Shared packages
└── cloudflare-mcp-config.json  # Cloudflare configuration
```

## 🔄 Manual Deployment

Deploy manually using Wrangler CLI commands:

### Deploy Workers
```bash
# API Worker
cd workers/api && wrangler deploy

# Webhooks Worker
cd workers/webhooks && wrangler deploy
```

### Deploy Pages
```bash
# Deploy to existing projects
wrangler pages deploy temp-static/landing --project-name crebost-landing
wrangler pages deploy temp-static/auth --project-name crebost-auth
wrangler pages deploy temp-static/dashboard --project-name crebost-dashboard
wrangler pages deploy temp-static/admin --project-name crebost-admin
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: 
   - Check TypeScript errors
   - Ensure all dependencies installed
   - Verify environment variables

2. **Deployment Failures**:
   - Check Cloudflare API token permissions
   - Verify resource IDs in wrangler.toml
   - Check account limits

3. **CORS Errors**:
   - Verify origin URLs in worker configuration
   - Check custom domain setup

### Debug Commands
```bash
# Check Wrangler auth
wrangler whoami

# List resources
wrangler d1 list
wrangler kv:namespace list
wrangler r2 bucket list

# View logs
wrangler tail crebost-api
wrangler tail crebost-webhooks
```

## 📞 Support

- **API Status**: https://crebost-api.rendoarsandi.workers.dev/api/health
- **Webhooks Status**: https://crebost-webhooks.rendoarsandi.workers.dev/webhooks/health
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Repository**: https://github.com/rendoarsandi/crebost

---

## 🎉 Deployment Complete!

**Status**: ✅ ALL SERVICES DEPLOYED AND LIVE WITH PAGES DOMAINS!
**Last Updated**: 2025-06-19
**Configuration**: Using Cloudflare Pages default domains for inter-service communication
**Next**: Implement BetterAuth flows and deploy database schema

### 🚀 All Services Successfully Deployed:
- ✅ Landing Page: Live and accessible
- ✅ Auth Service: Live with BetterAuth ready
- ✅ Dashboard: Live with creator tools
- ✅ Admin Panel: Live with admin controls
- ✅ API Worker: Live with health checks
- ✅ Webhooks Worker: Live for payment processing

### 🔗 Quick Access Links:
- **Landing**: https://crebost-landing.pages.dev (Latest: https://e1d3e307.crebost-landing.pages.dev)
- **Auth**: https://crebost-auth.pages.dev (Latest: https://2f201f4d.crebost-auth.pages.dev)
- **Dashboard**: https://crebost-dashboard.pages.dev (Latest: https://5ff0f4bf.crebost-dashboard.pages.dev)
- **Admin**: https://crebost-admin.pages.dev (Latest: https://b9c9d885.crebost-admin.pages.dev)
- **API Health**: https://crebost-api.rendoarsandi.workers.dev/api/health
- **Webhooks Health**: https://crebost-webhooks.rendoarsandi.workers.dev/webhooks/health
