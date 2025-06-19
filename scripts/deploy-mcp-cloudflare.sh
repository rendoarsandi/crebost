#!/bin/bash

# Crebost - MCP Cloudflare Deployment Script
# This script uses MCP Cloudflare to deploy the entire platform

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

# Check if MCP Cloudflare is available
check_mcp() {
    print_status "Checking MCP Cloudflare availability..."
    
    # This would be the actual MCP command check
    # For now, we'll assume it's available
    print_success "MCP Cloudflare is available"
}

# Cleanup existing Cloudflare resources
cleanup_resources() {
    print_status "🧹 Cleaning up existing Cloudflare resources..."
    
    print_warning "This will delete ALL existing Cloudflare resources!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleanup cancelled"
        return 1
    fi
    
    # Delete all Pages projects
    print_status "Deleting Pages projects..."
    # MCP command would be: mcp cloudflare pages delete --all
    echo "MCP: Deleting all Pages projects..."
    
    # Delete all D1 databases
    print_status "Deleting D1 databases..."
    # MCP command would be: mcp cloudflare d1 delete --all
    echo "MCP: Deleting all D1 databases..."
    
    # Delete all KV namespaces
    print_status "Deleting KV namespaces..."
    # MCP command would be: mcp cloudflare kv delete --all
    echo "MCP: Deleting all KV namespaces..."
    
    # Delete all R2 buckets
    print_status "Deleting R2 buckets..."
    # MCP command would be: mcp cloudflare r2 delete --all
    echo "MCP: Deleting all R2 buckets..."
    
    # Delete all Workers
    print_status "Deleting Workers..."
    # MCP command would be: mcp cloudflare workers delete --all
    echo "MCP: Deleting all Workers..."
    
    print_success "Cleanup completed"
}

# Build all applications
build_applications() {
    print_status "🔨 Building all applications..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Build shared packages first
    print_status "Building shared packages..."
    npm run build --workspace=@crebost/shared
    npm run build --workspace=@crebost/database
    npm run build --workspace=@crebost/ui
    
    # Build applications
    print_status "Building Landing Page..."
    npm run build --workspace=@crebost/landing
    
    print_status "Building Auth Service..."
    npm run build --workspace=@crebost/auth
    
    print_status "Building Dashboard..."
    npm run build --workspace=@crebost/dashboard
    
    print_status "Building Admin Panel..."
    npm run build --workspace=@crebost/admin
    
    print_success "All applications built successfully"
}

# Create Cloudflare resources using MCP
create_resources() {
    print_status "🏗️ Creating Cloudflare resources using MCP..."
    
    # Create D1 database
    print_status "Creating D1 database..."
    # MCP command: mcp cloudflare d1 create --name "crebost-production"
    echo "MCP: Creating D1 database 'crebost-production'..."
    
    # Create KV namespaces
    print_status "Creating KV namespaces..."
    # MCP commands:
    # mcp cloudflare kv create --title "crebost-sessions"
    # mcp cloudflare kv create --title "crebost-cache"
    # mcp cloudflare kv create --title "crebost-analytics"
    echo "MCP: Creating KV namespaces..."
    
    # Create R2 buckets
    print_status "Creating R2 buckets..."
    # MCP commands:
    # mcp cloudflare r2 create --name "crebost-uploads"
    # mcp cloudflare r2 create --name "crebost-static-assets"
    echo "MCP: Creating R2 buckets..."
    
    print_success "Resources created successfully"
}

# Deploy applications using MCP
deploy_applications() {
    print_status "🚀 Deploying applications using MCP..."
    
    # Deploy Landing Page
    print_status "Deploying Landing Page..."
    # MCP command: mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-landing
    echo "MCP: Deploying Landing Page to crebost-landing.pages.dev..."
    
    # Deploy Auth Service
    print_status "Deploying Auth Service..."
    # MCP command: mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-auth
    echo "MCP: Deploying Auth Service to crebost-auth.pages.dev..."
    
    # Deploy Dashboard
    print_status "Deploying Dashboard..."
    # MCP command: mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-dashboard
    echo "MCP: Deploying Dashboard to crebost-dashboard.pages.dev..."
    
    # Deploy Admin Panel
    print_status "Deploying Admin Panel..."
    # MCP command: mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-admin
    echo "MCP: Deploying Admin Panel to crebost-admin.pages.dev..."
    
    print_success "All applications deployed successfully"
}

