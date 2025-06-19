#!/bin/bash

# Crebost - GitHub Repository Setup Script
# This script prepares the repository for GitHub and sets up CI/CD

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is available"
}

# Initialize git repository if not already initialized
init_git() {
    if [ ! -d ".git" ]; then
        print_status "Initializing Git repository..."
        git init
        print_success "Git repository initialized"
    else
        print_status "Git repository already exists"
    fi
}

# Setup git remote
setup_remote() {
    local repo_url="https://github.com/rendoarsandi/crebost.git"
    
    print_status "Setting up GitHub remote..."
    
    # Check if remote already exists
    if git remote get-url origin &> /dev/null; then
        print_warning "Remote 'origin' already exists. Updating URL..."
        git remote set-url origin $repo_url
    else
        git remote add origin $repo_url
    fi
    
    print_success "GitHub remote configured: $repo_url"
}

# Create .env.local from template if it doesn't exist
setup_env_local() {
    if [ ! -f ".env.local" ]; then
        print_status "Creating .env.local for development..."
        cp .env.local.example .env.local 2>/dev/null || {
            print_warning ".env.local.example not found, creating basic .env.local"
            cat > .env.local << EOF
# Development Environment Variables
DATABASE_URL="postgresql://postgres:password@localhost:5432/crebost_dev"
BETTER_AUTH_SECRET="L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN"
BETTER_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_LANDING_URL="http://localhost:3000"
NEXT_PUBLIC_AUTH_URL="http://localhost:3001"
NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3002"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3003"
NODE_ENV="development"
EOF
        }
        print_success "Created .env.local for development"
    else
        print_status ".env.local already exists"
    fi
}

# Stage all files for commit
stage_files() {
    print_status "Staging files for commit..."
    
    # Add all files except those in .gitignore
    git add .
    
    # Check if there are any changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
        return 1
    else
        print_success "Files staged for commit"
        return 0
    fi
}

# Create initial commit
create_commit() {
    print_status "Creating initial commit..."
    
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

    print_success "Initial commit created"
}

# Push to GitHub
push_to_github() {
    print_status "Pushing to GitHub..."
    
    # Set upstream and push
    git branch -M main
    git push -u origin main
    
    print_success "Code pushed to GitHub successfully!"
}

# Display GitHub secrets that need to be configured
display_github_secrets() {
    print_status "GitHub Secrets Configuration Required:"
    echo ""
    echo "Please add these secrets to your GitHub repository:"
    echo "Repository Settings → Secrets and variables → Actions → New repository secret"
    echo ""
    echo "Required secrets:"
    echo "• CLOUDFLARE_API_TOKEN - Your Cloudflare API token"
    echo "• CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID"
    echo "• DATABASE_URL - Production database connection string"
    echo "• BETTER_AUTH_SECRET - L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN"
    echo "• MIDTRANS_SERVER_KEY - Your Midtrans server key"
    echo "• MIDTRANS_CLIENT_KEY - Your Midtrans client key"
    echo "• MIDTRANS_MERCHANT_ID - Your Midtrans merchant ID"
    echo "• GOOGLE_CLIENT_ID - Google OAuth client ID (optional)"
    echo "• GOOGLE_CLIENT_SECRET - Google OAuth client secret (optional)"
    echo ""
    print_warning "CI/CD will not work until these secrets are configured!"
}

# Display next steps
display_next_steps() {
    print_success "🎉 Repository setup complete!"
    echo ""
    print_status "Next steps:"
    echo "1. Configure GitHub secrets (see above)"
    echo "2. Setup your production database"
    echo "3. Configure Cloudflare account and domain"
    echo "4. Setup Midtrans account for payments"
    echo "5. Push changes to trigger CI/CD deployment"
    echo ""
    print_status "Development:"
    echo "• Run 'npm install' to install dependencies"
    echo "• Run 'npm run dev' to start development servers"
    echo "• Run 'npm run db:push' to setup database schema"
    echo ""
    print_status "Production Deployment:"
    echo "• Configure .env.production with your values"
    echo "• Run 'npm run deploy:full' for manual deployment"
    echo "• Or push to main branch for automatic CI/CD deployment"
    echo ""
    print_status "Repository: https://github.com/rendoarsandi/crebost"
}

# Main function
main() {
    print_status "🚀 Setting up Crebost repository for GitHub..."
    echo ""
    
    check_git
    init_git
    setup_remote
    setup_env_local
    
    if stage_files; then
        create_commit
        
        # Ask user if they want to push to GitHub
        echo ""
        read -p "Push to GitHub now? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            push_to_github
            echo ""
            display_github_secrets
        else
            print_status "Skipping GitHub push. You can push later with: git push -u origin main"
        fi
    else
        print_status "No changes to commit. Repository is already up to date."
    fi
    
    echo ""
    display_next_steps
}

# Run main function
main "$@"
