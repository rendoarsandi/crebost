# 🚀 Crebost Cloudflare Deployment Setup

## ✅ Deployment Status

### Resources Created
- **D1 Database**: `crebost-production` (ID: `23bed93f-2555c-4394-95d8-3408fd23e3e5`)
- **KV Namespaces**:
  - Sessions: `4ba509d0217e4fa3878c77b9df162ae79`
  - Cache: `11ac1ff7bee34d709cb2dd15600a17150`
  - Analytics: `647612dcd178469bbf1b2809e4cb3451`
- **R2 Buckets**:
  - Uploads: `crebost-uploads`
  - Static Assets: `crebost-static-assets`

### Deployed Applications
- ✅ **Landing Page**: https://e8a430f9.crebost-landing.pages.dev
- ⏳ **Auth Service**: Pending
- ⏳ **Dashboard**: Pending  
- ⏳ **Admin Panel**: Pending

## 🔧 GitHub Secrets Setup

To enable CI/CD pipeline, add these secrets to your GitHub repository:

### Required Secrets
1. **CLOUDFLARE_API_TOKEN**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Create token with permissions:
     - Zone:Zone:Read
     - Zone:Page Rules:Edit
     - Account:Cloudflare Pages:Edit
     - Account:D1:Edit
     - Account:Workers KV Storage:Edit
     - Account:R2:Edit

2. **CLOUDFLARE_ACCOUNT_ID**
   - Find in Cloudflare Dashboard → Right sidebar
   - Format: `1234567890abcdef1234567890abcdef`

3. **DATABASE_URL** (for build process)
   - Value: `file:./dev.db`

### How to Add Secrets
1. Go to your GitHub repo: https://github.com/rendoarsandi/crebost
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

## 🌐 Custom Domains (Optional)

To setup custom domains, configure these DNS records:

```
Type: CNAME, Name: landing, Target: crebost-landing.pages.dev
Type: CNAME, Name: auth, Target: crebost-auth.pages.dev  
Type: CNAME, Name: dashboard, Target: crebost-dashboard.pages.dev
Type: CNAME, Name: admin, Target: crebost-admin.pages.dev
```

Then run:
```bash
wrangler pages domain add crebost-landing landing.crebost.com
wrangler pages domain add crebost-auth auth.crebost.com
wrangler pages domain add crebost-dashboard dashboard.crebost.com
wrangler pages domain add crebost-admin admin.crebost.com
```

## 🔄 Manual Deployment Commands

If you need to deploy manually:

```bash
# Deploy Landing Page
cd apps/landing
npm run build
wrangler pages deploy out --project-name=crebost-landing

# Deploy Auth Service (after fixing build issues)
cd apps/auth
npm run build
wrangler pages deploy .next --project-name=crebost-auth

# Deploy Dashboard (after fixing build issues)
cd apps/dashboard  
npm run build
wrangler pages deploy .next --project-name=crebost-dashboard

# Deploy Admin Panel (after fixing build issues)
cd apps/admin
npm run build
wrangler pages deploy .next --project-name=crebost-admin
```

## ⚠️ Known Issues

1. **Build Errors**: Auth, Dashboard, and Admin apps have TypeScript errors due to NextAuth → BetterAuth migration
2. **Missing Exports**: Some shared package exports are missing
3. **Database Schema**: Needs to be pushed to D1 database

## 🔧 Next Steps

1. Fix TypeScript build errors in auth, dashboard, and admin apps
2. Complete BetterAuth integration
3. Push database schema to D1
4. Setup GitHub secrets for CI/CD
5. Test all deployments

## 📞 Support

For deployment issues, check:
- Cloudflare Dashboard: https://dash.cloudflare.com
- Wrangler logs: `~/.wrangler/logs/`
- GitHub Actions: Repository → Actions tab
