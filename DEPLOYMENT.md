# Workout POAP Deployment Guide

This guide explains how to deploy the Workout POAP application to your server with Docker and Traefik.

## Prerequisites

- Docker and Docker Compose installed on your server
- Domain name pointed to your server IP (ns-burn.mucks.me)
- Traefik reverse proxy setup (see Traefik Setup below)

## Quick Deployment

### 1. Configure Environment

Copy the example environment file and update values:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `NS_BURN_DOMAIN`: Your domain (default: ns-burn.mucks.me)
- `NEXT_PUBLIC_SOLANA_NETWORK`: Solana RPC endpoint
- `ACME_EMAIL`: Your email for Let's Encrypt SSL certificates

### 2. Deploy with Docker Compose

```bash
# Build and start the service
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### 3. Update Deployment

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Traefik Setup

If you don't have Traefik running yet, follow these steps:

### 1. Create Traefik Directory

```bash
mkdir -p ~/traefik
cd ~/traefik
```

### 2. Create Traefik docker-compose.yml

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    ports:
      - "80:80"
      - "443:443"
    environment:
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN}
    command:
      - "--api.dashboard=true"
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=web"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL:-admin@mucks.me}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--log.level=INFO"
      - "--accesslog=true"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
      - ./logs:/var/log/traefik
    networks:
      - web

networks:
  web:
    name: web
    driver: bridge
```

### 3. Start Traefik

```bash
# Create the web network
docker network create web

# Start Traefik
docker-compose up -d
```

## DNS Configuration

Make sure your domain points to your server:

```bash
# A Record
ns-burn.mucks.me -> YOUR_SERVER_IP
```

## Monitoring

### Check Service Status

```bash
# Check if container is running
docker ps | grep ns-burn

# View logs
docker-compose logs -f workout-poap-client

# Check Traefik logs
cd ~/traefik && docker-compose logs -f
```

### Health Check

The service includes a health check endpoint. Check with:

```bash
curl https://ns-burn.mucks.me
```

## Troubleshooting

### SSL Certificate Issues

If Let's Encrypt fails:

```bash
# Check Traefik logs
cd ~/traefik && docker-compose logs -f traefik

# Verify domain DNS
dig ns-burn.mucks.me

# Restart Traefik
docker-compose restart traefik
```

### Container Won't Start

```bash
# Check logs
docker-compose logs workout-poap-client

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Network Issues

```bash
# Verify web network exists
docker network ls | grep web

# Recreate if needed
docker network create web
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Domain DNS pointing to server
- [ ] Traefik running with SSL
- [ ] Docker container running
- [ ] SSL certificate obtained
- [ ] Health check passing
- [ ] Application accessible via HTTPS

## Security Notes

- The application runs as a non-root user (nextjs:nodejs)
- Security headers are automatically added by Traefik
- SSL/TLS is enforced (HTTP redirects to HTTPS)
- No unnecessary ports are exposed

## Updating

To update to the latest version:

```bash
cd /path/to/ns-burn-on-solana

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Verify deployment
docker-compose ps
docker-compose logs -f
```

## Rollback

If something goes wrong:

```bash
# Stop current version
docker-compose down

# Checkout previous commit
git checkout <previous-commit-hash>

# Rebuild
docker-compose up -d --build
```

## Support

For issues:
1. Check container logs: `docker-compose logs -f`
2. Check Traefik logs: `cd ~/traefik && docker-compose logs -f`
3. Verify DNS and SSL configuration
4. Check firewall rules (ports 80, 443 must be open)
