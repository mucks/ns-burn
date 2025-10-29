use anchor_lang::prelude::*;
use crate::state::{Config, Admin};
use crate::errors::WorkoutError;
use crate::events::AdminAdded;

/// Add a new admin to the program.
/// 
/// Only the super-admin (Config.authority) can add new admins.
/// Admins can manage trainers, schedules, and workout instances.
/// 
/// # Arguments
/// * `new_admin` - The public key of the account to grant admin privileges
pub fn add_admin(ctx: Context<AddAdmin>) -> Result<()> {
    // Verify the signer is the config authority (super-admin)
    require_keys_eq!(
        ctx.accounts.authority.key(),
        ctx.accounts.config.authority,
        WorkoutError::NotConfigAuthority
    );
    
    let admin = &mut ctx.accounts.admin;
    admin.authority = ctx.accounts.new_admin.key();
    admin.bump = ctx.bumps.admin;
    
    emit!(AdminAdded {
        admin: admin.authority,
    });
    
    msg!("Admin added: {}", admin.authority);
    
    Ok(())
}

#[derive(Accounts)]
pub struct AddAdmin<'info> {
    /// The super-admin authority from Config
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// The global config account
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    /// CHECK: The public key of the new admin (doesn't need to sign)
    pub new_admin: UncheckedAccount<'info>,
    
    /// The admin account to create (PDA)
    /// Seeds: ["admin", new_admin_pubkey]
    #[account(
        init,
        payer = authority,
        space = Admin::LEN,
        seeds = [b"admin", new_admin.key().as_ref()],
        bump
    )]
    pub admin: Account<'info, Admin>,
    
    /// System program for account creation
    pub system_program: Program<'info, System>,
}

