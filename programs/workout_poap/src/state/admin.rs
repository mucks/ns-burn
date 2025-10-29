use anchor_lang::prelude::*;

/// Admin account representing a registered administrator.
///
/// Seeds: ["admin", admin_pubkey]
///
/// Admins can:
/// - Register trainers
/// - Create and manage workout schedules
/// - Open and close workout instances
/// - Add or remove other admins (if they are the super-admin from Config)
#[account]
pub struct Admin {
    /// The public key of this admin
    pub authority: Pubkey,

    /// PDA bump seed
    pub bump: u8,
}

impl Admin {
    /// Calculate the space needed for this account
    /// Discriminator (8) + Pubkey (32) + u8 (1) = 41 bytes
    pub const LEN: usize = 8 + 32 + 1;
}
