use anchor_lang::prelude::*;
use crate::state::{Admin, Trainer};
use crate::errors::WorkoutError;
use crate::events::TrainerRegistered;

/// Register a new trainer in the program.
/// 
/// Only admins can register trainers. Trainers can then start/close workout instances
/// and generate QR codes for attendees.
/// 
/// # Arguments
/// * `display_name` - Human-readable name for the trainer (used in NFT metadata)
pub fn register_trainer(
    ctx: Context<RegisterTrainer>,
    display_name: String,
) -> Result<()> {
    // Validate display name length
    require!(
        display_name.len() <= 64,
        WorkoutError::DisplayNameTooLong
    );
    
    let trainer = &mut ctx.accounts.trainer;
    trainer.authority = ctx.accounts.trainer_pubkey.key();
    trainer.display_name = display_name.clone();
    trainer.bump = ctx.bumps.trainer;
    
    emit!(TrainerRegistered {
        trainer: trainer.authority,
        display_name,
    });
    
    msg!("Trainer registered: {} ({})", trainer.authority, trainer.display_name);
    
    Ok(())
}

#[derive(Accounts)]
pub struct RegisterTrainer<'info> {
    /// An admin who can register trainers
    #[account(mut)]
    pub admin_authority: Signer<'info>,
    
    /// The admin account proving authorization
    #[account(
        seeds = [b"admin", admin_authority.key().as_ref()],
        bump = admin.bump
    )]
    pub admin: Account<'info, Admin>,
    
    /// CHECK: The public key of the new trainer
    pub trainer_pubkey: UncheckedAccount<'info>,
    
    /// The trainer account to create (PDA)
    /// Seeds: ["trainer", trainer_pubkey]
    #[account(
        init,
        payer = admin_authority,
        space = Trainer::LEN,
        seeds = [b"trainer", trainer_pubkey.key().as_ref()],
        bump
    )]
    pub trainer: Account<'info, Trainer>,
    
    /// System program for account creation
    pub system_program: Program<'info, System>,
}

