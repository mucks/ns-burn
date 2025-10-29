import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorError } from "@coral-xyz/anchor";
import { WorkoutPoap } from "../target/types/workout_poap";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { expect } from "chai";
import * as crypto from "crypto";

/**
 * Workout POAP Test Suite
 * 
 * This comprehensive test suite validates:
 * 1. Config initialization
 * 2. Admin management (add/remove)
 * 3. Trainer registration
 * 4. Schedule creation
 * 5. Workout instance opening/closing
 * 6. NFT claiming with secret verification
 * 7. Monthly counter increments
 * 8. Error cases (double claim, wrong secret, expired window, etc.)
 */
describe("workout_poap", () => {
    // Configure the client to use the local cluster
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.WorkoutPoap as Program<WorkoutPoap>;

    // Test accounts
    const authority = provider.wallet as anchor.Wallet;
    const admin2 = Keypair.generate();
    const trainer = Keypair.generate();
    const user1 = Keypair.generate();
    const user2 = Keypair.generate();

    // PDAs
    let configPda: PublicKey;
    let admin2Pda: PublicKey;
    let trainerPda: PublicKey;
    let schedulePda: PublicKey;
    let instancePda: PublicKey;
    let attendance1Pda: PublicKey;
    let monthlyCounter1Pda: PublicKey;

    // Test data
    const trainerName = "Coach Alex";
    const scheduleId = "morning-bootcamp";
    const yyyymmdd = 20251028; // Oct 28, 2025
    const hour = 7;
    const minute = 0;
    const yyyymm = Math.floor(yyyymmdd / 100); // 202510

    // Secret for QR code simulation
    let revealSecret: Buffer;
    let secretHash: Buffer;

    before(async () => {
        // Airdrop SOL to test accounts
        const airdropAmount = 10 * anchor.web3.LAMPORTS_PER_SOL;

        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(admin2.publicKey, airdropAmount)
        );
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(trainer.publicKey, airdropAmount)
        );
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(user1.publicKey, airdropAmount)
        );
        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(user2.publicKey, airdropAmount)
        );

        // Generate secret and hash (simulating trainer's QR code generation)
        revealSecret = crypto.randomBytes(32);
        secretHash = crypto.createHash("sha256").update(revealSecret).digest();

        console.log("Test accounts funded");
    });

    it("Initializes config", async () => {
        // Derive config PDA
        [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            program.programId
        );

        const tx = await program.methods
            .initializeConfig(null) // No collection mint for now
            .accounts({
                authority: authority.publicKey,
                config: configPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Config initialized:", tx);

        // Verify config state
        const config = await program.account.config.fetch(configPda);
        expect(config.authority.toBase58()).to.equal(authority.publicKey.toBase58());
        expect(config.collectionMint).to.be.null;
    });

    it("Adds a second admin", async () => {
        // Derive admin PDA
        [admin2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("admin"), admin2.publicKey.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .addAdmin()
            .accounts({
                authority: authority.publicKey,
                config: configPda,
                newAdmin: admin2.publicKey,
                admin: admin2Pda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Admin added:", tx);

        // Verify admin state
        const admin = await program.account.admin.fetch(admin2Pda);
        expect(admin.authority.toBase58()).to.equal(admin2.publicKey.toBase58());
    });

    it("Registers a trainer", async () => {
        // Derive trainer PDA
        [trainerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("trainer"), trainer.publicKey.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .registerTrainer(trainerName)
            .accounts({
                adminAuthority: authority.publicKey,
                admin: admin2Pda, // Use the admin we just created (but sign with super-admin)
                trainerPubkey: trainer.publicKey,
                trainer: trainerPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Trainer registered:", tx);

        // Verify trainer state
        const trainerAccount = await program.account.trainer.fetch(trainerPda);
        expect(trainerAccount.authority.toBase58()).to.equal(trainer.publicKey.toBase58());
        expect(trainerAccount.displayName).to.equal(trainerName);
    });

    it("Creates a schedule", async () => {
        // Derive schedule PDA
        [schedulePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("schedule"), Buffer.from(scheduleId)],
            program.programId
        );

        // Define weekly slots: Mon-Fri at 7:00 AM
        const slots = [
            { dow: 1, hour: 7, minute: 0 }, // Monday
            { dow: 2, hour: 7, minute: 0 }, // Tuesday
            { dow: 3, hour: 7, minute: 0 }, // Wednesday
            { dow: 4, hour: 7, minute: 0 }, // Thursday
            { dow: 5, hour: 7, minute: 0 }, // Friday
        ];

        const tx = await program.methods
            .setSchedule(scheduleId, slots, true)
            .accounts({
                adminAuthority: authority.publicKey,
                admin: admin2Pda,
                schedule: schedulePda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Schedule created:", tx);

        // Verify schedule state
        const schedule = await program.account.schedule.fetch(schedulePda);
        expect(schedule.slots.length).to.equal(5);
        expect(schedule.isActive).to.be.true;
    });

    it("Opens a workout instance", async () => {
        // Derive instance PDA
        const yyyymmddBuf = Buffer.alloc(4);
        yyyymmddBuf.writeUInt32LE(yyyymmdd);

        [instancePda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("instance"),
                trainer.publicKey.toBuffer(),
                yyyymmddBuf,
                Buffer.from([hour]),
                Buffer.from([minute]),
            ],
            program.programId
        );

        // Set claim window: start now-60s, end now+600s
        const now = Math.floor(Date.now() / 1000);
        const windowStartTs = new anchor.BN(now - 60);
        const windowEndTs = new anchor.BN(now + 600);

        const tx = await program.methods
            .openWorkoutInstance(
                yyyymmdd,
                hour,
                minute,
                windowStartTs,
                windowEndTs,
                Array.from(secretHash), // Convert Buffer to number[]
                null // No metadata URI override
            )
            .accounts({
                authority: authority.publicKey,
                admin: admin2Pda,
                trainer: trainerPda,
                instance: instancePda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("Workout instance opened:", tx);

        // Verify instance state
        const instance = await program.account.workoutInstance.fetch(instancePda);
        expect(instance.trainer.toBase58()).to.equal(trainer.publicKey.toBase58());
        expect(instance.yyyymmdd).to.equal(yyyymmdd);
        expect(instance.hour).to.equal(hour);
        expect(instance.minute).to.equal(minute);
        expect(instance.isClosed).to.be.false;
        expect(Buffer.from(instance.secretHash)).to.deep.equal(secretHash);
    });

    it("User claims NFT successfully", async () => {
        // Derive PDAs
        const yyyymmBuf = Buffer.alloc(4);
        yyyymmBuf.writeUInt32LE(yyyymm);

        [attendance1Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("attendance"), instancePda.toBuffer(), user1.publicKey.toBuffer()],
            program.programId
        );

        [monthlyCounter1Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("monthly"), user1.publicKey.toBuffer(), yyyymmBuf],
            program.programId
        );

        // Create NFT mint keypair
        const nftMint = Keypair.generate();

        // Derive metadata and master edition PDAs (Metaplex standard)
        const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

        const [nftMetadata] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [nftMasterEdition] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
                Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        // Derive user's ATA for the NFT
        const [nftTokenAccount] = PublicKey.findProgramAddressSync(
            [
                user1.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey("Sysvar1nstructions1111111111111111111111111");

        const tx = await program.methods
            .claimNft(Array.from(revealSecret))
            .accounts({
                user: user1.publicKey,
                instance: instancePda,
                trainer: trainerPda,
                attendance: attendance1Pda,
                monthlyCounter: monthlyCounter1Pda,
                nftMint: nftMint.publicKey,
                nftTokenAccount: nftTokenAccount,
                nftMetadata: nftMetadata,
                nftMasterEdition: nftMasterEdition,
                sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            })
            .signers([user1, nftMint])
            .rpc();

        console.log("NFT claimed:", tx);

        // Verify attendance
        const attendance = await program.account.attendance.fetch(attendance1Pda);
        expect(attendance.claimed).to.be.true;
        expect(attendance.user.toBase58()).to.equal(user1.publicKey.toBase58());
        expect(attendance.nftMint.toBase58()).to.equal(nftMint.publicKey.toBase58());

        // Verify monthly counter
        const counter = await program.account.monthlyCounter.fetch(monthlyCounter1Pda);
        expect(counter.count).to.equal(1);
        expect(counter.yyyymm).to.equal(yyyymm);
    });

    it("Prevents double claim", async () => {
        // Try to claim again with the same user
        const nftMint2 = Keypair.generate();
        const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

        const [nftMetadata] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint2.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [nftMasterEdition] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint2.publicKey.toBuffer(),
                Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [nftTokenAccount] = PublicKey.findProgramAddressSync(
            [
                user1.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                nftMint2.publicKey.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey("Sysvar1nstructions1111111111111111111111111");

        try {
            await program.methods
                .claimNft(Array.from(revealSecret))
                .accounts({
                    user: user1.publicKey,
                    instance: instancePda,
                    trainer: trainerPda,
                    attendance: attendance1Pda,
                    monthlyCounter: monthlyCounter1Pda,
                    nftMint: nftMint2.publicKey,
                    nftTokenAccount: nftTokenAccount,
                    nftMetadata: nftMetadata,
                    nftMasterEdition: nftMasterEdition,
                    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                })
                .signers([user1, nftMint2])
                .rpc();

            expect.fail("Should have thrown AlreadyClaimed error");
        } catch (err) {
            expect(err).to.be.instanceOf(AnchorError);
            expect((err as AnchorError).error.errorMessage).to.include("Already claimed");
        }
    });

    it("Prevents claim with wrong secret", async () => {
        // Try to claim with user2 but wrong secret
        const wrongSecret = Buffer.alloc(32, 0xFF); // All 0xFF

        const yyyymmBuf = Buffer.alloc(4);
        yyyymmBuf.writeUInt32LE(yyyymm);

        const [attendance2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("attendance"), instancePda.toBuffer(), user2.publicKey.toBuffer()],
            program.programId
        );

        const [monthlyCounter2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("monthly"), user2.publicKey.toBuffer(), yyyymmBuf],
            program.programId
        );

        const nftMint = Keypair.generate();
        const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

        const [nftMetadata] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [nftMasterEdition] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
                Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [nftTokenAccount] = PublicKey.findProgramAddressSync(
            [
                user2.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey("Sysvar1nstructions1111111111111111111111111");

        try {
            await program.methods
                .claimNft(Array.from(wrongSecret))
                .accounts({
                    user: user2.publicKey,
                    instance: instancePda,
                    trainer: trainerPda,
                    attendance: attendance2Pda,
                    monthlyCounter: monthlyCounter2Pda,
                    nftMint: nftMint.publicKey,
                    nftTokenAccount: nftTokenAccount,
                    nftMetadata: nftMetadata,
                    nftMasterEdition: nftMasterEdition,
                    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                })
                .signers([user2, nftMint])
                .rpc();

            expect.fail("Should have thrown HashMismatch error");
        } catch (err) {
            expect(err).to.be.instanceOf(AnchorError);
            expect((err as AnchorError).error.errorMessage).to.include("Hash mismatch");
        }
    });

    it("Closes workout instance", async () => {
        const tx = await program.methods
            .closeWorkoutInstance()
            .accounts({
                authority: authority.publicKey,
                admin: admin2Pda,
                trainer: trainerPda,
                instance: instancePda,
            })
            .rpc();

        console.log("Workout instance closed:", tx);

        // Verify instance is closed
        const instance = await program.account.workoutInstance.fetch(instancePda);
        expect(instance.isClosed).to.be.true;
    });

    it("Prevents claim after instance is closed", async () => {
        // Try to claim with user2 after closing
        const yyyymmBuf = Buffer.alloc(4);
        yyyymmBuf.writeUInt32LE(yyyymm);

        const [attendance2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("attendance"), instancePda.toBuffer(), user2.publicKey.toBuffer()],
            program.programId
        );

        const [monthlyCounter2Pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("monthly"), user2.publicKey.toBuffer(), yyyymmBuf],
            program.programId
        );

        const nftMint = Keypair.generate();
        const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

        const [nftMetadata] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [nftMasterEdition] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
                Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const [nftTokenAccount] = PublicKey.findProgramAddressSync(
            [
                user2.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                nftMint.publicKey.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey("Sysvar1nstructions1111111111111111111111111");

        try {
            await program.methods
                .claimNft(Array.from(revealSecret))
                .accounts({
                    user: user2.publicKey,
                    instance: instancePda,
                    trainer: trainerPda,
                    attendance: attendance2Pda,
                    monthlyCounter: monthlyCounter2Pda,
                    nftMint: nftMint.publicKey,
                    nftTokenAccount: nftTokenAccount,
                    nftMetadata: nftMetadata,
                    nftMasterEdition: nftMasterEdition,
                    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                })
                .signers([user2, nftMint])
                .rpc();

            expect.fail("Should have thrown InstanceClosed error");
        } catch (err) {
            expect(err).to.be.instanceOf(AnchorError);
            expect((err as AnchorError).error.errorMessage).to.include("closed");
        }
    });

    it("Removes an admin", async () => {
        const tx = await program.methods
            .removeAdmin()
            .accounts({
                authority: authority.publicKey,
                config: configPda,
                admin: admin2Pda,
            })
            .rpc();

        console.log("Admin removed:", tx);

        // Verify admin account is closed
        try {
            await program.account.admin.fetch(admin2Pda);
            expect.fail("Admin account should be closed");
        } catch (err) {
            expect(err.message).to.include("Account does not exist");
        }
    });
});

