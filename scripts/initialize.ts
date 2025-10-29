/**
 * Initialize Workout POAP Program
 * 
 * This script initializes the global config for the Workout POAP program.
 * Run this once after deploying the program.
 * 
 * Usage:
 *   ts-node scripts/initialize.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WorkoutPoap } from "../target/types/workout_poap";
import { PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
    // Set up provider
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.WorkoutPoap as Program<WorkoutPoap>;

    console.log("🚀 Initializing Workout POAP program...");
    console.log("Program ID:", program.programId.toBase58());
    console.log("Authority:", provider.wallet.publicKey.toBase58());

    // Derive Config PDA
    const [configPda, configBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
    );

    console.log("Config PDA:", configPda.toBase58());

    // Check if already initialized
    try {
        const existingConfig = await program.account.config.fetch(configPda);
        console.log("⚠️  Config already initialized!");
        console.log("Current authority:", existingConfig.authority.toBase58());
        console.log("Collection mint:", existingConfig.collectionMint?.toBase58() || "None");
        return;
    } catch (e) {
        // Config doesn't exist, continue with initialization
    }

    // Initialize config
    try {
        const tx = await program.methods
            .initializeConfig(null) // No collection mint for now
            .accounts({
                authority: provider.wallet.publicKey,
                config: configPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("✅ Config initialized!");
        console.log("Transaction signature:", tx);

        // Verify
        const config = await program.account.config.fetch(configPda);
        console.log("\nConfig details:");
        console.log("  Authority:", config.authority.toBase58());
        console.log("  Collection Mint:", config.collectionMint?.toBase58() || "None");
        console.log("  Bump:", config.bump);

        console.log("\n✨ Your wallet is now the super-admin!");
        console.log("You can:");
        console.log("  - Add other admins");
        console.log("  - Register trainers");
        console.log("  - Manage the entire system");

    } catch (error) {
        console.error("❌ Error initializing config:", error);
        throw error;
    }
}

main()
    .then(() => {
        console.log("\n🎉 Initialization complete!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Initialization failed:", error);
        process.exit(1);
    });

