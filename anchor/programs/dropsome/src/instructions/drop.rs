use anchor_lang::{
    prelude::*,
    solana_program::{self, program::invoke},
};

use crate::{
    errors::DropSomeError,
    states::{AppState, Record},
};

pub fn drop_some(ctx: Context<Drop>, amount: u64) -> Result<()> {
    let sender = &ctx.accounts.sender;
    let receiver = &ctx.accounts.receiver;
    let vault = &mut ctx.accounts.vault;
    let record = &mut ctx.accounts.record;
    let system_program = &ctx.accounts.system_program;

    let app_state = &mut ctx.accounts.app_state;
    let treasury = &mut ctx.accounts.treasury;

    require!(
        amount >= app_state.min_drop_amount,
        DropSomeError::InsufficientDropAmount
    );

    require!(app_state.is_active, DropSomeError::AppNotActive);

    let service_fee = amount * app_state.fee_basis_points as u64 / 10000;

    let rent = Rent::get()?;
    let vault_rent_exemption = rent.minimum_balance(0);
    let total_vault_amount = amount + vault_rent_exemption;

    msg!("Save data about drop");
    record.sender = sender.key();
    record.receiver = receiver.key();
    record.vault = vault.key();
    record.amount = amount;

    msg!("Transfer the network fee reserve to the receiver");
    let transfer_to_receiver = solana_program::system_instruction::transfer(
        &sender.key(),
        &receiver.key(),
        app_state.network_fee_reserve,
    );
    invoke(
        &transfer_to_receiver,
        &[
            sender.to_account_info(),
            receiver.to_account_info(),
            system_program.to_account_info(),
        ],
    )?;

    msg!("Transfer funds to the vault");
    let transfer_to_vault = solana_program::system_instruction::transfer(
        &sender.key(),
        &vault.key(),
        total_vault_amount,
    );
    invoke(
        &transfer_to_vault,
        &[
            sender.to_account_info(),
            vault.to_account_info(),
            system_program.to_account_info(),
        ],
    )?;

    msg!("Transfer the service fee to the treasury");
    let transfer_to_treasury = solana_program::system_instruction::transfer(
        &sender.key(),
        &treasury.key(),
        service_fee
    );
    invoke(
        &transfer_to_treasury,
        &[
            sender.to_account_info(),
            treasury.to_account_info(),
            system_program.to_account_info(),
        ],
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct Drop<'info> {
    #[account(mut)]
    sender: Signer<'info>,
    /// CHECK: Receiver is a fresh system program account created by frontend
    #[account(
        mut,
        owner = system_program.key(),
        constraint = receiver.get_lamports() == 0 @ DropSomeError::ReceiverBalanceNotEmpty,
    )]
    receiver: AccountInfo<'info>,
    /// CHECK: Vault PDA for storing funds, owned by system program
    #[account(
        mut,
        seeds = [b"vault", sender.key().as_ref(), receiver.key().as_ref()],
        bump,
        owner = system_program.key(),
    )]
    vault: AccountInfo<'info>,
    #[account(
        init,
        space = 8 + Record::LEN,
        seeds = [b"record", sender.key().as_ref(), receiver.key().as_ref()],
        bump,
        payer = sender,
    )]
    record: Account<'info, Record>,
    #[account(
        mut,
        seeds = [b"app_state"],
        bump,
        has_one = treasury,
    )]
    app_state: Account<'info, AppState>,
    /// CHECK: Treasury account must match app state treasury
    #[account(
        mut,
        owner = system_program.key(),
        constraint = treasury.key() == app_state.treasury @ anchor_lang::prelude::ErrorCode::ConstraintHasOne,
    )]
    treasury: AccountInfo<'info>,
    system_program: Program<'info, System>,
}
