# Workout POAP - Time-Scoped NFT Attendance System

A production-ready Solana program for minting time-scoped, trainer-customized NFTs as proof of workout attendance via QR-based claims.

🌐 **Live Demo:** https://ns-burn.mucks.me

## Features

- ✅ **QR Code Claims** - Scan QR codes to claim workout attendance
- ✅ **Role-Based Access** - Admins, Trainers, and Users with distinct permissions
- ✅ **Time-Scoped** - Claims only valid during workout window
- ✅ **Monthly Leaderboard** - Track attendance stats
- ✅ **Secure** - SHA-256 secret verification
- ✅ **Production Ready** - Docker + Traefik + GitHub Actions CI/CD

## Quick Start

### Local Development

```bash
# Install dependencies
cd app && yarn install

# Start local validator
solana-test-validator

# Build and deploy program
anchor build
anchor deploy

# Start Next.js app
yarn dev
```

Visit http://localhost:3000

### Initialize Program

```bash
# Add an admin
yarn add-admin YOUR_WALLET_ADDRESS
```

## Project Structure

```
ns-burn-on-solana/
├── programs/workout_poap/    # Solana Anchor program
│   └── src/
│       ├── lib.rs            # Program entry point
│       ├── state/            # Account structures
│       └── instructions/     # Program instructions
├── app/                      # Next.js client
│   ├── app/                  # Pages (admin, trainer, claim)
│   ├── components/           # React components
│   ├── lib/                  # Anchor client & utilities
│   └── Dockerfile            # Production Docker build
├── scripts/                  # Utility scripts
│   └── simple-admin.js       # Add admin helper
├── .github/workflows/        # GitHub Actions CI/CD
│   └── deploy.yml            # Automated deployment
└── docker-compose.yml        # Production deployment
```

## Deployment

### Option 1: Automated with GitHub CLI (Recommended) ⚡

**Super quick setup:**

```bash
# Install GitHub CLI
brew install gh  # macOS

# Authenticate
gh auth login

# Setup secrets automatically
yarn setup-secrets

# Deploy!
git push origin main
```

See [AUTOMATED_DEPLOYMENT.md](AUTOMATED_DEPLOYMENT.md) for complete guide.

### Option 2: GitHub Actions (Manual Setup)

1. Set up GitHub Secrets manually (see [SECRETS_TEMPLATE.md](SECRETS_TEMPLATE.md))
2. Push to main branch
3. Automatic deployment! 🚀

See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) for details.

### Option 3: Manual Deployment

```bash
# Configure environment
cp .env.example .env
nano .env

# Deploy
./deploy.sh
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

### Option 4: Quick Deploy

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for the fastest way to get started.

## Documentation

### Deployment Guides
- ⚡ [**AUTOMATED_DEPLOYMENT.md**](AUTOMATED_DEPLOYMENT.md) - Automated setup with GitHub CLI (recommended)
- 📘 [**GITHUB_ACTIONS.md**](GITHUB_ACTIONS.md) - Manual CI/CD setup
- 📗 [**DEPLOYMENT.md**](DEPLOYMENT.md) - Manual deployment guide
- 📕 [**QUICK_DEPLOY.md**](QUICK_DEPLOY.md) - Quick start guide
- 📙 [**SECRETS_TEMPLATE.md**](SECRETS_TEMPLATE.md) - GitHub Secrets reference

### Scripts & Utilities
- 🔧 [**scripts/README.md**](scripts/README.md) - Script documentation
- 🚀 [**scripts/QUICK_START.md**](scripts/QUICK_START.md) - Secrets setup guide

## User Roles

### Super Admin
- Initializes the config
- Full control over the system

### Admin
- Register trainers
- Manage schedules
- Add other admins

### Trainer
- Open/close workout instances
- Display QR codes for claims

### User/Attendee
- Scan QR codes
- Claim workout attendance
- View leaderboard

## Application Flow

1. **Admin** registers a trainer
2. **Trainer** opens a workout instance with:
   - Date and time
   - Claim window
   - Secret hash
3. **Trainer** displays QR code containing instance ID and secret
4. **Users** scan QR code with their phone
5. **Users** connect wallet and claim attendance
6. **Program** verifies:
   - Time is within claim window
   - Secret matches SHA-256 hash
   - User hasn't already claimed
7. **Attendance** recorded on-chain
8. **Leaderboard** updated with monthly stats

## Tech Stack

### Smart Contract
- Solana blockchain
- Anchor framework (v0.30.1)
- Rust

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Solana Wallet Adapter

### Deployment
- Docker
- Traefik (reverse proxy)
- GitHub Actions
- Let's Encrypt SSL

## Development

### Build Program

```bash
anchor build
```

### Test Program

```bash
anchor test
```

### Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

### Run Frontend

```bash
cd app
yarn dev
```

## Environment Variables

```env
# Domain
NS_BURN_DOMAIN=ns-burn.mucks.me

# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=https://api.devnet.solana.com

# SSL Email
ACME_EMAIL=admin@mucks.me
```

## Security

- ✅ Role-based access control
- ✅ Time-windowed claims
- ✅ Secret hash verification (SHA-256)
- ✅ One claim per user per workout
- ✅ Deterministic PDAs prevent spoofing
- ✅ SSL/TLS encryption
- ✅ Security headers via Traefik
- ✅ Non-root Docker container

## Monitoring

```bash
# Check status
docker compose ps

# View logs
docker compose logs -f

# Resource usage
docker stats ns-burn-web
```

## Troubleshooting

### Build Issues
```bash
# Clean build
cargo clean
anchor clean
anchor build
```

### Deployment Issues
```bash
# Check logs
docker compose logs -f

# Restart service
docker compose restart

# Full rebuild
docker compose down
docker compose up -d --build
```

### Network Issues
```bash
# Create Docker network
docker network create web

# Check DNS
dig ns-burn.mucks.me
```

See documentation files for detailed troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Check the documentation files
- Review [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) for deployment issues
- Check container logs: `docker compose logs -f`
- Verify Traefik configuration

## Acknowledgments

Built with:
- [Solana](https://solana.com/)
- [Anchor](https://www.anchor-lang.com/)
- [Next.js](https://nextjs.org/)
- [Traefik](https://traefik.io/)

---

**Live at:** https://ns-burn.mucks.me 🎉
