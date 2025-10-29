use anchor_lang::prelude::*;

/// Trainer account representing a registered workout trainer.
///
/// Seeds: ["trainer", trainer_pubkey]
///
/// Trainers can:
/// - Start and close workout instances they are assigned to
/// - Generate QR codes for attendees to claim NFTs
#[account]
pub struct Trainer {
    /// The public key of this trainer
    pub authority: Pubkey,

    /// Display name for the trainer (used in NFT metadata)
    /// Max length: 64 bytes for UTF-8 encoded string
    pub display_name: String,

    /// PDA bump seed
    pub bump: u8,
}

impl Trainer {
    /// Calculate the space needed for this account
    /// Discriminator (8) + Pubkey (32) + String (4 + 64) + u8 (1) = 109 bytes
    /// String uses 4 bytes for length prefix + max 64 bytes for content
    pub const LEN: usize = 8 + 32 + 4 + 64 + 1;
}
