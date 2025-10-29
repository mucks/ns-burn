use anchor_lang::prelude::*;

/// Attendance record for a user at a specific workout instance.
///
/// Seeds: ["attendance", instance_pubkey, user_pubkey]
///
/// This account:
/// - Proves a user attended a specific workout
/// - Prevents double-claiming (one NFT per user per workout)
/// - Stores the minted NFT address for reference
#[account]
pub struct Attendance {
    /// The workout instance this attendance record belongs to
    pub instance: Pubkey,

    /// The user who attended
    pub user: Pubkey,

    /// Whether the user has claimed their NFT
    pub claimed: bool,

    /// The NFT mint address (set after successful claim)
    pub nft_mint: Pubkey,

    /// PDA bump seed
    pub bump: u8,
}

impl Attendance {
    /// Calculate the space needed for this account
    /// Discriminator (8) + Pubkey (32) + Pubkey (32) + bool (1) + Pubkey (32) + u8 (1) = 106 bytes
    pub const LEN: usize = 8 + 32 + 32 + 1 + 32 + 1;
}
