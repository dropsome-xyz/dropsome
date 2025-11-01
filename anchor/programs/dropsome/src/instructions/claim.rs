use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke_signed, system_instruction::transfer},
};

use crate::states::Record;

pub fn claim(ctx: Context<Claim>) -> Result<()> {
    let receiver = &mut ctx.accounts.receiver;
    let record = &mut ctx.accounts.record;
    let vault = &ctx.accounts.vault;

    let sender = &ctx.accounts.sender;
    let sender_address = sender.key();
    let receiver_address = receiver.key();

    let bump = ctx.bumps.vault;

    msg!("Transfer funds to the receiver");
    let vault_seeds: &[&[&[u8]]] = &[&[
        b"vault",
        sender_address.as_ref(),
        receiver_address.as_ref(),
        &[bump],
    ]];

    msg!("Transfer drop to receiver");
    let transfer_to_receiver = transfer(&vault.key(), &receiver.key(), record.amount);

    let account_infos = [
        vault.to_account_info(),
        receiver.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ];

    invoke_signed(&transfer_to_receiver, &account_infos, vault_seeds)?;

    msg!("Refund vault account rent to sender");
    let transfer_to_sender = transfer(&vault.key(), &sender.key(), vault.lamports());

    let refund_account_infos = [
        vault.to_account_info(),
        sender.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ];

    invoke_signed(&transfer_to_sender, &refund_account_infos, vault_seeds)?;

    Ok(())
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    receiver: Signer<'info>,
    /// CHECK: Sender is the account that sent the funds to the vault
    #[account(mut)]
    sender: AccountInfo<'info>,
    /// CHECK: Vault PDA for storing funds, owned by system program
    #[account(
        mut,
        seeds = [b"vault", record.sender.key().as_ref(), receiver.key().as_ref()],
        bump,
        owner = system_program.key(),
    )]
    vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"record", record.sender.key().as_ref(), receiver.key().as_ref()],
        bump,
        close = sender,
        has_one = receiver,
        has_one = vault,
        has_one = sender,
    )]
    record: Account<'info, Record>,
    system_program: Program<'info, System>,
}
