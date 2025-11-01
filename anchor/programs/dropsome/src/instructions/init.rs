use anchor_lang::{prelude::*, solana_program::bpf_loader_upgradeable};

use crate::states::AppState;

pub fn initialize(ctx: Context<Initialize>, parameters: AppStateParameters) -> Result<()> {
    let app_state = &mut ctx.accounts.app_state;

    require!(
        !app_state.is_initialized,
        crate::errors::DropSomeError::AppStateAlreadyInitialized
    );

    require!(
        parameters.fee_basis_points <= 10_000,
        crate::errors::DropSomeError::FeeBasisPointsTooHigh
    );

    app_state.is_initialized = true;
    app_state.authority = parameters.authority;
    app_state.is_active = parameters.is_active;
    app_state.network_fee_reserve = parameters.network_fee_reserve;
    app_state.treasury = parameters.treasury;
    app_state.fee_basis_points = parameters.fee_basis_points;
    app_state.min_drop_amount = parameters.min_drop_amount;

    msg!(
        "App initialized. app_state.is_active = {}",
        app_state.is_active
    );

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        mut,
        constraint = authority.key() == program_data.upgrade_authority_address.unwrap_or_default()
    )]
    authority: Signer<'info>,
    #[account(
        init,
        space = 8 + AppState::LEN,
        seeds = [b"app_state"],
        bump,
        payer = authority,
    )]
    app_state: Account<'info, AppState>,
    #[account(
        seeds = [crate::ID.as_ref()],
        bump,
        seeds::program = bpf_loader_upgradeable::id(),
    )]
    program_data: Account<'info, ProgramData>,
    system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AppStateParameters {
    pub authority: Pubkey,
    pub is_active: bool,
    pub network_fee_reserve: u64,
    pub treasury: Pubkey,
    pub fee_basis_points: u16,
    pub min_drop_amount: u64,
}
