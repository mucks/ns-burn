# Workout POAP

A production-quality Solana Anchor program + Next.js client for minting unique, time-scoped NFTs as proof of workout attendance via QR-based claims.

![Workout POAP Banner](https://via.placeholder.com/1200x300/0ea5e9/ffffff?text=Workout+POAP)

## 🎯 Overview

Workout POAP (Proof of Attendance Protocol) is a decentralized fitness attendance tracking system built on Solana. Trainers can open workout instances and generate QR codes that attendees scan to mint unique NFTs proving their participation. Each NFT contains metadata about the workout date, time, and trainer, creating an immutable record of fitness achievement.

### Key Features

- **🔐 Secure QR-Based Claims**: Cryptographic secret verification prevents fraudulent claims
- **⏰ Time-Scoped Windows**: NFTs can only be claimed during specific time windows after workouts
- **👥 Role-Based Access**: Admins, trainers, and users with distinct capabilities
- **🏆 Monthly Leaderboard**: Track and compete with on-chain attendance counters
- **🎨 Customized NFTs**: Each NFT includes date, time, and trainer metadata
- **📱 Mobile-Friendly**: Responsive design with QR scanner for easy mobile use

## 🏗️ Architecture

### Smart Contract (Anchor Program)

**State Accounts (PDAs):**
- `Config` - Global configuration with super-admin authority
- `Admin` - Admin role accounts
- `Trainer` - Registered trainer accounts with display names
- `Schedule` - Workout schedule templates (optional)
- `WorkoutInstance` - Specific workout sessions with claim windows
- `Attendance` - User claim records (one per user per workout)
- `MonthlyCounter` - Per-user monthly attendance counts

**Key Instructions:**
- `initialize_config` - Set up the program
- `add_admin` / `remove_admin` - Manage admins (super-admin only)
- `register_trainer` - Add trainers (admin only)
- `open_workout_instance` - Create a claimable workout session
- `claim_nft` - Mint NFT after scanning QR code
- `close_workout_instance` - End claim window

### Client Application (Next.js)

**Pages:**
- `/` - Landing page with overview
- `/claim` - QR scanner for claiming NFTs
- `/trainer` - Trainer console for opening instances and generating QR codes
- `/admin` - Admin dashboard for managing trainers and admins
- `/leaderboard` - Monthly rankings by attendance count

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- @solana/web3.js
- @coral-xyz/anchor
- Wallet Adapter (Phantom, Solflare)
- @zxing/browser (QR scanning)
- qrcode (QR generation)

## 🚀 Quickstart

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.17+)
- [Anchor](https://www.anchor-lang.com/docs/installation) (v0.29.0)
- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) or npm

### 1. Install Dependencies

```bash
# Install Anchor dependencies
yarn install

# Install Next.js dependencies
cd app
yarn install
cd ..
```

### 2. Build & Deploy the Program

```bash
# Build the Anchor program
anchor build

# Get the program ID
solana address -k target/deploy/workout_poap-keypair.json

# Update lib.rs and Anchor.toml with your program ID
# Then rebuild
anchor build

# Start local validator (in a separate terminal)
solana-test-validator

# Deploy to local validator
anchor deploy

# Or deploy to devnet
anchor deploy --provider.cluster devnet
```

### 3. Run Tests

```bash
anchor test
```

Expected output: All tests passing, including:
- Config initialization
- Admin management
- Trainer registration
- Workout instance opening
- NFT claiming with secret verification
- Double-claim prevention
- Invalid secret rejection
- Instance closing

### 4. Initialize the Program

```bash
# In the project root, create a simple init script
# or use Anchor's test suite to initialize config

# Example: Initialize config with your wallet
anchor run initialize  # (if you add a script to package.json)
```

### 5. Run the Next.js Client

