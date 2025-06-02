use anchor_lang::prelude::*;

use crate::{constants::*, error::PredictionMarketError, state::Market};

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut)]
    pub resolver: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, market.market_id.to_le_bytes().as_ref()],
        bump = market.bump,
        has_one = resolver @ PredictionMarketError::UnauthorizedResolver
    )]
    pub market: Account<'info, Market>,
}

pub fn resolve_market(
    ctx: Context<ResolveMarket>,
    winning_outcome: bool,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let clock = Clock::get()?;

    // Validate market can be resolved
    require!(!market.is_resolved(), PredictionMarketError::MarketAlreadyResolved);
    require!(market.is_expired(), PredictionMarketError::MarketNotExpired);

    // Resolve the market
    market.winning_outcome = Some(winning_outcome);
    market.resolved_at = Some(clock.unix_timestamp);
    market.is_active = false;

    msg!(
        "Market {} resolved: {} wins",
        market.market_id,
        if winning_outcome { "YES" } else { "NO" }
    );

    Ok(())
}