# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Workout POAP project.

## Workflows

### `deploy.yml`
Automated deployment workflow that runs on every push to `main` branch.

**Triggers:**
- Push to `main` or `master` branch
- Manual workflow dispatch

**Steps:**
1. **Build and Push** - Builds Docker image and pushes to GitHub Container Registry
2. **Deploy** - Deploys to production server via SSH

**Environment Variables:**
- `REGISTRY`: ghcr.io
- `IMAGE_NAME`: Built from repository name

**Required Secrets:**
- `SERVER_HOST` - Server IP or domain
- `SERVER_USER` - SSH username
- `SERVER_SSH_KEY` - SSH private key
- `NEXT_PUBLIC_SOLANA_NETWORK` - Solana RPC endpoint
- `NS_BURN_DOMAIN` - Domain name (ns-burn.mucks.me)

## Setup

See `../GITHUB_ACTIONS.md` for complete setup instructions.

## Quick Start

1. Add required secrets in GitHub repository settings
2. Push to main branch
3. Watch deployment in Actions tab

```bash
git add .
git commit -m "Deploy"
git push origin main
```

## Manual Trigger

Go to Actions → Deploy Workout POAP to Server → Run workflow

## Monitoring

Check deployment status:
```bash
ssh mucks@your-server
cd /home/mucks/ns-burn-on-solana
docker compose ps
docker compose logs -f
```

## Troubleshooting

See `../GITHUB_ACTIONS.md` for detailed troubleshooting guide.

Common issues:
- Missing secrets → Add in repository settings
- Network not found → `docker network create web` on server
- Permission denied → Add user to docker group on server

