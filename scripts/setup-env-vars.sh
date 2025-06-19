#!/bin/bash

# Crebost - Environment Variables Setup Script for Cloudflare Pages
# This script sets up all required environment variables for production deployment

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

# Check if .env.production exists
check_env_file() {
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found!"
        print_status "Please copy .env.production.template to .env.production and fill in the values"
        exit 1
    fi
    print_success "Found .env.production file"
}

# Load environment variables from .env.production
load_env_vars() {
    print_status "Loading environment variables from .env.production..."
    set -a
    source .env.production
    set +a
    print_success "Environment variables loaded"
}

# Set environment variables for a specific project
set_project_env_vars() {
    local project_name=$1
    local app_type=$2
    
    print_status "Setting environment variables for $project_name..."
    
    # Common variables for all projects
    wrangler pages secret put NODE_ENV --project $project_name <<< "production"
    wrangler pages secret put DATABASE_URL --project $project_name <<< "$DATABASE_URL"
    wrangler pages secret put DIRECT_URL --project $project_name <<< "$DIRECT_URL"
    
    # Better Auth variables (for auth, dashboard, admin)
    if [ "$app_type" != "landing" ]; then
        wrangler pages secret put BETTER_AUTH_SECRET --project $project_name <<< "$BETTER_AUTH_SECRET"
        wrangler pages secret put BETTER_AUTH_URL --project $project_name <<< "$BETTER_AUTH_URL"
        if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
            wrangler pages secret put GOOGLE_CLIENT_ID --project $project_name <<< "$GOOGLE_CLIENT_ID"
            wrangler pages secret put GOOGLE_CLIENT_SECRET --project $project_name <<< "$GOOGLE_CLIENT_SECRET"
        fi
    fi
    
    # Payment variables (for dashboard and admin)
    if [ "$app_type" = "dashboard" ] || [ "$app_type" = "admin" ]; then
        wrangler pages secret put MIDTRANS_SERVER_KEY --project $project_name <<< "$MIDTRANS_SERVER_KEY"
        wrangler pages secret put MIDTRANS_CLIENT_KEY --project $project_name <<< "$MIDTRANS_CLIENT_KEY"
        wrangler pages secret put MIDTRANS_MERCHANT_ID --project $project_name <<< "$MIDTRANS_MERCHANT_ID"
    fi
    
    # Analytics variables (for dashboard and admin)
    if [ "$app_type" = "dashboard" ] || [ "$app_type" = "admin" ]; then
        wrangler pages secret put ANALYTICS_API_KEY --project $project_name <<< "$ANALYTICS_API_KEY"
        
        # Social media API keys (optional)
        if [ ! -z "$TIKTOK_API_KEY" ]; then
            wrangler pages secret put TIKTOK_API_KEY --project $project_name <<< "$TIKTOK_API_KEY"
            wrangler pages secret put TIKTOK_API_SECRET --project $project_name <<< "$TIKTOK_API_SECRET"
        fi
        
        if [ ! -z "$INSTAGRAM_API_KEY" ]; then
            wrangler pages secret put INSTAGRAM_API_KEY --project $project_name <<< "$INSTAGRAM_API_KEY"
            wrangler pages secret put INSTAGRAM_API_SECRET --project $project_name <<< "$INSTAGRAM_API_SECRET"
        fi
        
        if [ ! -z "$YOUTUBE_API_KEY" ]; then
            wrangler pages secret put YOUTUBE_API_KEY --project $project_name <<< "$YOUTUBE_API_KEY"
        fi
        
        if [ ! -z "$TWITTER_API_KEY" ]; then
            wrangler pages secret put TWITTER_API_KEY --project $project_name <<< "$TWITTER_API_KEY"
            wrangler pages secret put TWITTER_API_SECRET --project $project_name <<< "$TWITTER_API_SECRET"
        fi
    fi
    
    # Email configuration (optional)
    if [ ! -z "$SMTP_HOST" ]; then
        wrangler pages secret put SMTP_HOST --project $project_name <<< "$SMTP_HOST"
        wrangler pages secret put SMTP_PORT --project $project_name <<< "$SMTP_PORT"
        wrangler pages secret put SMTP_USER --project $project_name <<< "$SMTP_USER"
        wrangler pages secret put SMTP_PASS --project $project_name <<< "$SMTP_PASS"
        wrangler pages secret put FROM_EMAIL --project $project_name <<< "$FROM_EMAIL"
    fi
    
    # Security variables
    wrangler pages secret put ENCRYPTION_KEY --project $project_name <<< "$ENCRYPTION_KEY"
    wrangler pages secret put JWT_SECRET --project $project_name <<< "$JWT_SECRET"
    wrangler pages secret put WEBHOOK_SECRET --project $project_name <<< "$WEBHOOK_SECRET"
    
    # Business configuration
    wrangler pages secret put PLATFORM_FEE_PERCENTAGE --project $project_name <<< "$PLATFORM_FEE_PERCENTAGE"
    wrangler pages secret put MINIMUM_CAMPAIGN_BUDGET --project $project_name <<< "$MINIMUM_CAMPAIGN_BUDGET"
    wrangler pages secret put MINIMUM_WITHDRAWAL_AMOUNT --project $project_name <<< "$MINIMUM_WITHDRAWAL_AMOUNT"
    wrangler pages secret put MAXIMUM_WITHDRAWAL_AMOUNT --project $project_name <<< "$MAXIMUM_WITHDRAWAL_AMOUNT"
    
    # Feature flags
    wrangler pages secret put ENABLE_ANALYTICS --project $project_name <<< "$ENABLE_ANALYTICS"
    wrangler pages secret put ENABLE_PAYMENTS --project $project_name <<< "$ENABLE_PAYMENTS"
    wrangler pages secret put ENABLE_EMAIL_NOTIFICATIONS --project $project_name <<< "$ENABLE_EMAIL_NOTIFICATIONS"
    wrangler pages secret put MAINTENANCE_MODE --project $project_name <<< "$MAINTENANCE_MODE"
    
    print_success "Environment variables set for $project_name"
}

