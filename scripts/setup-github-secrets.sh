#!/bin/bash
#
# Automated GitHub Secrets Setup Script
# Uses GitHub CLI (gh) to add repository secrets
#
# Prerequisites: GitHub CLI installed and authenticated
#   Install: brew install gh
#   Auth: gh auth login
#

set -e

echo "🔐 GitHub Secrets Setup for Workout POAP"
echo "========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Install it with:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: https://github.com/cli/cli/releases"
    echo ""
    echo "After installation, authenticate with: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Function to add a secret
add_secret() {
    local secret_name=$1
    local secret_description=$2
    local secret_value=""
    local default_value=$3

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 $secret_name"
    echo "   $secret_description"
    
    if [ -n "$default_value" ]; then
        echo "   Default: $default_value"
    fi
    echo ""

    # Read value
    if [ "$secret_name" == "SERVER_SSH_KEY" ]; then
        # Special handling for SSH key
        local default_key_path="$HOME/.ssh/id_rsa"
        read -p "   SSH key path [$default_key_path]: " key_path
        key_path=${key_path:-$default_key_path}
        
        if [ ! -f "$key_path" ]; then
            echo "   ❌ Key file not found: $key_path"
            return 1
        fi
        
        secret_value=$(cat "$key_path")
        echo "   ✅ SSH key loaded from $key_path"
    else
        read -p "   Value: " secret_value
        
        # Use default if no value provided
        if [ -z "$secret_value" ] && [ -n "$default_value" ]; then
            secret_value="$default_value"
        fi
    fi

    # Validate value
    if [ -z "$secret_value" ]; then
        echo "   ⚠️  Skipping (empty value)"
        return 0
    fi

    # Add secret to GitHub
    echo "   🔄 Adding secret to GitHub..."
    echo "$secret_value" | gh secret set "$secret_name"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Secret added successfully!"
    else
        echo "   ❌ Failed to add secret"
        return 1
    fi
    
    echo ""
}

# Main setup
echo "This script will add the following secrets to your repository:"
echo "  1. SERVER_HOST - Server IP or domain"
echo "  2. SERVER_USER - SSH username"
echo "  3. SERVER_SSH_KEY - SSH private key"
echo "  4. NEXT_PUBLIC_SOLANA_NETWORK - Solana RPC endpoint"
echo "  5. NS_BURN_DOMAIN - Domain name"
echo ""
read -p "Continue? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "🚀 Starting setup..."
echo ""

# Add secrets
add_secret "SERVER_HOST" \
    "Server IP address or domain name" \
    ""

add_secret "SERVER_USER" \
    "SSH username for your server" \
    "mucks"

add_secret "NEXT_PUBLIC_SOLANA_NETWORK" \
    "Solana RPC endpoint URL" \
    "https://api.devnet.solana.com"

add_secret "NS_BURN_DOMAIN" \
    "Domain name for the application" \
    "ns-burn.mucks.me"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 To verify secrets were added:"
echo "   gh secret list"
echo ""
echo "🔍 To view a specific secret (shows only metadata):"
echo "   gh secret list | grep SECRET_NAME"
echo ""
echo "🚀 Ready to deploy! Push to main branch to trigger deployment."
echo ""

