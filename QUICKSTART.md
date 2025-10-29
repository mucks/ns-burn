# 🚀 Workout POAP - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

Ensure you have installed:
- Rust (https://rustup.rs/)
- Solana CLI (https://docs.solana.com/cli/install-solana-cli-tools)
- Anchor (https://www.anchor-lang.com/docs/installation)
- Node.js 18+ (https://nodejs.org/)

## Step 1: Clone & Install

```bash
cd /Users/mucks/Projects/rust-smart-contracts/ns-burn-on-solana

# Install Anchor dependencies
yarn install

# Install Next.js dependencies
cd app
yarn install
cd ..
```

## Step 2: Build the Program

```bash
# Build
anchor build

# Get your program ID
solana address -k target/deploy/workout_poap-keypair.json
# Copy the output (e.g., WRKOUT1111111111111111111111111111111111111)
```

## Step 3: Update Program ID

Update the program ID in these 3 files:

1. **programs/workout_poap/src/lib.rs**:
   ```rust
   declare_id!("YOUR_PROGRAM_ID_HERE");
   ```

2. **Anchor.toml**:
   ```toml
   [programs.localnet]
   workout_poap = "YOUR_PROGRAM_ID_HERE"
   ```

3. **app/lib/anchorClient.ts**:
   ```typescript
   export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
   ```

## Step 4: Rebuild & Deploy

```bash
# Rebuild with correct program ID
anchor build

# Start local validator (in a separate terminal)
solana-test-validator

# Deploy
anchor deploy
```

## Step 5: Run Tests

```bash
anchor test
```

You should see all tests passing ✅

## Step 6: Initialize the Program

You can use the test suite to initialize, or create a simple script:

```bash
# Run a test that initializes config
anchor test --skip-build
```

Or create a script in `scripts/init.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WorkoutPoap } from "../target/types/workout_poap";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.WorkoutPoap as Program<WorkoutPoap>;
  
  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );
  
  try {
    await program.methods
      .initializeConfig(null)
      .accounts({
        authority: provider.wallet.publicKey,
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    
    console.log("✅ Config initialized!");
  } catch (e) {
    console.log("Config may already be initialized");
  }
}

main();
```

## Step 7: Start the Client

```bash
cd app

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_RPC_ENDPOINT=http://localhost:8899
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
EOF

# Start dev server
yarn dev
```

Open http://localhost:3000

## Step 8: Register Yourself as Admin & Trainer

1. Connect your wallet (make sure you're on localhost)
2. Your wallet is automatically the super-admin (initialized the config)
3. Go to `/admin`
4. Register yourself as a trainer:
   - Enter your wallet address
   - Enter a display name (e.g., "Coach Alex")
   - Click "Register Trainer"

## Step 9: Test the Flow

### As Trainer:

1. Go to `/trainer`
2. Set today's date and a time (e.g., 10:00)
3. Set claim window duration (e.g., 30 minutes)
4. Click "Open Instance & Generate QR"
5. A QR code will appear!

### As User (different browser/device):

1. Go to `/claim`
2. Click "Start Scanning"
3. Point camera at the QR code from step 9
4. Your NFT will be minted! 🎉

### Check Leaderboard:

1. Go to `/leaderboard`
2. You should see yourself with 1 workout!

## 🎯 Next Steps

- **Deploy to Devnet**: Change cluster in Anchor.toml and use `anchor deploy --provider.cluster devnet`
- **Customize NFTs**: Update metadata in `app/public/metadata/example.json`
- **Add More Trainers**: Use the admin dashboard to register others
- **Set Schedules**: Use the `setSchedule` instruction for recurring workouts

## 🐛 Troubleshooting

### "Account does not exist" errors
- Make sure you initialized the config
- Ensure you're connected to the right cluster (localhost/devnet)

### QR scanner not working
- Ensure you're on HTTPS or localhost (camera requires secure context)
- Grant camera permissions

### Transaction fails
- Check you have enough SOL in your wallet
- Verify the claim window is still open
- Ensure the secret hasn't changed

### NFT not showing in wallet
- It may take a few seconds to index
- Check Solana Explorer with the mint address

## 📚 Learn More

- Full README: See `README.md`
- Anchor Docs: https://www.anchor-lang.com/docs
- Solana Cookbook: https://solanacookbook.com/

## 💬 Get Help

- Check the tests in `tests/workout_poap.spec.ts` for examples
- Read inline comments in the code (heavily documented!)
- Open an issue on GitHub

---

Happy hacking! 🚀

