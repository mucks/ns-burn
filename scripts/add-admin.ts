/**
 * Script to initialize config and add an admin
 * 
 * Usage:
 *   ts-node scripts/add-admin.ts <admin-pubkey>
 * 
 * Example:
 *   ts-node scripts/add-admin.ts 5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG
 */

import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Program ID
const PROGRAM_ID = new PublicKey('7CLhdcpry5nkB1YmnzDnCrSHNiEmVsvSxdhB3LCReJAf');

async function main() {
    // Get admin pubkey from command line
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('❌ Error: Please provide an admin public key');
        console.log('\nUsage: ts-node scripts/add-admin.ts <admin-pubkey>');
        console.log('Example: ts-node scripts/add-admin.ts 5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG');
        process.exit(1);
    }

    const adminPubkey = new PublicKey(args[0]);
    console.log(`\n🔑 Admin to add: ${adminPubkey.toBase58()}\n`);

    // Load wallet from file system
    const walletPath = path.join(process.env.HOME!, '.config/solana/id.json');
    if (!fs.existsSync(walletPath)) {
        console.error(`❌ Wallet not found at: ${walletPath}`);
        console.log('Please make sure you have a Solana wallet configured.');
        process.exit(1);
    }

    const walletKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
    );
    const wallet = new Wallet(walletKeypair);

    console.log(`💼 Using wallet: ${wallet.publicKey.toBase58()}`);

    // Setup connection and provider
    const connection = new Connection('http://localhost:8899', 'confirmed');
    const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });

    // Load IDL
    const idlPath = path.join(__dirname, '../target/idl/workout_poap.json');
    if (!fs.existsSync(idlPath)) {
        console.error(`❌ IDL not found at: ${idlPath}`);
        console.log('Please run "anchor build" first.');
        process.exit(1);
    }

    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
    const program = new Program(idl as anchor.Idl, provider);

    console.log(`📝 Program ID: ${PROGRAM_ID.toBase58()}\n`);

    // Derive PDAs
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        PROGRAM_ID
    );

    const [adminPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('admin'), adminPubkey.toBuffer()],
        PROGRAM_ID
    );

    console.log(`📍 Config PDA: ${configPda.toBase58()}`);
    console.log(`📍 Admin PDA: ${adminPda.toBase58()}\n`);

    // Step 1: Check if config exists, if not initialize it
    try {
        const configAccount: any = await (program.account as any).config.fetch(configPda);
        console.log('✅ Config already initialized');
        console.log(`   Super admin: ${configAccount.superAdmin.toBase58()}\n`);
    } catch (error) {
        console.log('📦 Initializing config...');
        try {
            const tx = await program.methods
                .initializeConfig()
                .accounts({
                    authority: wallet.publicKey,
                    config: configPda,
                    systemProgram: SystemProgram.programId,
                })
                .signers([walletKeypair])
                .rpc();

            await provider.connection.confirmTransaction(tx, 'confirmed');
            console.log('✅ Config initialized!');
            console.log(`   Transaction: ${tx}\n`);
        } catch (initError: any) {
            console.error('❌ Failed to initialize config:', initError.message);
            process.exit(1);
        }
    }

    // Step 2: Add admin
    try {
        // Check if admin already exists
        try {
            await (program.account as any).admin.fetch(adminPda);
            console.log('⚠️  Admin already exists!');
            console.log(`   ${adminPubkey.toBase58()} is already an admin.\n`);
            return;
        } catch {
            // Admin doesn't exist, proceed to add
        }

        console.log('👤 Adding admin...');
        const tx = await program.methods
            .addAdmin()
            .accounts({
                authority: wallet.publicKey,
                config: configPda,
                newAdmin: adminPubkey,
                admin: adminPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([walletKeypair])
            .rpc();

        await provider.connection.confirmTransaction(tx, 'confirmed');
        console.log('✅ Admin added successfully!');
        console.log(`   Transaction: ${tx}`);
        console.log(`   ${adminPubkey.toBase58()} is now an admin! 🎉\n`);
    } catch (error: any) {
        console.error('❌ Failed to add admin:', error.message);
        if (error.logs) {
            console.log('\nProgram logs:');
            error.logs.forEach((log: string) => console.log('  ', log));
        }
        process.exit(1);
    }

    console.log('🎊 All done!\n');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });

