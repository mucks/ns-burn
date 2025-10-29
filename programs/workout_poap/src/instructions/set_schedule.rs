use anchor_lang::prelude::*;
use crate::state::{Admin, Schedule, DaySlot};
use crate::errors::WorkoutError;

/// Create or update a workout schedule template.
/// 
/// Schedules define recurring workout times (e.g., Mon-Fri at 7:00 AM and 6:00 PM).
/// Admins use schedules as templates to create actual WorkoutInstance accounts.
/// 
/// # Arguments
/// * `schedule_id` - Unique identifier for this schedule (e.g., "morning-bootcamp")
/// * `slots` - Array of time slots (day of week + time)
/// * `is_active` - Whether this schedule is currently in use
pub fn set_schedule(
    ctx: Context<SetSchedule>,
    _schedule_id: String, // Used in seeds, but not stored (kept for clarity)
    slots: Vec<DaySlot>,
    is_active: bool,
) -> Result<()> {
    // Validate slots
    require!(!slots.is_empty(), WorkoutError::EmptySchedule);
    require!(
        slots.len() <= Schedule::MAX_SLOTS,
        WorkoutError::TooManySlots
    );
    
    let schedule = &mut ctx.accounts.schedule;
    schedule.created_by = ctx.accounts.admin_authority.key();
    schedule.slots = slots.clone();
    schedule.is_active = is_active;
    schedule.bump = ctx.bumps.schedule;
    
    msg!(
        "Schedule set with {} slots, active: {}",
        slots.len(),
        is_active
    );
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(schedule_id: String)]
pub struct SetSchedule<'info> {
    /// An admin who can manage schedules
    #[account(mut)]
    pub admin_authority: Signer<'info>,
    
    /// The admin account proving authorization
    #[account(
        seeds = [b"admin", admin_authority.key().as_ref()],
        bump = admin.bump
    )]
    pub admin: Account<'info, Admin>,
    
    /// The schedule account (PDA)
    /// Seeds: ["schedule", schedule_id]
    /// Using init_if_needed to allow updates
    #[account(
        init_if_needed,
        payer = admin_authority,
        space = Schedule::LEN,
        seeds = [b"schedule", schedule_id.as_bytes()],
        bump
    )]
    pub schedule: Account<'info, Schedule>,
    
    /// System program for account creation
    pub system_program: Program<'info, System>,
}

