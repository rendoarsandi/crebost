#!/bin/bash

# Make deployment scripts executable
chmod +x scripts/deploy-cloudflare.sh
chmod +x scripts/setup-env-vars.sh

echo "✅ All deployment scripts are now executable"
echo ""
echo "Available scripts:"
echo "• ./scripts/deploy-cloudflare.sh - Full deployment automation"
echo "• ./scripts/setup-env-vars.sh - Environment variables setup"
echo ""
echo "Next steps:"
echo "1. Copy .env.production.template to .env.production"
echo "2. Fill in your actual environment values"
echo "3. Run: wrangler login"
echo "4. Run: ./scripts/deploy-cloudflare.sh"
