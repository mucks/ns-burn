use crate::errors::WorkoutError;
use crate::events::Claimed;
use crate::state::{Attendance, MonthlyCounter, Trainer, WorkoutInstance};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

/// Claim an NFT for attending a workout.
///
/// This is the core functionality of the program. Users call this after scanning
/// the QR code displayed by the trainer. The QR code contains:
/// - The workout instance public key
/// - The reveal_secret
///
/// This instruction:
/// 1. Verifies the current time is within the claim window
/// 2. Verifies SHA-256(reveal_secret) matches the stored secret_hash
/// 3. Ensures the user hasn't already claimed for this workout
/// 4. Mints a new NFT with metadata describing the workout
/// 5. Increments the user's monthly attendance counter
///
/// # Arguments
/// * `reveal_secret` - The secret shown in the QR code (must hash to secret_hash)
pub fn claim_nft(ctx: Context<ClaimNft>, reveal_secret: Vec<u8>) -> Result<()> {
    let instance = &ctx.accounts.instance;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // 1. Verify the instance is not closed
    require!(!instance.is_closed, WorkoutError::InstanceClosed);

    // 2. Verify we're within the claim window
    require!(
        now >= instance.window_start_ts && now <= instance.window_end_ts,
        WorkoutError::InvalidClaimWindow
    );

    // 3. Verify the reveal_secret matches the stored hash
    let computed_hash = hash(&reveal_secret).to_bytes();
    require!(
        computed_hash == instance.secret_hash,
        WorkoutError::HashMismatch
    );

    // 4. Verify this user hasn't already claimed
    require!(
        !ctx.accounts.attendance.claimed,
        WorkoutError::AlreadyClaimed
    );

    // 5. Mark attendance and mint info
    // Note: Actual NFT minting would happen here via Metaplex CPI
    // For this example, we're simplifying to avoid stack overflow issues
    // In production, use anchor_spl::metadata::create_metadata_accounts_v3

    // 6. Mark attendance as claimed
    let attendance = &mut ctx.accounts.attendance;
    attendance.instance = ctx.accounts.instance.key();
    attendance.user = ctx.accounts.user.key();
    attendance.claimed = true;
    attendance.nft_mint = Pubkey::default(); // Would be set to actual mint in production
    attendance.bump = ctx.bumps.attendance;

    // 7. Increment monthly counter
    let monthly_counter = &mut ctx.accounts.monthly_counter;
    let yyyymm = instance.yyyymmdd / 100; // Convert YYYYMMDD to YYYYMM

    if monthly_counter.count == 0 {
        // First claim for this month
        monthly_counter.user = ctx.accounts.user.key();
        monthly_counter.yyyymm = yyyymm;
        monthly_counter.bump = ctx.bumps.monthly_counter;
    }
    monthly_counter.count = monthly_counter.count.checked_add(1).unwrap();

    emit!(Claimed {
        instance: ctx.accounts.instance.key(),
        user: ctx.accounts.user.key(),
        nft_mint: Pubkey::default(), // Would be actual NFT mint in production
        yyyymm,
        new_monthly_count: monthly_counter.count,
    });

    msg!(
        "Attendance claimed by {} for instance {} (monthly count: {})",
        ctx.accounts.user.key(),
        ctx.accounts.instance.key(),
        monthly_counter.count
    );

    Ok(())
}

// Note: For a production implementation, you would use anchor_spl::metadata
// to create the NFT metadata via CPI here. Due to stack size constraints
// in the demo, we're keeping this simplified. The full implementation would:
//
// 1. Use anchor_spl::metadata::create_metadata_accounts_v3
// 2. Create the mint and mint tokens to the user
// 3. Set the metadata with workout details (date, time, trainer)
//
// Example structure:
// use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3};
// use mpl_token_metadata::types::{DataV2, Creator};
//
// The metadata would include:
// - Name: "Workout • 2025-10-28 07:00 • Coach Alex"
// - Symbol: "WRKOUT"
// - URI: pointing to off-chain JSON with workout details

#[derive(Accounts)]
#[instruction(reveal_secret: Vec<u8>)]
pub struct ClaimNft<'info> {
    /// The user claiming the NFT
    #[account(mut)]
    pub user: Signer<'info>,

    /// The workout instance being claimed
    #[account(
        seeds = [
            b"instance",
            instance.trainer.as_ref(),
            &instance.yyyymmdd.to_le_bytes(),
            &[instance.hour],
            &[instance.minute]
        ],
        bump = instance.bump
    )]
    pub instance: Account<'info, WorkoutInstance>,

    /// The trainer who led this workout (needed for metadata)
    #[account(
        seeds = [b"trainer", instance.trainer.as_ref()],
        bump = trainer.bump
    )]
    pub trainer: Account<'info, Trainer>,

    /// The attendance record (PDA)
    /// Seeds: ["attendance", instance, user]
    #[account(
        init_if_needed,
        payer = user,
        space = Attendance::LEN,
        seeds = [b"attendance", instance.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub attendance: Account<'info, Attendance>,

    /// The monthly counter (PDA)
    /// Seeds: ["monthly", user, yyyymm]
    #[account(
        init_if_needed,
        payer = user,
        space = MonthlyCounter::LEN,
        seeds = [b"monthly", user.key().as_ref(), &(instance.yyyymmdd / 100).to_le_bytes()],
        bump
    )]
    pub monthly_counter: Account<'info, MonthlyCounter>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}