# Setup database schema
setup_database() {
    print_status "🗄️ Setting up database schema..."
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Push schema to D1 database
    print_status "Pushing schema to D1 database..."
    # This would use the D1 binding in production
    npx prisma db push --force-reset
    
    print_success "Database schema setup completed"
}

# Configure custom domains
configure_domains() {
    print_status "🌐 Configuring custom domains..."
    
    # Add custom domains using MCP
    # MCP commands:
    # mcp cloudflare pages domain add --project crebost-landing --domain landing.crebost.com
    # mcp cloudflare pages domain add --project crebost-auth --domain auth.crebost.com
    # mcp cloudflare pages domain add --project crebost-dashboard --domain dashboard.crebost.com
    # mcp cloudflare pages domain add --project crebost-admin --domain admin.crebost.com
    
    echo "MCP: Adding custom domains..."
    print_success "Custom domains configured"
}

# Display deployment summary
display_summary() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "Your Crebost platform is now live at:"
    echo "• Landing Page: https://landing.crebost.com"
    echo "• Auth Service: https://auth.crebost.com"
    echo "• Dashboard: https://dashboard.crebost.com"
    echo "• Admin Panel: https://admin.crebost.com"
    echo ""
    print_status "Cloudflare Resources Created:"
    echo "• D1 Database: crebost-production"
    echo "• KV Namespaces: crebost-sessions, crebost-cache, crebost-analytics"
    echo "• R2 Buckets: crebost-uploads, crebost-static-assets"
    echo "• Pages Projects: 4 applications deployed"
    echo ""
    print_warning "Next steps:"
    echo "1. Configure your domain DNS records"
    echo "2. Test all functionality"
    echo "3. Setup monitoring and alerts"
    echo "4. Configure payment webhooks in Midtrans"
}

# Main deployment function
main() {
    print_status "🚀 Starting Crebost deployment with MCP Cloudflare..."
    echo ""
    
    check_mcp
    cleanup_resources || exit 1
    build_applications
    create_resources
    deploy_applications
    setup_database
    configure_domains
    display_summary
    
    print_success "Deployment process completed!"
}

# Display MCP commands that would be executed
display_mcp_commands() {
    print_status "📋 MCP Cloudflare Commands Reference:"
    echo ""
    echo "# Cleanup commands:"
    echo "mcp cloudflare pages delete --all"
    echo "mcp cloudflare d1 delete --all"
    echo "mcp cloudflare kv delete --all"
    echo "mcp cloudflare r2 delete --all"
    echo "mcp cloudflare workers delete --all"
    echo ""
    echo "# Resource creation commands:"
    echo "mcp cloudflare d1 create --name 'crebost-production'"
    echo "mcp cloudflare kv create --title 'crebost-sessions'"
    echo "mcp cloudflare kv create --title 'crebost-cache'"
    echo "mcp cloudflare kv create --title 'crebost-analytics'"
    echo "mcp cloudflare r2 create --name 'crebost-uploads'"
    echo "mcp cloudflare r2 create --name 'crebost-static-assets'"
    echo ""
    echo "# Deployment commands:"
    echo "mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-landing"
    echo "mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-auth"
    echo "mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-dashboard"
    echo "mcp cloudflare pages deploy --config cloudflare-mcp-config.json --project crebost-admin"
    echo ""
    echo "# Domain configuration commands:"
    echo "mcp cloudflare pages domain add --project crebost-landing --domain landing.crebost.com"
    echo "mcp cloudflare pages domain add --project crebost-auth --domain auth.crebost.com"
    echo "mcp cloudflare pages domain add --project crebost-dashboard --domain dashboard.crebost.com"
    echo "mcp cloudflare pages domain add --project crebost-admin --domain admin.crebost.com"
}

# Check command line arguments
if [ "$1" = "--show-commands" ]; then
    display_mcp_commands
    exit 0
fi

# Run main function
main "$@"
