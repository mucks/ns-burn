use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;
use state::DaySlot;

declare_id!("7CLhdcpry5nkB1YmnzDnCrSHNiEmVsvSxdhB3LCReJAf");

/// # Workout POAP Program
///
/// A production-quality Solana program for minting time-scoped, trainer-customized
/// NFTs as proof of workout attendance via QR-based claims.
///
/// ## Core Concepts
///
/// ### Roles
/// - **Super Admin**: Controls the Config, can add/remove admins
/// - **Admins**: Can register trainers, manage schedules, open/close workout instances
/// - **Trainers**: Can open/close their own workout instances, display QR codes
/// - **Users/Attendees**: Can scan QR codes and claim NFTs
///
/// ### Flow
/// 1. Admin initializes config
/// 2. Admin adds other admins and registers trainers
/// 3. Admin or Trainer opens a workout instance with:
///    - Date and time
///    - Claim window (when attendees can claim)
///    - Secret hash (SHA-256 of a random secret)
/// 4. Trainer displays QR code containing {instance_pubkey, reveal_secret}
/// 5. Attendees scan QR and call claim_nft
/// 6. Program verifies:
///    - Current time is within claim window
///    - SHA-256(reveal_secret) matches stored hash
///    - User hasn't already claimed
/// 7. Program mints NFT with metadata:
///    - Name includes date, time, and trainer
///    - Metadata URI points to workout details
/// 8. Program increments user's monthly counter for leaderboard
///
/// ### Security
/// - Role-based access control via Admin and Trainer PDAs
/// - Time-windowed claims prevent late claims
/// - Secret hash verification proves physical attendance
/// - One claim per user per workout (enforced by Attendance PDA)
/// - All seeds are deterministic to prevent spoofing
///
/// ### Leaderboard
/// - MonthlyCounter PDAs track claims per user per month
/// - Clients query and sort counters for leaderboard display
#[program]
pub mod workout_poap {
    use super::*;

    /// Initialize the global configuration.
    ///
    /// Must be called once before any other instructions.
    /// Sets the super-admin and optionally a collection mint for grouping NFTs.
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        collection_mint: Option<Pubkey>,
    ) -> Result<()> {
        instructions::initialize_config(ctx, collection_mint)
    }

    /// Add a new admin.
    ///
    /// Only the super-admin (Config.authority) can call this.
    pub fn add_admin(ctx: Context<AddAdmin>) -> Result<()> {
        instructions::add_admin(ctx)
    }

    /// Remove an admin.
    ///
    /// Only the super-admin (Config.authority) can call this.
    pub fn remove_admin(ctx: Context<RemoveAdmin>) -> Result<()> {
        instructions::remove_admin(ctx)
    }

    /// Register a new trainer.
    ///
    /// Any admin can call this. Trainers can then start/close workout instances.
    pub fn register_trainer(ctx: Context<RegisterTrainer>, display_name: String) -> Result<()> {
        instructions::register_trainer(ctx, display_name)
    }

    /// Create or update a workout schedule template.
    ///
    /// Schedules define recurring workout times (e.g., Mon-Fri at 7:00 AM).
    /// Admins use these as templates to create WorkoutInstance accounts.
    pub fn set_schedule(
        ctx: Context<SetSchedule>,
        schedule_id: String,
        slots: Vec<DaySlot>,
        is_active: bool,
    ) -> Result<()> {
        instructions::set_schedule(ctx, schedule_id, slots, is_active)
    }

    /// Open a new workout instance.
    ///
    /// Can be called by any admin or the assigned trainer.
    /// Creates a WorkoutInstance with a claim window and secret hash.
    /// After the workout, the trainer displays a QR code with the reveal_secret.
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
        // Validate caller is authorized
        ctx.accounts.validate()?;

        instructions::open_workout_instance(
            ctx,
            yyyymmdd,
            hour,
            minute,
            window_start_ts,
            window_end_ts,
            secret_hash,
            metadata_uri_override,
        )
    }

    /// Close a workout instance.
    ///
    /// Can be called by any admin or the assigned trainer.
    /// Prevents any further claims for this workout.
    pub fn close_workout_instance(ctx: Context<CloseWorkoutInstance>) -> Result<()> {
        // Validate caller is authorized
        ctx.accounts.validate()?;

        instructions::close_workout_instance(ctx)
    }

    /// Claim an NFT for attending a workout.
    ///
    /// Users call this after scanning the QR code shown by the trainer.
    /// The QR code contains the reveal_secret, which must hash to the stored secret_hash.
    ///
    /// This instruction:
    /// - Verifies the claim window is valid
    /// - Verifies the secret matches
    /// - Mints an NFT with workout metadata
    /// - Increments the user's monthly counter
    pub fn claim_nft(ctx: Context<ClaimNft>, reveal_secret: Vec<u8>) -> Result<()> {
        instructions::claim_nft(ctx, reveal_secret)
    }
}
