# Quick Deploy to ns-burn.mucks.me

## Server Setup (One-time)

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Setup Traefik

```bash
# Create traefik directory
mkdir -p ~/traefik && cd ~/traefik

# Create docker-compose.yml (see DEPLOYMENT.md for content)
nano docker-compose.yml

# Create network
docker network create web

# Start Traefik
docker-compose up -d
```

## Deploy Workout POAP

### On Your Server

```bash
# Clone repository
cd ~
git clone <YOUR_REPO_URL> ns-burn-on-solana
cd ns-burn-on-solana

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Run deployment
./deploy.sh
```

### Update After Changes

```bash
cd ~/ns-burn-on-solana
git pull origin main
./deploy.sh
```

## Verify Deployment

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoint
curl https://ns-burn.mucks.me
```

## Common Commands

```bash
# Restart service
docker-compose restart

# Stop service
docker-compose down

# Rebuild from scratch
docker-compose down && docker-compose up -d --build

# View resource usage
docker stats ns-burn-web
```

## DNS Setup

Make sure your DNS is configured:

```
A Record: ns-burn.mucks.me -> YOUR_SERVER_IP
```

Check with:
```bash
dig ns-burn.mucks.me
```

## Troubleshooting

**SSL not working?**
```bash
cd ~/traefik
docker-compose logs -f traefik
```

**Container keeps restarting?**
```bash
docker-compose logs -f workout-poap-client
```

**Network error?**
```bash
docker network ls
docker network create web  # if missing
```

## Configuration Files

- `.env` - Environment variables
- `docker-compose.yml` - Service configuration  
- `app/Dockerfile` - Build instructions
- `DEPLOYMENT.md` - Full documentation

---

That's it! Your Workout POAP should be running at **https://ns-burn.mucks.me** 🎉

