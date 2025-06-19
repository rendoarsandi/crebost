# 🔐 GitHub Secrets Configuration

This document explains how to configure GitHub Secrets for the Crebost CI/CD pipeline.

## 📋 Required Secrets

Navigate to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 🌐 Cloudflare Configuration

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages, D1, KV, R2 permissions | `abc123...` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | `def456...` |

**How to get Cloudflare credentials:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Create API token with these permissions:
   - Zone:Zone:Read
   - Zone:Page Rules:Edit
   - Account:Cloudflare Pages:Edit
   - Account:D1:Edit
   - Account:Workers KV Storage:Edit
   - Account:R2:Edit

### 🗄️ Database Configuration

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DATABASE_URL` | Production PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### 🔐 Authentication Configuration

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `BETTER_AUTH_SECRET` | Better Auth secret key | `L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN` |

### 💳 Payment Configuration (Midtrans)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `MIDTRANS_SERVER_KEY` | Midtrans server key | `SB-Mid-server-...` |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key | `SB-Mid-client-...` |
| `MIDTRANS_MERCHANT_ID` | Midtrans merchant ID | `G123456789` |

**How to get Midtrans credentials:**
1. Register at [Midtrans](https://midtrans.com/)
2. Go to Settings → Access Keys
3. Use Sandbox keys for testing, Production keys for live

### 🔑 Google OAuth (Optional)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |

**How to get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://auth.crebost.com/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google` (for development)

## 🚀 Setting Up Secrets

### Method 1: GitHub Web Interface

1. Go to your repository on GitHub
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the secret name and value
6. Click **Add secret**

### Method 2: GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Login to GitHub
gh auth login

# Add secrets
gh secret set CLOUDFLARE_API_TOKEN --body "your-api-token"
gh secret set CLOUDFLARE_ACCOUNT_ID --body "your-account-id"
gh secret set DATABASE_URL --body "postgresql://user:pass@host:5432/db"
gh secret set BETTER_AUTH_SECRET --body "L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN"
gh secret set MIDTRANS_SERVER_KEY --body "your-server-key"
gh secret set MIDTRANS_CLIENT_KEY --body "your-client-key"
gh secret set MIDTRANS_MERCHANT_ID --body "your-merchant-id"

# Optional: Google OAuth
gh secret set GOOGLE_CLIENT_ID --body "your-google-client-id"
gh secret set GOOGLE_CLIENT_SECRET --body "your-google-client-secret"
```

## 🔍 Verification

After adding all secrets, you can verify they're configured correctly:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all the secrets listed (values are hidden)
3. Push a commit to trigger the CI/CD pipeline
4. Check the **Actions** tab to see if the deployment succeeds

## 🚨 Security Best Practices

### ✅ Do's
- Use environment-specific secrets (staging vs production)
- Rotate secrets regularly
- Use least-privilege access for API tokens
- Monitor secret usage in audit logs

### ❌ Don'ts
- Never commit secrets to code
- Don't share secrets in plain text
- Don't use production secrets in development
- Don't log secret values

## 🔄 Environment-Specific Secrets

For different environments, you can use GitHub Environments:

1. Go to **Settings** → **Environments**
2. Create environments: `staging`, `production`
3. Add environment-specific secrets
4. Configure protection rules

Example environment setup:
```yaml
# In .github/workflows/deploy-cloudflare.yml
environment: production
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Secret not found" error**
   - Verify secret name matches exactly (case-sensitive)
   - Check if secret is added to correct repository

2. **"Invalid API token" error**
   - Verify Cloudflare API token has correct permissions
   - Check if token is expired

3. **"Database connection failed" error**
   - Verify DATABASE_URL format
   - Check if database server is accessible
   - Ensure database exists

4. **"Midtrans authentication failed" error**
   - Verify Midtrans credentials
   - Check if using correct environment (sandbox vs production)

### Debug Steps:

1. Check GitHub Actions logs for specific error messages
2. Verify all required secrets are configured
3. Test credentials manually outside of CI/CD
4. Check service status pages for outages

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Midtrans Documentation](https://docs.midtrans.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**⚠️ Important**: Never share or commit these secret values. Keep them secure and rotate them regularly for better security.
