#!/bin/bash
#
# Workout POAP Deployment Script
# Deploys to production server with Docker & Traefik
#

set -e

echo "🚀 Starting Workout POAP deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your configuration and run again."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo "📦 Building Docker image..."
docker-compose build --no-cache

echo "🛑 Stopping existing containers..."
docker-compose down

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for service to be healthy..."
sleep 10

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your application should be available at: https://${NS_BURN_DOMAIN}"
    echo ""
    echo "📊 Check status:"
    echo "   docker-compose ps"
    echo ""
    echo "📜 View logs:"
    echo "   docker-compose logs -f"
else
    echo "❌ Deployment failed. Check logs:"
    docker-compose logs
    exit 1
fi

