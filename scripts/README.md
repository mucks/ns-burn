# Workout POAP Scripts

## simple-admin.js

Initialize the program config and add an admin.

### Usage

```bash
yarn add-admin <admin-wallet-address>
```

Or directly:

```bash
node scripts/simple-admin.js <admin-wallet-address>
```

### Example

```bash
yarn add-admin 61v15QuxKDBDy31AoEUf1VztnueXo54miipRoZmpeMXh
```

### What it does

1. Checks if the program config is initialized
2. If not, initializes it with your wallet as the super admin  
3. Adds the specified address as an admin
4. If the admin already exists, it will notify you

### Requirements

- Make sure you have a local Solana validator running (`solana-test-validator`)
- Your wallet must have SOL for transaction fees  
- The program must be deployed to your local validator

### Example Output

```
🔑 Admin to add: 61v15QuxKDBDy31AoEUf1VztnueXo54miipRoZmpeMXh
💼 Wallet: Dz4pP3fWV9kimafmaE5QHjdq6uGVtLoL6Rf8kHhoHboM
📝 Program ID: 7CLhdcpry5nkB1YmnzDnCrSHNiEmVsvSxdhB3LCReJAf 

📍 Config PDA: 3qBRkDTq2Cd5AbsMLvKawHfP3zaj7VWtL5jriKbjZrqp
📍 Admin PDA: 9yJdkbVdKC6nKKfESQbT5JbARit39fo9fuNXvQF3SjTJ 

📦 Initializing config...
✅ Config initialized! TX: 4CSWAfXUL5YPFT5gCzV8uJi34jMVST6FeET4hm3o2cq3AoWZsnnHpgAqGA4NxgqupWqtf2XUkRYQ3AbZ9vQbaQ54 

👤 Adding admin...
✅ Admin added! TX: 4pij8roXQynZrnjnXr4uFciYg783n4KUXnTmon31Mo3Kxzx5KZSyzcXaD6ohrAhA7RNa5cR5K7ztz83S9DdQqEHh 

🎊 Done!
```
