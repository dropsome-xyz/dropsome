use anchor_lang::{prelude::*, solana_program::bpf_loader_upgradeable};

use crate::{instructions::AppStateParameters, states::AppState};

pub fn update_state(ctx: Context<UpdateState>, parameters: AppStateParameters) -> Result<()> {
    let app_state = &mut ctx.accounts.app_state;

    require!(
        app_state.is_initialized,
        anchor_lang::prelude::ErrorCode::AccountNotInitialized
    );
    require!(
        app_state.authority == ctx.accounts.authority.key(),
        anchor_lang::prelude::ErrorCode::ConstraintHasOne
    );
    require!(
        parameters.fee_basis_points <= 10_000,
        crate::errors::DropSomeError::FeeBasisPointsTooHigh
    );

    if app_state.authority != parameters.authority {
        app_state.authority = parameters.authority;
    }
    if app_state.is_active != parameters.is_active {
        app_state.is_active = parameters.is_active;
    }
    if app_state.network_fee_reserve != parameters.network_fee_reserve {
        app_state.network_fee_reserve = parameters.network_fee_reserve;
    }
    if app_state.treasury != parameters.treasury {
        app_state.treasury = parameters.treasury;
    }
    if app_state.fee_basis_points != parameters.fee_basis_points {
        app_state.fee_basis_points = parameters.fee_basis_points;
    }
    if app_state.min_drop_amount != parameters.min_drop_amount {
        app_state.min_drop_amount = parameters.min_drop_amount;
    }

    msg!(
        "App state updated. app_state.is_active = {}",
        app_state.is_active
    );

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateState<'info> {
    #[account(
        mut,
        constraint = authority.key() == program_data.upgrade_authority_address.unwrap_or_default()
    )]
    authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"app_state"],
        bump,
        has_one = authority,
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
