# GitHub Actions Deployment Guide

This guide explains how to set up automated deployment for Workout POAP using GitHub Actions.

## Overview

When you push to the `main` branch, GitHub Actions will:
1. Build a Docker image from your Next.js app
2. Push it to GitHub Container Registry (ghcr.io)
3. Deploy it to your server via SSH
4. Start the container with Traefik reverse proxy

## Prerequisites

- ✅ Server with Docker and Traefik installed
- ✅ GitHub repository for your code
- ✅ SSH access to your server
- ✅ Domain pointing to your server (ns-burn.mucks.me)

## Quick Setup (Automated) ⚡

**The fastest way:** Use our automated script!

```bash
# Install GitHub CLI (if not already installed)
brew install gh  # macOS
# or see: https://github.com/cli/cli#installation

# Authenticate
gh auth login

# Run automated setup
yarn setup-secrets
```

That's it! The script will guide you through adding all required secrets.

See [`scripts/QUICK_START.md`](scripts/QUICK_START.md) for detailed instructions.

---

## Manual Setup

If you prefer to add secrets manually:

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `SERVER_HOST` | Your server IP or domain | `123.45.67.89` or `server.mucks.me` |
| `SERVER_USER` | SSH username | `mucks` or `ubuntu` |
| `SERVER_SSH_KEY` | Your SSH private key | Contents of `~/.ssh/id_rsa` |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `NS_BURN_DOMAIN` | Your domain | `ns-burn.mucks.me` |

#### Getting Your SSH Private Key

```bash
# On your local machine
cat ~/.ssh/id_rsa

# Copy the ENTIRE output (including BEGIN and END lines)
# Paste it into the SERVER_SSH_KEY secret
```

### 2. Enable GitHub Container Registry

Make sure your repository can push to ghcr.io:

1. Go to Settings → Actions → General
2. Under "Workflow permissions", select:
   - ✅ Read and write permissions
3. Click Save

### 3. Make Repository Public (or Configure Access)

For **private repositories**:
- On your server, create a GitHub Personal Access Token (PAT)
- Grant it `read:packages` permission
- Use it to login: `echo $TOKEN | docker login ghcr.io -u USERNAME --password-stdin`

For **public repositories**:
- No additional configuration needed!

### 4. Server Setup

On your server, ensure:

```bash
# Docker is installed
docker --version

# Docker Compose is available
docker compose version

# Traefik is running
docker ps | grep traefik

# Web network exists
docker network ls | grep web

# Create network if needed
docker network create web
```

### 5. Deploy!

Push to main branch:

```bash
git add .
git commit -m "Setup deployment"
git push origin main
```

Watch the deployment:
- Go to Actions tab in your GitHub repository
- Click on the latest workflow run
- Monitor the build and deploy steps

## Workflow File

The workflow is defined in `.github/workflows/deploy.yml`:

```yaml
name: Deploy Workout POAP to Server

on:
  push:
    branches: [main, master]
  workflow_dispatch:  # Manual trigger

jobs:
  build-and-push:
    # Builds Docker image and pushes to ghcr.io
    
  deploy:
    # Deploys to server via SSH
```

## Manual Deployment

You can also trigger deployment manually:

1. Go to Actions tab
2. Click "Deploy Workout POAP to Server"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Deployment Script

The deployment is handled by an inline script in the workflow, but you can also use the standalone script:

### Copy Script to Server (Optional)

```bash
# Copy the deployment script
scp github-deploy-script.sh mucks@your-server:/home/mucks/

# SSH to server
ssh mucks@your-server

# Make executable
chmod +x /home/mucks/github-deploy-script.sh
```

### Test Deployment Manually

