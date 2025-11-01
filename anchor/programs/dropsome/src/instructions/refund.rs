use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke_signed, system_instruction::transfer},
};

use crate::states::Record;

pub fn refund(ctx: Context<Refund>) -> Result<()> {
    let sender = &mut ctx.accounts.sender;
    let vault = &mut ctx.accounts.vault;
    let record = &mut ctx.accounts.record;

    let sender_address = sender.key();
    let receiver_address = record.receiver;

    let bump = ctx.bumps.vault;

    let vault_seeds: &[&[&[u8]]] = &[&[
        b"vault",
        sender_address.as_ref(),
        receiver_address.as_ref(),
        &[bump],
    ]];

    msg!("Transfer funds to the sender");
    let transfer_to_sender = transfer(&vault.key(), &sender.key(), vault.lamports());

    let account_infos = [
        vault.to_account_info(),
        sender.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ];

    invoke_signed(&transfer_to_sender, &account_infos, vault_seeds)?;

    Ok(())
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    sender: Signer<'info>,
    /// CHECK: Vault PDA for storing funds, owned by system program
    #[account(
        mut,
        seeds = [b"vault", sender.key().as_ref(), record.receiver.key().as_ref()],
        bump,
        constraint = vault.key() == record.vault,
        owner = system_program.key(),
    )]
    vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"record", sender.key().as_ref(), record.receiver.key().as_ref()],
        bump,
        close = sender,
        has_one = sender,
        has_one = vault,
    )]
    record: Account<'info, Record>,
    system_program: Program<'info, System>,
}
