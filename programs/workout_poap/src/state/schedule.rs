use anchor_lang::prelude::*;

/// A single time slot in a weekly schedule.
/// Represents a specific day of week + time when a workout occurs.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct DaySlot {
    /// Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    pub dow: u8,

    /// Hour in 24-hour format (0-23)
    pub hour: u8,

    /// Minute (0-59)
    pub minute: u8,
}

impl DaySlot {
    /// Size: u8 + u8 + u8 = 3 bytes
    pub const LEN: usize = 3;
}

/// Schedule account representing a recurring workout schedule template.
///
/// Seeds: ["schedule", schedule_id (as bytes)]
///
/// Schedules define recurring workout times (e.g., Mon-Fri at 7:00 AM and 6:00 PM).
/// Admins use schedules as templates to create actual WorkoutInstance accounts.
#[account]
pub struct Schedule {
    /// The admin who created this schedule
    pub created_by: Pubkey,

    /// Array of time slots (up to 20 slots for flexibility)
    /// Each slot represents a recurring time in the week
    pub slots: Vec<DaySlot>,

    /// Whether this schedule is currently active
    pub is_active: bool,

    /// PDA bump seed
    pub bump: u8,
}

impl Schedule {
    /// Maximum number of slots allowed per schedule
    pub const MAX_SLOTS: usize = 20;

    /// Calculate the space needed for this account
    /// Discriminator (8) + Pubkey (32) + Vec<DaySlot> (4 + 20*3) + bool (1) + u8 (1) = 106 bytes
    pub const LEN: usize = 8 + 32 + 4 + (Self::MAX_SLOTS * DaySlot::LEN) + 1 + 1;
}
