use anchor_lang::prelude::*;

/// Event emitted when a new workout instance is opened.
/// 
/// This helps indexers and UIs track when new workout sessions are available for claiming.
#[event]
pub struct WorkoutOpened {
    /// The public key of the workout instance account
    pub instance: Pubkey,
    
    /// The trainer leading this workout
    pub trainer: Pubkey,
    
    /// When the claim window opens
    pub window_start_ts: i64,
    
    /// When the claim window closes
    pub window_end_ts: i64,
    
    /// The date in YYYYMMDD format
    pub yyyymmdd: u32,
    
    /// Hour of the workout
    pub hour: u8,
    
    /// Minute of the workout
    pub minute: u8,
}

/// Event emitted when a user successfully claims an NFT.
/// 
/// This helps track attendance and automatically updates leaderboards.
#[event]
pub struct Claimed {
    /// The workout instance that was claimed
    pub instance: Pubkey,
    
    /// The user who claimed
    pub user: Pubkey,
    
    /// The minted NFT address
    pub nft_mint: Pubkey,
    
    /// The month this claim counts towards (YYYYMM format)
    pub yyyymm: u32,
    
    /// The user's new total for this month
    pub new_monthly_count: u32,
}

/// Event emitted when a workout instance is closed.
/// 
/// After this event, no more claims can be made for this workout.
#[event]
pub struct WorkoutClosed {
    /// The workout instance that was closed
    pub instance: Pubkey,
    
    /// The trainer who led the workout
    pub trainer: Pubkey,
}

/// Event emitted when a new trainer is registered.
#[event]
pub struct TrainerRegistered {
    /// The trainer's public key
    pub trainer: Pubkey,
    
    /// The trainer's display name
    pub display_name: String,
}

/// Event emitted when a new admin is added.
#[event]
pub struct AdminAdded {
    /// The new admin's public key
    pub admin: Pubkey,
}

/// Event emitted when an admin is removed.
#[event]
pub struct AdminRemoved {
    /// The removed admin's public key
    pub admin: Pubkey,
}

