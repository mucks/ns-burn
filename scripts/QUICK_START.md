# Quick Start: GitHub Secrets Setup

The fastest way to set up GitHub secrets for automated deployment.

## Step 1: Install GitHub CLI

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo apt update && sudo apt install gh
```

**Verify:**
```bash
gh --version
```

## Step 2: Authenticate

```bash
gh auth login
```

Select:
- GitHub.com
- HTTPS
- Login with web browser
- Follow the browser prompts

## Step 3: Navigate to Your Repo

```bash
cd /path/to/ns-burn-on-solana
```

## Step 4: Run Setup Script

```bash
./scripts/setup-github-secrets.sh
```

**You'll be prompted for:**

1. **SERVER_HOST** - Your server IP
   ```
   Example: 123.45.67.89
   ```

2. **SERVER_USER** - SSH username
   ```
   Default: mucks
   ```

3. **SERVER_SSH_KEY** - Path to SSH key
   ```
   Default: ~/.ssh/id_rsa
   Press Enter to use default
   ```

4. **NEXT_PUBLIC_SOLANA_NETWORK** - Solana RPC
   ```
   Default: https://api.devnet.solana.com
   Press Enter to use default
   ```

5. **NS_BURN_DOMAIN** - Your domain
   ```
   Default: ns-burn.mucks.me
   Press Enter to use default
   ```

## Step 5: Verify

```bash
gh secret list
```

You should see all 5 secrets listed!

## Step 6: Deploy!

```bash
git add .
git commit -m "Setup deployment"
git push origin main
```

Watch it deploy at: **GitHub → Actions tab** 🚀

---

## Alternative: One-Line Setup

If you already have environment variables set:

```bash
export SERVER_HOST="123.45.67.89" \
  SERVER_USER="mucks" \
  SERVER_SSH_KEY=$(cat ~/.ssh/id_rsa) \
  NEXT_PUBLIC_SOLANA_NETWORK="https://api.devnet.solana.com" \
  NS_BURN_DOMAIN="ns-burn.mucks.me" && \
./scripts/setup-github-secrets-from-env.sh
```

---

## Troubleshooting

### gh: command not found
```bash
# Install GitHub CLI (see Step 1)
brew install gh  # macOS
```

### Not authenticated
```bash
gh auth login
```

### SSH key not found
```bash
# Generate a new SSH key
ssh-keygen -t rsa -b 4096
# Then re-run the script
```

### Wrong repository
```bash
# Verify you're in the right repo
gh repo view
```

---

## That's it! 🎉

Your secrets are now configured and ready for automated deployment.

Next: Push to main branch and watch GitHub Actions deploy your app!

