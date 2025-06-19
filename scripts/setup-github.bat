@echo off
setlocal enabledelayedexpansion

REM Crebost - GitHub Repository Setup Script (Windows)
REM This script prepares the repository for GitHub and sets up CI/CD

echo [INFO] Setting up Crebost repository for GitHub...
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)
echo [SUCCESS] Git is available

REM Initialize git repository if not already initialized
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    echo [SUCCESS] Git repository initialized
) else (
    echo [INFO] Git repository already exists
)

REM Setup git remote
echo [INFO] Setting up GitHub remote...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin https://github.com/rendoarsandi/crebost.git
) else (
    echo [WARNING] Remote 'origin' already exists. Updating URL...
    git remote set-url origin https://github.com/rendoarsandi/crebost.git
)
echo [SUCCESS] GitHub remote configured: https://github.com/rendoarsandi/crebost.git

REM Create .env.local from template if it doesn't exist
if not exist ".env.local" (
    echo [INFO] Creating .env.local for development...
    (
        echo # Development Environment Variables
        echo DATABASE_URL="postgresql://postgres:password@localhost:5432/crebost_dev"
        echo BETTER_AUTH_SECRET="L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN"
        echo BETTER_AUTH_URL="http://localhost:3001"
        echo NEXT_PUBLIC_LANDING_URL="http://localhost:3000"
        echo NEXT_PUBLIC_AUTH_URL="http://localhost:3001"
        echo NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3002"
        echo NEXT_PUBLIC_ADMIN_URL="http://localhost:3003"
        echo NODE_ENV="development"
    ) > .env.local
    echo [SUCCESS] Created .env.local for development
) else (
    echo [INFO] .env.local already exists
)

REM Stage all files for commit
echo [INFO] Staging files for commit...
git add .

REM Check if there are any changes to commit
git diff --staged --quiet
if errorlevel 1 (
    echo [SUCCESS] Files staged for commit
    
    REM Create initial commit
    echo [INFO] Creating initial commit...
    git commit -m "🚀 Initial commit: Crebost platform with Better Auth

Features:
- Multi-app architecture (landing, auth, dashboard, admin)
- Better Auth integration for authentication
- Prisma database with PostgreSQL
- Midtrans payment integration
- Cloudflare deployment configuration
- Complete CI/CD pipeline
- Analytics and tracking system
- Admin panel for user management
- Real-time campaign analytics

Tech Stack:
- Next.js 14 with TypeScript
- Better Auth for authentication
- Prisma ORM with PostgreSQL
- Tailwind CSS for styling
- Cloudflare Pages for deployment
- Turbo for monorepo management"
    
    echo [SUCCESS] Initial commit created
    
    REM Ask user if they want to push to GitHub
    echo.
    set /p push="Push to GitHub now? (y/N): "
    if /i "!push!"=="y" (
        echo [INFO] Pushing to GitHub...
        git branch -M main
        git push -u origin main
        echo [SUCCESS] Code pushed to GitHub successfully!
        echo.
        goto :show_secrets
    ) else (
        echo [INFO] Skipping GitHub push. You can push later with: git push -u origin main
    )
) else (
    echo [WARNING] No changes to commit. Repository is already up to date.
)

:show_secrets
echo [INFO] GitHub Secrets Configuration Required:
echo.
echo Please add these secrets to your GitHub repository:
echo Repository Settings → Secrets and variables → Actions → New repository secret
echo.
echo Required secrets:
echo • CLOUDFLARE_API_TOKEN - Your Cloudflare API token
echo • CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID
echo • DATABASE_URL - Production database connection string
echo • BETTER_AUTH_SECRET - L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN
echo • MIDTRANS_SERVER_KEY - Your Midtrans server key
echo • MIDTRANS_CLIENT_KEY - Your Midtrans client key
echo • MIDTRANS_MERCHANT_ID - Your Midtrans merchant ID
echo • GOOGLE_CLIENT_ID - Google OAuth client ID (optional)
echo • GOOGLE_CLIENT_SECRET - Google OAuth client secret (optional)
echo.
echo [WARNING] CI/CD will not work until these secrets are configured!

echo.
echo [SUCCESS] 🎉 Repository setup complete!
echo.
echo [INFO] Next steps:
echo 1. Configure GitHub secrets (see above)
echo 2. Setup your production database
echo 3. Configure Cloudflare account and domain
echo 4. Setup Midtrans account for payments
echo 5. Push changes to trigger CI/CD deployment
echo.
echo [INFO] Development:
echo • Run 'npm install' to install dependencies
echo • Run 'npm run dev' to start development servers
echo • Run 'npm run db:push' to setup database schema
echo.
echo [INFO] Production Deployment:
echo • Configure .env.production with your values
echo • Run 'npm run deploy:full' for manual deployment
echo • Or push to main branch for automatic CI/CD deployment
echo.
echo [INFO] Repository: https://github.com/rendoarsandi/crebost

pause
