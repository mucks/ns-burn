use anchor_lang::prelude::*;

/// Monthly counter tracking a user's workout attendance for a specific month.
/// 
/// Seeds: ["monthly", user_pubkey, yyyymm (u32 as bytes)]
/// 
/// This account:
/// - Tracks how many workouts a user attended in a given month
/// - Enables leaderboard functionality (most active users per month)
/// - Is automatically incremented when a user claims an NFT
/// 
/// Example: For October 2025, yyyymm = 202510
#[account]
pub struct MonthlyCounter {
    /// The user this counter belongs to
    pub user: Pubkey,
    
    /// Year and month in YYYYMM format (e.g., 202510 for October 2025)
    pub yyyymm: u32,
    
    /// Number of workouts attended this month
    pub count: u32,
    
    /// PDA bump seed
    pub bump: u8,
}

impl MonthlyCounter {
    /// Calculate the space needed for this account
    /// Discriminator (8) + Pubkey (32) + u32 (4) + u32 (4) + u8 (1) = 49 bytes
    pub const LEN: usize = 8 + 32 + 4 + 4 + 1;
}

