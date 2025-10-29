#!/bin/bash
#
# Setup GitHub Secrets from Environment Variables or .env file
#
# Usage:
#   1. Set environment variables:
#      export SERVER_HOST="123.45.67.89"
#      export SERVER_USER="mucks"
#      # ... etc
#      ./setup-github-secrets-from-env.sh
#
#   2. Or create a .secrets.env file:
#      ./setup-github-secrets-from-env.sh .secrets.env
#

set -e

echo "🔐 GitHub Secrets Setup (from environment)"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install with: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

# Load from file if provided
if [ -n "$1" ]; then
    if [ -f "$1" ]; then
        echo "📄 Loading secrets from: $1"
        source "$1"
    else
        echo "❌ File not found: $1"
        exit 1
    fi
fi

# Function to set secret
set_secret() {
    local name=$1
    local value=$2
    
    if [ -z "$value" ]; then
        echo "⚠️  $name: (skipped - empty)"
        return 0
    fi
    
    echo "✅ $name: Setting..."
    echo "$value" | gh secret set "$name"
}

echo ""
echo "🚀 Adding secrets to GitHub..."
echo ""

# Add all secrets
set_secret "SERVER_HOST" "$SERVER_HOST"
set_secret "SERVER_USER" "$SERVER_USER"
set_secret "SERVER_SSH_KEY" "$SERVER_SSH_KEY"
set_secret "NEXT_PUBLIC_SOLANA_NETWORK" "$NEXT_PUBLIC_SOLANA_NETWORK"
set_secret "NS_BURN_DOMAIN" "$NS_BURN_DOMAIN"

echo ""
echo "🎉 Done!"
echo ""
echo "Verify with: gh secret list"
echo ""

