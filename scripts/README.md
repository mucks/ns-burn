# Workout POAP Scripts

Utility scripts for managing the Workout POAP deployment.

## GitHub Secrets Setup

### Option 1: Interactive Setup (Recommended)

```bash
./scripts/setup-github-secrets.sh
```

This script will:
- ✅ Check if GitHub CLI is installed and authenticated
- ✅ Prompt for each secret value
- ✅ Load SSH key from file automatically
- ✅ Add all secrets to your repository

### Option 2: From Environment Variables

```bash
# Set environment variables
export SERVER_HOST="123.45.67.89"
export SERVER_USER="mucks"
export SERVER_SSH_KEY=$(cat ~/.ssh/id_rsa)
export NEXT_PUBLIC_SOLANA_NETWORK="https://api.devnet.solana.com"
export NS_BURN_DOMAIN="ns-burn.mucks.me"

# Run script
./scripts/setup-github-secrets-from-env.sh
```

### Option 3: From .env File

```bash
# Create secrets file
cp scripts/.secrets.env.example .secrets.env

# Edit with your values
nano .secrets.env

# Run script
./scripts/setup-github-secrets-from-env.sh .secrets.env
```

**⚠️ Important:** Add `.secrets.env` to `.gitignore` to avoid committing secrets!

## Prerequisites

### Install GitHub CLI

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
# See: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Windows:**
```powershell
winget install --id GitHub.cli
```

### Authenticate GitHub CLI

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

## Admin Management

### Add Admin

```bash
# Add a wallet address as admin
yarn add-admin WALLET_ADDRESS
```

Example:
```bash
yarn add-admin 61v15QuxKDBDy31AoEUf1VztnueXo54miipRoZmpeMXh
```

**Note:** You need to have a local Solana validator running and the program deployed.

## Verify Secrets

After adding secrets, verify they were added:

```bash
# List all secrets
gh secret list

# Output example:
# SERVER_HOST              Updated 2024-01-15
# SERVER_USER              Updated 2024-01-15
# SERVER_SSH_KEY           Updated 2024-01-15
# NEXT_PUBLIC_SOLANA_NETWORK  Updated 2024-01-15
# NS_BURN_DOMAIN           Updated 2024-01-15
```

## Update Secrets

To update an existing secret:

```bash
# Using gh CLI directly
echo "new-value" | gh secret set SECRET_NAME

# Or re-run the setup script
./scripts/setup-github-secrets.sh
```

## Delete Secrets

```bash
gh secret delete SECRET_NAME
```

## Troubleshooting

### "gh: command not found"

Install GitHub CLI (see Prerequisites above).

### "failed to get authenticated user"

Authenticate with GitHub:
```bash
gh auth login
```

### "HTTP 404: Not Found"

Make sure you're in the correct repository directory:
```bash
cd /path/to/ns-burn-on-solana
gh repo view  # Should show your repository
```

### SSH Key Issues

Verify your SSH key exists:
```bash
ls -la ~/.ssh/id_rsa
cat ~/.ssh/id_rsa  # Should show BEGIN OPENSSH PRIVATE KEY
```

If you don't have an SSH key:
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

## Security Notes

- ✅ Secrets are encrypted by GitHub
- ✅ Secrets are only accessible to GitHub Actions
- ✅ Scripts don't log secret values
- ⚠️ Never commit `.secrets.env` to git
- ⚠️ Keep your SSH private key secure

## Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Key Generation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
