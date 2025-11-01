use anchor_lang::prelude::*;

#[account]
pub struct Record {
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
}

impl Record {
    pub const LEN: usize = 32 * 3 + 8;
}

#[account]
pub struct AppState {
    pub is_initialized: bool,
    pub authority: Pubkey,
    pub is_active: bool,
    pub network_fee_reserve: u64,
    pub treasury: Pubkey,
    pub fee_basis_points: u16,
    pub min_drop_amount: u64,
}

impl AppState {
    pub const LEN: usize = 1 + 32 + 1 + 8 + 32 + 2 + 8;
}
