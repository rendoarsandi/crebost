#!/bin/bash

# Crebost - Cloudflare Deployment Script
# This script automates the deployment of all Crebost applications to Cloudflare

set -e

echo "🚀 Starting Crebost Cloudflare Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI not found. Please install it first:"
        echo "npm install -g wrangler"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install Node.js and npm first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Login to Cloudflare
cloudflare_login() {
    print_status "Checking Cloudflare authentication..."
    
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged in to Cloudflare. Please login:"
        wrangler login
    fi
    
    print_success "Cloudflare authentication verified"
}

# Clean up existing resources
cleanup_resources() {
    print_status "Cleaning up existing Cloudflare resources..."
    
    # List and delete existing Pages projects
    print_status "Cleaning up Pages projects..."
    wrangler pages project list | grep -E "(crebost-|crebost_)" | while read -r project; do
        project_name=$(echo $project | awk '{print $1}')
        print_warning "Deleting Pages project: $project_name"
        wrangler pages project delete $project_name --compatibility-date=2024-01-15 || true
    done
    
    # List and delete D1 databases
    print_status "Cleaning up D1 databases..."
    wrangler d1 list | grep -E "(crebost|CREBOST)" | while read -r line; do
        db_name=$(echo $line | awk '{print $2}')
        if [ ! -z "$db_name" ]; then
            print_warning "Deleting D1 database: $db_name"
            wrangler d1 delete $db_name --force || true
        fi
    done
    
    # List and delete KV namespaces
    print_status "Cleaning up KV namespaces..."
    wrangler kv:namespace list | grep -E "(crebost|CREBOST)" | while read -r line; do
        namespace_id=$(echo $line | jq -r '.id' 2>/dev/null || echo "")
        namespace_title=$(echo $line | jq -r '.title' 2>/dev/null || echo "")
        if [ ! -z "$namespace_id" ] && [ "$namespace_id" != "null" ]; then
            print_warning "Deleting KV namespace: $namespace_title ($namespace_id)"
            wrangler kv:namespace delete --namespace-id=$namespace_id --force || true
        fi
    done
    
    # List and delete R2 buckets
    print_status "Cleaning up R2 buckets..."
    wrangler r2 bucket list | grep -E "(crebost|CREBOST)" | while read -r bucket; do
        if [ ! -z "$bucket" ]; then
            print_warning "Deleting R2 bucket: $bucket"
            wrangler r2 bucket delete $bucket --force || true
        fi
    done
    
    print_success "Cleanup completed"
}

