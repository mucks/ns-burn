use anchor_lang::prelude::*;
use crate::state::Config;

/// Initialize the global configuration for the workout POAP program.
/// 
/// This must be called once to set up the program. It creates the Config account
/// and sets the initial super-admin authority.
/// 
/// # Arguments
/// * `collection_mint` - Optional: Pre-created collection NFT mint to group all workout NFTs
pub fn initialize_config(
    ctx: Context<InitializeConfig>,
    collection_mint: Option<Pubkey>,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    // Set the authority to the signer (super-admin)
    config.authority = ctx.accounts.authority.key();
    config.collection_mint = collection_mint;
    config.bump = ctx.bumps.config;
    
    msg!("Workout POAP config initialized with authority: {}", config.authority);
    if let Some(mint) = collection_mint {
        msg!("Collection mint set to: {}", mint);
    }
    
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    /// The super-admin who will have ultimate control over the program
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// The global config account (PDA)
    /// Seeds: ["config"]
    #[account(
        init,
        payer = authority,
        space = Config::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    /// System program for account creation
    pub system_program: Program<'info, System>,
}