```bash
# SSH to your server
ssh mucks@your-server

# Set environment variables
export IMAGE_NAME="ghcr.io/YOUR_USERNAME/workout-poap/workout-poap-client:latest"
export GITHUB_TOKEN="your-github-token"
export GITHUB_ACTOR="your-github-username"
export NEXT_PUBLIC_SOLANA_NETWORK="https://api.devnet.solana.com"
export NS_BURN_DOMAIN="ns-burn.mucks.me"

# Run deployment
bash /home/mucks/github-deploy-script.sh
```

## Troubleshooting

### Build Fails

**Error**: `npm install` fails
```bash
# Check app/package.json for dependency issues
# Try building locally first:
cd app
yarn install
yarn build
```

**Error**: `Dockerfile not found`
```yaml
# Check the context path in deploy.yml:
context: ./app  # Should point to directory with Dockerfile
file: ./app/Dockerfile
```

### Push to Registry Fails

**Error**: `denied: permission_denied`

Solution: Check GitHub Actions permissions (Step 2 above)

**Error**: `unauthorized: authentication required`

Solution: Workflow should use `${{ secrets.GITHUB_TOKEN }}` automatically

### Deployment Fails

**Error**: `cd: No such file or directory`

Solution: The script now creates the directory first with `mkdir -p`

**Error**: `network web not found`

```bash
# On your server:
docker network create web
```

**Error**: `docker compose: command not found`

```bash
# Install Docker Compose plugin:
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

**Error**: `permission denied`

```bash
# Add user to docker group:
sudo usermod -aG docker $USER
newgrp docker
```

### SSL Issues

**Error**: Certificate not issued

```bash
# Check Traefik logs
cd ~/traefik
docker compose logs -f traefik

# Verify DNS is correct
dig ns-burn.mucks.me

# Check Traefik configuration
cat docker-compose.yml
```

### Container Keeps Restarting

```bash
# Check container logs
docker logs ns-burn-web

# Check health status
docker inspect ns-burn-web | grep -A 10 Health
```

## Monitoring

### Check Deployment Status

```bash
# SSH to server
ssh mucks@your-server

# Navigate to deployment directory
cd /home/mucks/ns-burn-on-solana

# Check container status
docker compose ps

# View logs
docker compose logs -f

# Check resource usage
docker stats ns-burn-web
```

### Access Application

- **Production**: https://ns-burn.mucks.me
- **Health Check**: `curl https://ns-burn.mucks.me`
- **Container Logs**: `docker logs ns-burn-web`

## Updating

To update your application:

1. Make changes to your code
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. GitHub Actions will automatically build and deploy!

## Rollback

If deployment fails, rollback to previous version:

```bash
# SSH to server
ssh mucks@your-server
cd /home/mucks/ns-burn-on-solana

# Pull previous image tag
docker pull ghcr.io/YOUR_USERNAME/workout-poap/workout-poap-client:PREVIOUS_SHA

# Update .env with old image
echo "IMAGE_NAME=ghcr.io/YOUR_USERNAME/workout-poap/workout-poap-client:PREVIOUS_SHA" > .env

# Restart
docker compose down
docker compose up -d
```

## Security Notes

- SSH keys are stored as GitHub Secrets (encrypted)
- Images are stored in GitHub Container Registry
- Only necessary ports are exposed via Traefik
- Containers run as non-root user
- Security headers are automatically added

## Success Indicators

When deployment succeeds, you'll see in GitHub Actions:

```
✅ Build and Push Docker Image
   - Checkout repository
   - Log in to GitHub Container Registry
   - Build and push Docker image
   
✅ Deploy to Server
   - Deploy to Server via SSH
     🚀 Starting Workout POAP deployment...
     📁 Creating deployment directory...
     🔐 Logging in to GitHub Container Registry...
     📝 Creating docker-compose.yml...
     📦 Pulling latest image...
     🚀 Starting new container...
     🎉 Deployment complete!
```

Your app is live at: **https://ns-burn.mucks.me** 🎉

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- See `DEPLOYMENT.md` for manual deployment guide
- See `QUICK_DEPLOY.md` for quick start guide

