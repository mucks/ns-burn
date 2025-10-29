use anchor_lang::prelude::*;
use crate::state::{Config, Admin};
use crate::errors::WorkoutError;
use crate::events::AdminRemoved;

/// Remove an admin from the program.
/// 
/// Only the super-admin (Config.authority) can remove admins.
/// This closes the Admin account and returns rent to the authority.
pub fn remove_admin(ctx: Context<RemoveAdmin>) -> Result<()> {
    // Verify the signer is the config authority (super-admin)
    require_keys_eq!(
        ctx.accounts.authority.key(),
        ctx.accounts.config.authority,
        WorkoutError::NotConfigAuthority
    );
    
    emit!(AdminRemoved {
        admin: ctx.accounts.admin.authority,
    });
    
    msg!("Admin removed: {}", ctx.accounts.admin.authority);
    
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveAdmin<'info> {
    /// The super-admin authority from Config
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// The global config account
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    /// The admin account to remove (will be closed)
    #[account(
        mut,
        close = authority,
        seeds = [b"admin", admin.authority.as_ref()],
        bump = admin.bump
    )]
    pub admin: Account<'info, Admin>,
}

