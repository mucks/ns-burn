use anchor_lang::prelude::*;

/// Global configuration for the workout POAP program.
///
/// Seeds: ["config"]
///
/// This account stores:
/// - The super-admin authority who can add/remove other admins
/// - An optional collection mint to group all workout NFTs under one collection
#[account]
pub struct Config {
    /// The super-admin public key with ultimate control
    pub authority: Pubkey,

    /// Optional: A pre-created collection NFT mint to group all session NFTs
    /// If set, all minted NFTs will be set as part of this collection
    pub collection_mint: Option<Pubkey>,

    /// PDA bump seed for secure derivation
    pub bump: u8,
}

impl Config {
    /// Calculate the space needed for this account
    /// Discriminator (8) + Pubkey (32) + Option<Pubkey> (1 + 32) + u8 (1) = 74 bytes
    pub const LEN: usize = 8 + 32 + 33 + 1;
}
