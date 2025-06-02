use anchor_lang::prelude::*;

use crate::{constants::*, error::PredictionMarketError, state::Market};

#[derive(Accounts)]
pub struct CloseMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        close = creator,
        seeds = [MARKET_SEED, market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
        has_one = creator
    )]
    pub market: Account<'info, Market>,

    /// CHECK: Vault to return any remaining funds
    #[account(
        mut,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
}

pub fn close_market(ctx: Context<CloseMarket>) -> Result<()> {
    let market = &ctx.accounts.market;

    // Validate market can be closed
    require!(market.is_resolved(), PredictionMarketError::MarketNotResolved);

    // Return any remaining vault funds to creator
    let vault_balance = ctx.accounts.vault.lamports();
    if vault_balance > 0 {
        **ctx.accounts.vault.try_borrow_mut_lamports()? = 0;
        **ctx.accounts.creator.try_borrow_mut_lamports()? = ctx.accounts.creator.lamports()
            .checked_add(vault_balance)
            .ok_or(PredictionMarketError::ArithmeticOverflow)?;
    }

    msg!("Market {} closed", market.market_id);

    Ok(())
}