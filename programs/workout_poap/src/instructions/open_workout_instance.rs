use crate::errors::WorkoutError;
use crate::events::WorkoutOpened;
use crate::state::{Admin, Trainer, WorkoutInstance};
use anchor_lang::prelude::*;

/// Open a new workout instance for a specific date and time.
///
/// This creates a WorkoutInstance account that attendees can claim NFTs from.
/// The instance includes:
/// - A time window during which claims are valid
/// - A SHA-256 hash of a secret that will be revealed via QR code after the workout
///
/// Can be called by:
/// - Any admin, OR
/// - The assigned trainer
///
/// # Arguments
/// * `yyyymmdd` - Date in YYYYMMDD format (e.g., 20251028)
/// * `hour` - Hour in 24-hour format (0-23)
/// * `minute` - Minute (0-59)
/// * `window_start_ts` - Unix timestamp when claims can begin
/// * `window_end_ts` - Unix timestamp when claims end
/// * `secret_hash` - SHA-256 hash of the reveal_secret (will be shown in QR)
/// * `metadata_uri_override` - Optional custom metadata URI
pub fn open_workout_instance(
    ctx: Context<OpenWorkoutInstance>,
    yyyymmdd: u32,
    hour: u8,
    minute: u8,
    window_start_ts: i64,
    window_end_ts: i64,
    secret_hash: [u8; 32],
    metadata_uri_override: Option<String>,
) -> Result<()> {
    // Validate time window
    require!(
        window_end_ts > window_start_ts,
        WorkoutError::InvalidTimeWindow
    );

    // Validate metadata URI if provided
    if let Some(ref uri) = metadata_uri_override {
        require!(uri.len() <= 200, WorkoutError::MetadataUriTooLong);
    }

    let clock = Clock::get()?;
    let instance_key = ctx.accounts.instance.key();
    let trainer_key = ctx.accounts.trainer.authority;

    let instance = &mut ctx.accounts.instance;
    instance.trainer = trainer_key;
    instance.start_ts = clock.unix_timestamp;
    instance.window_start_ts = window_start_ts;
    instance.window_end_ts = window_end_ts;
    instance.secret_hash = secret_hash;
    instance.is_closed = false;
    instance.yyyymmdd = yyyymmdd;
    instance.hour = hour;
    instance.minute = minute;
    instance.metadata_uri_override = metadata_uri_override.unwrap_or_default();
    instance.bump = ctx.bumps.instance;

    emit!(WorkoutOpened {
        instance: instance_key,
        trainer: instance.trainer,
        window_start_ts,
        window_end_ts,
        yyyymmdd,
        hour,
        minute,
    });

    msg!(
        "Workout instance opened: {}-{:02}-{:02} {:02}:{:02} by trainer {}",
        yyyymmdd / 10000,
        (yyyymmdd / 100) % 100,
        yyyymmdd % 100,
        hour,
        minute,
        instance.trainer
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(yyyymmdd: u32, hour: u8, minute: u8)]
pub struct OpenWorkoutInstance<'info> {
    /// The caller (admin or trainer)
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Optional: Admin account if called by an admin
    /// If present, validates the caller is an admin
    #[account(
        seeds = [b"admin", authority.key().as_ref()],
        bump = admin.bump
    )]
    pub admin: Option<Account<'info, Admin>>,

    /// The trainer for this workout
    /// If authority is not an admin, they must be this trainer
    #[account(
        seeds = [b"trainer", trainer.authority.as_ref()],
        bump = trainer.bump
    )]
    pub trainer: Account<'info, Trainer>,

    /// The workout instance to create (PDA)
    /// Seeds: ["instance", trainer_pubkey, yyyymmdd, hour, minute]
    #[account(
        init,
        payer = authority,
        space = WorkoutInstance::LEN,
        seeds = [
            b"instance",
            trainer.authority.as_ref(),
            &yyyymmdd.to_le_bytes(),
            &[hour],
            &[minute]
        ],
        bump
    )]
    pub instance: Account<'info, WorkoutInstance>,

    /// System program for account creation
    pub system_program: Program<'info, System>,
}

impl<'info> OpenWorkoutInstance<'info> {
    /// Validate that the caller is authorized (either admin or the trainer)
    pub fn validate(&self) -> Result<()> {
        // If admin account is present and valid, they're authorized
        if self.admin.is_some() {
            return Ok(());
        }

        // Otherwise, the signer must be the trainer
        require_keys_eq!(
            self.authority.key(),
            self.trainer.authority,
            WorkoutError::NotAssignedTrainer
        );

        Ok(())
    }
}
