use anchor_lang::prelude::*;

#[error_code]
pub enum DropSomeError {
    #[msg("The drop amount is below the minimum allowed amount.")]
    InsufficientDropAmount,
    #[msg("The receiver account has a non-zero balance.")]
    ReceiverBalanceNotEmpty,
    #[msg("Only the designated receiver can claim these funds.")]
    UnauthorizedClaim,
    #[msg("The app state is already initialized.")]
    AppStateAlreadyInitialized,
    #[msg("The fee basis points value is too high (max 10,000 = 100%).")]
    FeeBasisPointsTooHigh,
    #[msg("The app is not active.")]
    AppNotActive,
}
