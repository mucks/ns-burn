use anchor_lang::prelude::*;

/// Custom error codes for the workout POAP program.
/// 
/// These errors provide clear, actionable feedback when operations fail,
/// making debugging and user experience much better than generic errors.
#[error_code]
pub enum WorkoutError {
    #[msg("Unauthorized: caller is not an admin")]
    Unauthorized,
    
    #[msg("Unauthorized: caller is not the config authority")]
    NotConfigAuthority,
    
    #[msg("Unauthorized: caller is not the assigned trainer for this workout")]
    NotAssignedTrainer,
    
    #[msg("Invalid claim window: current time is outside the allowed window")]
    InvalidClaimWindow,
    
    #[msg("Workout instance is already closed")]
    InstanceClosed,
    
    #[msg("Already claimed: user has already claimed an NFT for this workout")]
    AlreadyClaimed,
    
    #[msg("Hash mismatch: provided secret does not match the stored hash")]
    HashMismatch,
    
    #[msg("Invalid schedule: must have at least one time slot")]
    EmptySchedule,
    
    #[msg("Schedule has too many slots (max 20)")]
    TooManySlots,
    
    #[msg("Display name too long (max 64 bytes)")]
    DisplayNameTooLong,
    
    #[msg("Invalid time: window_end_ts must be after window_start_ts")]
    InvalidTimeWindow,
    
    #[msg("Metadata URI override too long (max 200 bytes)")]
    MetadataUriTooLong,
}