```bash
cd app

# Copy environment variables
cp .env.example .env.local

# Update NEXT_PUBLIC_PROGRAM_ID in .env.local with your deployed program ID

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Demo Flow

### Setup (One-Time)

1. **Super Admin** initializes the config:
   ```typescript
   await program.methods.initializeConfig(null).rpc();
   ```

2. **Super Admin** adds regular admins:
   ```typescript
   await program.methods.addAdmin().accounts({ newAdmin: adminPubkey }).rpc();
   ```

3. **Admin** registers trainers:
   ```typescript
   await program.methods
     .registerTrainer("Coach Alex")
     .accounts({ trainerPubkey })
     .rpc();
   ```

### Daily Workflow

1. **Trainer** opens a workout instance:
   - Go to `/trainer`
   - Set date and time
   - Click "Open Instance & Generate QR"
   - A secret is generated client-side and hashed

2. **Workout Happens** 🏋️

3. **Trainer** displays the QR code after the workout

4. **Attendees** claim NFTs:
   - Go to `/claim`
   - Click "Start Scanning"
   - Scan the trainer's QR code
   - NFT is minted automatically

5. **Trainer** closes the instance (optional):
   - Click "Close Instance"
   - Prevents further claims

### Leaderboard

- Visit `/leaderboard` to see monthly rankings
- Select different months to view historical data
- Top 3 users get special recognition

## 🔒 Security Features

### Time Windows
- Claims are only valid within `[window_start_ts, window_end_ts]`
- Checked on-chain using Clock sysvar

### Secret Hash Verification
- Trainer generates 32-byte random secret
- SHA-256 hash stored on-chain in `WorkoutInstance`
- QR code contains the reveal_secret
- On claim, program verifies `sha256(reveal_secret) == secret_hash`

### One Claim Per User
- Enforced by `Attendance` PDA with seeds `[instance, user]`
- Second claim attempt fails with `AlreadyClaimed` error

### Role-Based Access
- Admin operations require `Admin` PDA
- Trainer operations require `Trainer` PDA or `Admin` PDA
- Super-admin operations require matching `Config.authority`

### Deterministic PDAs
- All accounts use deterministic seeds
- Prevents spoofing and ensures uniqueness

## 📝 Code Structure

```
workout-poap/
├── programs/workout_poap/
│   ├── src/
│   │   ├── lib.rs                    # Program entry point
│   │   ├── state/                    # Account structs
│   │   │   ├── config.rs
│   │   │   ├── admin.rs
│   │   │   ├── trainer.rs
│   │   │   ├── schedule.rs
│   │   │   ├── workout_instance.rs
│   │   │   ├── attendance.rs
│   │   │   └── monthly_counter.rs
│   │   ├── instructions/             # Instruction handlers
│   │   │   ├── initialize_config.rs
│   │   │   ├── add_admin.rs
│   │   │   ├── remove_admin.rs
│   │   │   ├── register_trainer.rs
│   │   │   ├── set_schedule.rs
│   │   │   ├── open_workout_instance.rs
│   │   │   ├── close_workout_instance.rs
│   │   │   └── claim_nft.rs
│   │   ├── errors.rs                 # Custom errors
│   │   └── events.rs                 # Events
│   └── Cargo.toml
├── tests/
│   └── workout_poap.spec.ts          # Comprehensive tests
├── app/                               # Next.js client
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── claim/page.tsx            # Claim NFT
│   │   ├── trainer/page.tsx          # Trainer console
│   │   ├── admin/page.tsx            # Admin dashboard
│   │   ├── leaderboard/page.tsx      # Leaderboard
│   │   ├── layout.tsx                # Root layout
│   │   ├── providers.tsx             # Wallet & query providers
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── Navigation.tsx            # Top nav with wallet
│   │   ├── WalletGate.tsx            # Wallet connection guard
│   │   ├── QrScanner.tsx             # QR code scanner
│   │   ├── QrDisplay.tsx             # QR code display
│   │   └── LeaderboardTable.tsx      # Rankings table
│   ├── lib/
│   │   ├── anchorClient.ts           # Anchor program setup
│   │   ├── pdas.ts                   # PDA derivation helpers
│   │   ├── time.ts                   # Date/time utilities
│   │   ├── hash.ts                   # SHA-256 & secret generation
│   │   └── idl.json                  # Program IDL
│   ├── public/metadata/
│   │   └── example.json              # NFT metadata template
│   └── package.json
├── Anchor.toml                        # Anchor config
├── Cargo.toml                         # Workspace config
└── README.md                          # This file
```

## 🧪 Testing

The test suite (`tests/workout_poap.spec.ts`) covers:

1. ✅ Config initialization
2. ✅ Admin management (add/remove)
3. ✅ Trainer registration
4. ✅ Schedule creation
5. ✅ Workout instance opening
6. ✅ Successful NFT claim with valid secret
7. ✅ Double-claim prevention
8. ✅ Invalid secret rejection
9. ✅ Closed instance claim prevention
10. ✅ Monthly counter increments

Run tests:
```bash
anchor test
```

## 🎨 NFT Metadata

Each minted NFT includes:

```json
{
  "name": "Workout • 2025-10-28 07:00 • Coach Alex",
  "symbol": "WRKOUT",
  "uri": "https://workout-poap.example.com/metadata/...",
  "attributes": [
    { "trait_type": "Date", "value": "2025-10-28" },
    { "trait_type": "Time", "value": "07:00" },
    { "trait_type": "Trainer", "value": "Coach Alex" },
    { "trait_type": "Day of Week", "value": "Tuesday" }
  ]
}
```

## 🔧 Configuration

### Environment Variables (app/.env.local)

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID
```

### Program ID

Update in three places after deployment:
1. `programs/workout_poap/src/lib.rs` - `declare_id!`
2. `Anchor.toml` - `[programs.localnet]` and `[programs.devnet]`
3. `app/lib/anchorClient.ts` - `PROGRAM_ID`

## 🚧 Future Improvements

- **Compressed NFTs**: Use Metaplex Bubblegum for lower mint costs
- **Rate Limiting**: Prevent claim spam
- **Scheduled Instances**: Auto-open instances from schedules
- **Collection NFT**: Group all workout NFTs under one collection
- **Dynamic Metadata**: Generate unique artwork based on workout data
- **Indexer Integration**: Use Helius/Shyft for efficient leaderboard queries
- **Mobile App**: Native iOS/Android apps
- **Trainer Device Security**: Hardware-based secret storage
- **Secret Rotation**: New secrets per instance
- **Revoke Claims**: Admin ability to revoke fraudulent claims

## 🤝 Contributing

This is an example project for educational purposes. Feel free to:
- Fork and modify
- Submit issues and PRs
- Use as a template for your own projects

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Built with [Anchor](https://www.anchor-lang.com/)
- NFT minting via [Metaplex Token Metadata](https://docs.metaplex.com/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)
- QR scanning with [@zxing/browser](https://github.com/zxing-js/browser)

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Check the Anchor docs: https://www.anchor-lang.com/docs
- Join the Solana Discord: https://discord.gg/solana

---

**Built with ❤️ for the Solana fitness community**

