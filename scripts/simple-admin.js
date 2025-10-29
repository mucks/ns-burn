const anchor = require('@coral-xyz/anchor');
const { Connection, Keypair, PublicKey, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const PROGRAM_ID = new PublicKey('7CLhdcpry5nkB1YmnzDnCrSHNiEmVsvSxdhB3LCReJAf');

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Usage: node scripts/simple-admin.js <admin-pubkey>');
        process.exit(1);
    }

    const adminPubkey = new PublicKey(args[0]);
    console.log('\n🔑 Admin to add:', adminPubkey.toBase58());

    // Load wallet
    const walletPath = path.join(process.env.HOME, '.config/solana/id.json');
    const walletKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
    );
    const wallet = new anchor.Wallet(walletKeypair);

    console.log('💼 Wallet:', wallet.publicKey.toBase58());

    // Connection and provider
    const connection = new Connection('http://localhost:8899', 'confirmed');
    const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });

    // Load IDL
    const idl = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../target/idl/workout_poap.json'),
        'utf-8'
    ));

    // Create program
    const program = new anchor.Program(idl, provider);

    console.log('📝 Program ID:', program.programId.toBase58(), '\n');

    // Derive PDAs
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        program.programId
    );

    const [adminPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('admin'), adminPubkey.toBuffer()],
        program.programId
    );

    console.log('📍 Config PDA:', configPda.toBase58());
    console.log('📍 Admin PDA:', adminPda.toBase58(), '\n');

    // Try initialize_config
    try {
        await program.account.config.fetch(configPda);
        console.log('✅ Config already initialized\n');
    } catch (e) {
        console.log('📦 Initializing config...');
        const tx = await program.methods
            .initializeConfig(null) // collection_mint parameter
            .accounts({
                authority: wallet.publicKey,
                config: configPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log('✅ Config initialized! TX:', tx, '\n');
    }

    // Try add_admin
    try {
        await program.account.admin.fetch(adminPda);
        console.log('⚠️  Admin already exists\n');
    } catch {
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
            .rpc();

        console.log('✅ Admin added! TX:', tx, '\n');
    }

    console.log('🎊 Done!\n');
}

main().catch(e => {
    console.error('\n💥 Error:', e.message || e);
    if (e.logs) e.logs.forEach(l => console.log('  ', l));
    process.exit(1);
});

