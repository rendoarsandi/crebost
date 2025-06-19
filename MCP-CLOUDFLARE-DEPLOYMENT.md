# 🚀 Crebost - MCP Cloudflare Deployment Guide

## 📋 Overview

This guide explains how to deploy the Crebost platform using MCP Cloudflare with D1 database, KV storage, and R2 buckets.

### 🏗️ Architecture

```
Cloudflare Infrastructure:
├── D1 Database (SQLite)
│   └── crebost-production
├── KV Namespaces
│   ├── crebost-sessions (auth sessions)
│   ├── crebost-cache (app cache)
│   └── crebost-analytics (analytics data)
├── R2 Buckets
│   ├── crebost-uploads (user files)
│   └── crebost-static-assets (static files)
└── Pages Projects
    ├── crebost-landing (landing.crebost.com)
    ├── crebost-auth (auth.crebost.com)
    ├── crebost-dashboard (dashboard.crebost.com)
    └── crebost-admin (admin.crebost.com)
```

## 🔧 Configuration Files

### 1. MCP Global Configuration
File: `mcp-cloudflare-deployment.json` (stored in augmentcode global)

This file contains the complete deployment configuration including:
- D1 database settings
- KV namespace configurations
- R2 bucket settings
- Pages project configurations
- Environment variables
- DNS records
- Deployment steps

### 2. Local Configuration
File: `cloudflare-mcp-config.json` (project root)

Simplified configuration for local MCP commands.

## 🚀 Deployment Steps

### Step 1: Cleanup Existing Resources

```bash
# Using MCP Cloudflare commands
mcp cloudflare cleanup --all --confirm

# Or individual cleanup:
mcp cloudflare pages delete --all
mcp cloudflare d1 delete --all
mcp cloudflare kv delete --all
mcp cloudflare r2 delete --all
mcp cloudflare workers delete --all
```

### Step 2: Create Resources

```bash
# Create D1 database
mcp cloudflare d1 create --name "crebost-production" --location auto

# Create KV namespaces
mcp cloudflare kv create --title "crebost-sessions"
mcp cloudflare kv create --title "crebost-cache"
mcp cloudflare kv create --title "crebost-analytics"

# Create R2 buckets
mcp cloudflare r2 create --name "crebost-uploads"
mcp cloudflare r2 create --name "crebost-static-assets"
```

### Step 3: Build Applications

```bash
# Install dependencies
npm install

# Build shared packages
npm run build --workspace=@crebost/shared
npm run build --workspace=@crebost/database
npm run build --workspace=@crebost/ui

# Build applications
npm run build --workspace=@crebost/landing
npm run build --workspace=@crebost/auth
npm run build --workspace=@crebost/dashboard
npm run build --workspace=@crebost/admin
```

### Step 4: Deploy to Pages

```bash
# Deploy using MCP with configuration
mcp cloudflare pages deploy --config mcp-cloudflare-deployment.json

# Or deploy individually:
mcp cloudflare pages deploy --project crebost-landing --source apps/landing/dist
mcp cloudflare pages deploy --project crebost-auth --source apps/auth/.next
mcp cloudflare pages deploy --project crebost-dashboard --source apps/dashboard/.next
mcp cloudflare pages deploy --project crebost-admin --source apps/admin/.next
```

### Step 5: Configure Bindings

```bash
# Bind D1 database to Pages projects
mcp cloudflare pages binding add --project crebost-auth --type d1 --name DB --database crebost-production
mcp cloudflare pages binding add --project crebost-dashboard --type d1 --name DB --database crebost-production
mcp cloudflare pages binding add --project crebost-admin --type d1 --name DB --database crebost-production

# Bind KV namespaces
mcp cloudflare pages binding add --project crebost-auth --type kv --name SESSIONS --namespace crebost-sessions
mcp cloudflare pages binding add --project crebost-dashboard --type kv --name CACHE --namespace crebost-cache

# Bind R2 buckets
mcp cloudflare pages binding add --project crebost-dashboard --type r2 --name UPLOADS --bucket crebost-uploads
mcp cloudflare pages binding add --project crebost-admin --type r2 --name UPLOADS --bucket crebost-uploads
```

### Step 6: Setup Custom Domains

```bash
# Add custom domains
mcp cloudflare pages domain add --project crebost-landing --domain landing.crebost.com
mcp cloudflare pages domain add --project crebost-auth --domain auth.crebost.com
mcp cloudflare pages domain add --project crebost-dashboard --domain dashboard.crebost.com
mcp cloudflare pages domain add --project crebost-admin --domain admin.crebost.com

# Configure DNS records
mcp cloudflare dns add --type CNAME --name landing --content crebost-landing.pages.dev
mcp cloudflare dns add --type CNAME --name auth --content crebost-auth.pages.dev
mcp cloudflare dns add --type CNAME --name dashboard --content crebost-dashboard.pages.dev
mcp cloudflare dns add --type CNAME --name admin --content crebost-admin.pages.dev
```

### Step 7: Database Migration

```bash
# Generate Prisma client for D1
npx prisma generate

# Push schema to D1 database
npx prisma db push --force-reset

# Optional: Seed initial data
npx prisma db seed
```

## 🔧 Environment Variables

### Required Environment Variables

Set these in each Pages project:

```bash
# Authentication
BETTER_AUTH_SECRET="L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN"
BETTER_AUTH_URL="https://auth.crebost.com"

# Application URLs
NEXT_PUBLIC_LANDING_URL="https://landing.crebost.com"
NEXT_PUBLIC_AUTH_URL="https://auth.crebost.com"
NEXT_PUBLIC_DASHBOARD_URL="https://dashboard.crebost.com"
NEXT_PUBLIC_ADMIN_URL="https://admin.crebost.com"

# Payment (when ready)
MIDTRANS_SERVER_KEY="your-midtrans-server-key"
MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
MIDTRANS_MERCHANT_ID="your-midtrans-merchant-id"
```

### Setting Environment Variables with MCP

```bash
# Set environment variables for each project
mcp cloudflare pages env set --project crebost-auth --name BETTER_AUTH_SECRET --value "L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN"
mcp cloudflare pages env set --project crebost-auth --name BETTER_AUTH_URL --value "https://auth.crebost.com"

# Repeat for other projects and variables...
```

## 🔍 Verification

### Health Check URLs

After deployment, verify these endpoints:

```bash
# Health checks
curl https://landing.crebost.com
curl https://auth.crebost.com/api/health
curl https://dashboard.crebost.com/api/health
curl https://admin.crebost.com/api/health

# Database connectivity
curl https://auth.crebost.com/api/db-test
```

### Test Functionality

1. **Landing Page**: Marketing site loads correctly
2. **Authentication**: User registration and login
3. **Dashboard**: Campaign creation and management
4. **Admin Panel**: User management and moderation
5. **Database**: Data persistence across sessions
6. **File Upload**: R2 bucket integration
7. **Analytics**: KV storage for events

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

2. **D1 Connection Issues**
   ```bash
   # Check D1 binding
   mcp cloudflare pages binding list --project crebost-auth
   
   # Test D1 connection
   mcp cloudflare d1 query --database crebost-production --sql "SELECT 1"
   ```

3. **KV Access Issues**
   ```bash
   # Check KV binding
   mcp cloudflare pages binding list --project crebost-dashboard
   
   # Test KV access
   mcp cloudflare kv put --namespace crebost-sessions --key test --value "working"
   ```

4. **R2 Upload Issues**
   ```bash
   # Check R2 binding
   mcp cloudflare pages binding list --project crebost-dashboard
   
   # Test R2 access
   mcp cloudflare r2 put --bucket crebost-uploads --key test.txt --file test.txt
   ```

### Debug Commands

```bash
# View deployment logs
mcp cloudflare pages logs --project crebost-dashboard --tail

# Check resource status
mcp cloudflare d1 list
mcp cloudflare kv list
mcp cloudflare r2 list
mcp cloudflare pages list

# Monitor real-time metrics
mcp cloudflare analytics --project crebost-dashboard --live
```

## 📊 Monitoring

### Analytics Setup

```bash
# Enable analytics for all projects
mcp cloudflare pages analytics enable --project crebost-landing
mcp cloudflare pages analytics enable --project crebost-auth
mcp cloudflare pages analytics enable --project crebost-dashboard
mcp cloudflare pages analytics enable --project crebost-admin
```

### Performance Monitoring

```bash
# Enable Real User Monitoring
mcp cloudflare rum enable --zone crebost.com

# Setup alerts
mcp cloudflare alerts create --type "pages_deployment_failed"
mcp cloudflare alerts create --type "d1_query_errors"
mcp cloudflare alerts create --type "r2_upload_errors"
```

## 🔄 Automated Deployment Script

Use the provided script for automated deployment:

```bash
# Make script executable
chmod +x scripts/deploy-mcp-cloudflare.sh

# Run deployment
./scripts/deploy-mcp-cloudflare.sh

# Show MCP commands only
./scripts/deploy-mcp-cloudflare.sh --show-commands
```

## 📚 Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [MCP Cloudflare Documentation](https://docs.mcp.dev/cloudflare)

---

**🎉 Your Crebost platform will be fully deployed on Cloudflare infrastructure with D1, KV, and R2!**
