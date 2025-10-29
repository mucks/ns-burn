use anchor_lang::prelude::*;

/// WorkoutInstance represents a specific occurrence of a workout session.
///
/// Seeds: ["instance", trainer_pubkey, yyyymmdd (u32 as bytes), hour (u8 as bytes), minute (u8 as bytes)]
///
/// Each instance:
/// - Has a specific date and time
/// - Is led by a specific trainer
/// - Has a time window during which attendees can claim NFTs
/// - Contains a hash of a secret that attendees must provide (via QR scan) to prove they attended
///
/// Flow:
/// 1. Admin/Trainer opens the instance before/during the workout with a secret_hash
/// 2. After the workout, trainer displays a QR code with the reveal_secret
/// 3. Attendees scan the QR and submit the reveal_secret to claim their NFT
/// 4. The program verifies sha256(reveal_secret) matches the stored secret_hash
#[account]
pub struct WorkoutInstance {
    /// The trainer leading this workout
    pub trainer: Pubkey,

    /// Unix timestamp when the instance was created/started
    pub start_ts: i64,

    /// Unix timestamp when the claim window opens
    /// Typically set to the actual workout start time or shortly after
    pub window_start_ts: i64,

    /// Unix timestamp when the claim window closes
    /// Usually 15-30 minutes after the workout ends
    pub window_end_ts: i64,

    /// SHA-256 hash of the reveal_secret
    /// The reveal_secret is shown in the QR code after the workout
    pub secret_hash: [u8; 32],

    /// Whether this instance has been closed (prevents further claims)
    pub is_closed: bool,

    /// Date of the workout in YYYYMMDD format (e.g., 20251028)
    pub yyyymmdd: u32,

    /// Hour of the workout (0-23)
    pub hour: u8,

    /// Minute of the workout (0-59)
    pub minute: u8,

    /// Optional: Override metadata URI for custom artwork
    /// If empty, the program will use a default metadata template
    pub metadata_uri_override: String,

    /// PDA bump seed
    pub bump: u8,
}

impl WorkoutInstance {
    /// Calculate the space needed for this account
    /// Discriminator (8) + Pubkey (32) + i64 (8) + i64 (8) + i64 (8) + [u8;32] (32)
    /// + bool (1) + u32 (4) + u8 (1) + u8 (1) + String (4 + 200) + u8 (1) = 308 bytes
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 32 + 1 + 4 + 1 + 1 + 4 + 200 + 1;
}