# Create Cloudflare resources
create_resources() {
    print_status "Creating Cloudflare resources..."
    
    # Create D1 database
    print_status "Creating D1 database..."
    DB_RESULT=$(wrangler d1 create crebost-production --compatibility-date=2024-01-15)
    DB_ID=$(echo "$DB_RESULT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    print_success "Created D1 database with ID: $DB_ID"
    
    # Create KV namespaces
    print_status "Creating KV namespaces..."
    SESSIONS_KV=$(wrangler kv:namespace create "crebost-sessions" --preview)
    CACHE_KV=$(wrangler kv:namespace create "crebost-cache" --preview)
    ANALYTICS_KV=$(wrangler kv:namespace create "crebost-analytics" --preview)
    
    SESSIONS_ID=$(echo "$SESSIONS_KV" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    CACHE_ID=$(echo "$CACHE_KV" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    ANALYTICS_ID=$(echo "$ANALYTICS_KV" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
    
    print_success "Created KV namespaces"
    
    # Create R2 buckets
    print_status "Creating R2 buckets..."
    wrangler r2 bucket create crebost-uploads
    wrangler r2 bucket create crebost-static-assets
    print_success "Created R2 buckets"
    
    # Update wrangler.toml files with actual IDs
    print_status "Updating wrangler.toml files with resource IDs..."
    
    # Update all wrangler.toml files
    for app in auth dashboard admin; do
        if [ -f "apps/$app/wrangler.toml" ]; then
            sed -i.bak "s/YOUR_D1_DATABASE_ID/$DB_ID/g" "apps/$app/wrangler.toml"
            sed -i.bak "s/YOUR_SESSIONS_KV_NAMESPACE_ID/$SESSIONS_ID/g" "apps/$app/wrangler.toml"
            sed -i.bak "s/YOUR_CACHE_KV_NAMESPACE_ID/$CACHE_ID/g" "apps/$app/wrangler.toml"
            sed -i.bak "s/YOUR_ANALYTICS_KV_NAMESPACE_ID/$ANALYTICS_ID/g" "apps/$app/wrangler.toml"
            rm "apps/$app/wrangler.toml.bak"
        fi
    done
    
    print_success "Updated wrangler.toml files"
}

# Build and deploy applications
deploy_applications() {
    print_status "Building and deploying applications..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build shared packages
    print_status "Building shared packages..."
    npm run build --workspace=@crebost/shared
    npm run build --workspace=@crebost/database
    npm run build --workspace=@crebost/ui
    
    # Deploy Landing Page
    print_status "Deploying Landing Page..."
    cd apps/landing
    npm run build
    wrangler pages deploy dist --project-name=crebost-landing --compatibility-date=2024-01-15
    cd ../..
    print_success "Landing page deployed"
    
    # Deploy Auth Service
    print_status "Deploying Auth Service..."
    cd apps/auth
    npm run build
    wrangler pages deploy .next --project-name=crebost-auth --compatibility-date=2024-01-15
    cd ../..
    print_success "Auth service deployed"
    
    # Deploy Dashboard
    print_status "Deploying Dashboard..."
    cd apps/dashboard
    npm run build
    wrangler pages deploy .next --project-name=crebost-dashboard --compatibility-date=2024-01-15
    cd ../..
    print_success "Dashboard deployed"
    
    # Deploy Admin Panel
    print_status "Deploying Admin Panel..."
    cd apps/admin
    npm run build
    wrangler pages deploy .next --project-name=crebost-admin --compatibility-date=2024-01-15
    cd ../..
    print_success "Admin panel deployed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    print_status "Pushing database schema..."
    npx prisma db push --force-reset
    
    print_success "Database setup completed"
}

# Configure custom domains (requires manual DNS setup)
configure_domains() {
    print_status "Configuring custom domains..."
    
    print_warning "Please manually configure the following DNS records:"
    echo ""
    echo "Type: CNAME, Name: landing, Target: crebost-landing.pages.dev"
    echo "Type: CNAME, Name: auth, Target: crebost-auth.pages.dev"
    echo "Type: CNAME, Name: dashboard, Target: crebost-dashboard.pages.dev"
    echo "Type: CNAME, Name: admin, Target: crebost-admin.pages.dev"
    echo ""
    
    read -p "Press Enter after configuring DNS records to continue..."
    
    # Add custom domains
    wrangler pages domain add crebost-landing landing.crebost.com || true
    wrangler pages domain add crebost-auth auth.crebost.com || true
    wrangler pages domain add crebost-dashboard dashboard.crebost.com || true
    wrangler pages domain add crebost-admin admin.crebost.com || true
    
    print_success "Custom domains configured"
}

# Main deployment function
main() {
    print_status "Starting Crebost deployment to Cloudflare..."
    
    check_dependencies
    cloudflare_login
    
    # Ask for confirmation before cleanup
    echo ""
    print_warning "This will delete ALL existing Cloudflare resources (Pages, D1, KV, R2)"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup_resources
        create_resources
        deploy_applications
        setup_database
        configure_domains
        
        print_success "🎉 Deployment completed successfully!"
        echo ""
        print_status "Your applications are now available at:"
        echo "• Landing: https://landing.crebost.com"
        echo "• Auth: https://auth.crebost.com"
        echo "• Dashboard: https://dashboard.crebost.com"
        echo "• Admin: https://admin.crebost.com"
        echo ""
        print_warning "Don't forget to set up environment variables for production!"
    else
        print_status "Deployment cancelled"
        exit 0
    fi
}

# Run main function
main "$@"
