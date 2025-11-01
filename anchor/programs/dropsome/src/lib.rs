use crate::instructions::*;
use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

declare_id!("DSdHwC1vGPL4KzNAhgxMYggZnBBaY8upKx6uo655kVYZ");

#[program]
pub mod dropsome {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, parameters: AppStateParameters) -> Result<()> {
        init::initialize(ctx, parameters)
    }

    pub fn update_state(ctx: Context<UpdateState>, parameters: AppStateParameters) -> Result<()> {
        update::update_state(ctx, parameters)
    }

    pub fn drop(ctx: Context<Drop>, amount: u64) -> Result<()> {
        drop::drop_some(ctx, amount)
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        claim::claim(ctx)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        refund::refund(ctx)
    }
}
