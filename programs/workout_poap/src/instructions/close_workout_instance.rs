use crate::errors::WorkoutError;
use crate::events::WorkoutClosed;
use crate::state::{Admin, Trainer, WorkoutInstance};
use anchor_lang::prelude::*;

/// Close a workout instance, preventing any further claims.
///
/// Can be called by:
/// - Any admin, OR
/// - The assigned trainer
///
/// This is typically done after the claim window ends or if the workout is cancelled.
pub fn close_workout_instance(ctx: Context<CloseWorkoutInstance>) -> Result<()> {
    let instance = &mut ctx.accounts.instance;
    let instance_key = instance.key();
    let trainer_key = instance.trainer;

    // Mark as closed
    instance.is_closed = true;

    emit!(WorkoutClosed {
        instance: instance_key,
        trainer: trainer_key,
    });

    msg!("Workout instance closed: {}", ctx.accounts.instance.key());

    Ok(())
}

#[derive(Accounts)]
pub struct CloseWorkoutInstance<'info> {
    /// The caller (admin or trainer)
    pub authority: Signer<'info>,

    /// Optional: Admin account if called by an admin
    #[account(
        seeds = [b"admin", authority.key().as_ref()],
        bump = admin.bump
    )]
    pub admin: Option<Account<'info, Admin>>,

    /// The trainer for this workout
    #[account(
        seeds = [b"trainer", instance.trainer.as_ref()],
        bump = trainer.bump
    )]
    pub trainer: Account<'info, Trainer>,

    /// The workout instance to close
    #[account(
        mut,
        seeds = [
            b"instance",
            instance.trainer.as_ref(),
            &instance.yyyymmdd.to_le_bytes(),
            &[instance.hour],
            &[instance.minute]
        ],
        bump = instance.bump
    )]
    pub instance: Account<'info, WorkoutInstance>,
}

impl<'info> CloseWorkoutInstance<'info> {
    /// Validate that the caller is authorized (either admin or the trainer)
    pub fn validate(&self) -> Result<()> {
        // If admin account is present and valid, they're authorized
        if self.admin.is_some() {
            return Ok(());
        }

        // Otherwise, the signer must be the trainer
        require_keys_eq!(
            self.authority.key(),
            self.trainer.authority,
            WorkoutError::NotAssignedTrainer
        );

        Ok(())
    }
}
