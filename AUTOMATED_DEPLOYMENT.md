# Automated Deployment with GitHub Actions

Complete guide for setting up automated deployment using GitHub CLI.

---

## 🚀 Super Quick Setup (5 minutes)

### 1. Install GitHub CLI

```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo apt update && sudo apt install gh

# Windows
winget install --id GitHub.cli
```

### 2. Authenticate

```bash
gh auth login
```

### 3. Setup Secrets (Automated!)

```bash
cd /path/to/ns-burn-on-solana
yarn setup-secrets
```

Follow the prompts:
- **SERVER_HOST**: Your server IP (e.g., `123.45.67.89`)
- **SERVER_USER**: SSH username (default: `mucks`)
- **SERVER_SSH_KEY**: Press Enter to use `~/.ssh/id_rsa`
- **NEXT_PUBLIC_SOLANA_NETWORK**: Press Enter for devnet
- **NS_BURN_DOMAIN**: Press Enter for `ns-burn.mucks.me`

### 4. Deploy!

```bash
git add .
git commit -m "Setup automated deployment"
git push origin main
```

**That's it!** 🎉

Watch your deployment at: **GitHub → Actions tab**

Your app will be live at: **https://ns-burn.mucks.me**

---

## 📋 What Gets Automated

✅ **On every push to main:**
1. Builds Docker image from your Next.js app
2. Pushes to GitHub Container Registry
3. SSHs to your server
4. Pulls latest image
5. Restarts container with zero-downtime
6. Cleans up old images
7. Verifies health check

✅ **Automatic SSL:**
- Let's Encrypt certificates via Traefik
- Auto-renewal
- HTTP → HTTPS redirect

✅ **Security:**
- Encrypted secrets
- Non-root container
- Security headers
- No exposed ports (Traefik proxy)

---

## 🔧 Alternative Setup Methods

### Option 2: From Environment Variables

```bash
export SERVER_HOST="123.45.67.89"
export SERVER_USER="mucks"
export SERVER_SSH_KEY=$(cat ~/.ssh/id_rsa)
export NEXT_PUBLIC_SOLANA_NETWORK="https://api.devnet.solana.com"
export NS_BURN_DOMAIN="ns-burn.mucks.me"

yarn setup-secrets:env
```

### Option 3: From .env File

```bash
# Create secrets file
cp scripts/.secrets.env.example .secrets.env

# Edit with your values
nano .secrets.env

# Run setup
yarn setup-secrets:env .secrets.env
```

### Option 4: Manual (via GitHub Web UI)

See [`GITHUB_ACTIONS.md`](GITHUB_ACTIONS.md) for manual setup instructions.

---

## ✅ Verify Setup

### Check Secrets Were Added

```bash
gh secret list
```

You should see:
```
SERVER_HOST                   Updated 2024-10-29
SERVER_USER                   Updated 2024-10-29
SERVER_SSH_KEY                Updated 2024-10-29
NEXT_PUBLIC_SOLANA_NETWORK    Updated 2024-10-29
NS_BURN_DOMAIN                Updated 2024-10-29
```

### Test SSH Connection

```bash
ssh -i ~/.ssh/id_rsa $SERVER_USER@$SERVER_HOST
```

Should connect without errors.

### Check DNS

```bash
dig ns-burn.mucks.me
```

Should point to your server IP.

---

## 🎯 Deploy Workflow

### First Deployment

```bash
git push origin main
```

1. Go to GitHub → Actions
2. Watch "Deploy Workout POAP to Server" workflow
3. Wait ~5 minutes for build + deployment
4. Access https://ns-burn.mucks.me

### Subsequent Deployments

Just push to main:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Automatic deployment triggers in ~2 minutes! ⚡

---

## 📊 Monitoring

### View Deployment Status

**GitHub:**
```
Repository → Actions → Latest workflow run
```

**Server (SSH):**
```bash
ssh mucks@your-server
cd /home/mucks/ns-burn-on-solana
docker compose logs -f
```

### Check Application Health

```bash
curl https://ns-burn.mucks.me
docker ps | grep ns-burn
```

---

## 🐛 Troubleshooting

### Secrets Not Working

```bash
# List secrets
gh secret list

# Re-add a specific secret
echo "new-value" | gh secret set SECRET_NAME

# Or re-run setup
yarn setup-secrets
```

### Build Fails

```bash
# Check workflow logs in GitHub Actions
# Common issues:
# - Missing dependencies → Update package.json
# - Build errors → Test locally: cd app && yarn build
# - Docker issues → Verify Dockerfile syntax
```

### Deployment Fails

```bash
# SSH to server
ssh mucks@your-server

# Check container status
cd /home/mucks/ns-burn-on-solana
docker compose ps
docker compose logs -f

# Common fixes:
docker network create web  # If network missing
docker compose restart     # Restart container
```

### SSL Not Working

```bash
# Check Traefik
cd ~/traefik
docker compose logs -f

# Verify DNS
dig ns-burn.mucks.me

# Should match server IP
```

---

## 🔄 Update Secrets

To change a secret value:

```bash
# Option 1: Interactive
yarn setup-secrets

# Option 2: Direct
echo "new-value" | gh secret set SECRET_NAME

# Option 3: From env
export SECRET_NAME="new-value"
yarn setup-secrets:env
```

---

## 🗑️ Delete Secrets

```bash
gh secret delete SECRET_NAME
```

Or delete all:

```bash
for secret in SERVER_HOST SERVER_USER SERVER_SSH_KEY NEXT_PUBLIC_SOLANA_NETWORK NS_BURN_DOMAIN; do
  gh secret delete $secret
done
```

---

## 📚 Documentation

- [`scripts/QUICK_START.md`](scripts/QUICK_START.md) - Quick start guide
- [`GITHUB_ACTIONS.md`](GITHUB_ACTIONS.md) - Detailed manual setup
- [`SECRETS_TEMPLATE.md`](SECRETS_TEMPLATE.md) - Secrets reference
- [`DEPLOYMENT.md`](DEPLOYMENT.md) - Manual deployment
- [`scripts/README.md`](scripts/README.md) - Script documentation

---

## 🎉 Success Checklist

- [ ] GitHub CLI installed and authenticated
- [ ] Secrets added (verify with `gh secret list`)
- [ ] Server has Docker + Traefik running
- [ ] DNS points to server
- [ ] Pushed to main branch
- [ ] GitHub Actions workflow succeeded
- [ ] App accessible at https://ns-burn.mucks.me
- [ ] SSL certificate working (HTTPS)

---

## 💡 Pro Tips

**Faster iterations:**
```bash
# Test build locally before pushing
cd app
yarn build

# Test Docker build
docker build -t test-build .
```

**Monitor deployments:**
```bash
# Watch GitHub Actions
gh run watch

# Watch server logs
ssh mucks@server 'cd ns-burn-on-solana && docker compose logs -f'
```

**Roll back:**
```bash
# On server
docker pull ghcr.io/username/workout-poap/workout-poap-client:PREVIOUS_SHA
docker compose down && docker compose up -d
```

---

## 🆘 Need Help?

1. Check [`GITHUB_ACTIONS.md`](GITHUB_ACTIONS.md) troubleshooting section
2. Verify secrets: `gh secret list`
3. Check logs: `docker compose logs -f`
4. Test SSH: `ssh $SERVER_USER@$SERVER_HOST`
5. Verify DNS: `dig ns-burn.mucks.me`

---

**Your app is now automatically deployed on every push!** 🚀

Live at: **https://ns-burn.mucks.me**