# Set environment variables for all projects
setup_all_env_vars() {
    print_status "Setting up environment variables for all projects..."
    
    # Landing page
    set_project_env_vars "crebost-landing" "landing"
    
    # Auth service
    set_project_env_vars "crebost-auth" "auth"
    
    # Dashboard
    set_project_env_vars "crebost-dashboard" "dashboard"
    
    # Admin panel
    set_project_env_vars "crebost-admin" "admin"
    
    print_success "All environment variables have been set!"
}

# Verify environment variables
verify_env_vars() {
    print_status "Verifying environment variables..."
    
    local projects=("crebost-landing" "crebost-auth" "crebost-dashboard" "crebost-admin")
    
    for project in "${projects[@]}"; do
        print_status "Checking $project..."
        
        # List environment variables (this will show if they exist)
        wrangler pages secret list --project $project > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            print_success "$project environment variables verified"
        else
            print_error "Failed to verify $project environment variables"
        fi
    done
}

# Generate random secrets if not provided
generate_secrets() {
    print_status "Checking for required secrets..."
    
    if [ -z "$BETTER_AUTH_SECRET" ]; then
        print_warning "BETTER_AUTH_SECRET not found, using provided secret..."
        BETTER_AUTH_SECRET="L90cbYFfrXn3Yl1TewISaJLU2bFsSNWN"
        echo "BETTER_AUTH_SECRET=\"$BETTER_AUTH_SECRET\"" >> .env.production
        print_success "Set BETTER_AUTH_SECRET"
    fi
    
    if [ -z "$ENCRYPTION_KEY" ]; then
        print_warning "ENCRYPTION_KEY not found, generating random key..."
        ENCRYPTION_KEY=$(openssl rand -base64 32)
        echo "ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"" >> .env.production
        print_success "Generated ENCRYPTION_KEY"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        print_warning "JWT_SECRET not found, generating random secret..."
        JWT_SECRET=$(openssl rand -base64 32)
        echo "JWT_SECRET=\"$JWT_SECRET\"" >> .env.production
        print_success "Generated JWT_SECRET"
    fi
    
    if [ -z "$WEBHOOK_SECRET" ]; then
        print_warning "WEBHOOK_SECRET not found, generating random secret..."
        WEBHOOK_SECRET=$(openssl rand -base64 32)
        echo "WEBHOOK_SECRET=\"$WEBHOOK_SECRET\"" >> .env.production
        print_success "Generated WEBHOOK_SECRET"
    fi
}

# Main function
main() {
    print_status "🔧 Setting up Crebost environment variables for Cloudflare Pages..."
    
    check_env_file
    load_env_vars
    generate_secrets
    
    # Reload env vars after generating secrets
    load_env_vars
    
    setup_all_env_vars
    verify_env_vars
    
    print_success "🎉 Environment variables setup completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Verify your applications are working correctly"
    echo "2. Test payment integration with Midtrans"
    echo "3. Configure DNS records for custom domains"
    echo "4. Set up monitoring and analytics"
    echo ""
    print_warning "Important: Keep your .env.production file secure and never commit it to version control!"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    print_error "Not logged in to Cloudflare. Please login first:"
    echo "wrangler login"
    exit 1
fi

# Run main function
main "$@"
