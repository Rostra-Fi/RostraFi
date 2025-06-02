use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::{constants::*, error::PredictionMarketError, state::{Market, Bet}};

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, market.market_id.to_le_bytes().as_ref()],
        bump = market.bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = bettor,
        space = 8 + Bet::INIT_SPACE,
        seeds = [BET_SEED, market.key().as_ref(), bettor.key().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    /// CHECK: Vault to hold the bet funds
    #[account(
        mut,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn place_bet(
    ctx: Context<PlaceBet>,
    amount: u64,
    outcome: bool,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let bet = &mut ctx.accounts.bet;
    let clock = Clock::get()?;

    // Validate market state
    require!(market.can_accept_bets(), PredictionMarketError::MarketExpired);
    require!(amount >= MIN_BET_AMOUNT, PredictionMarketError::BetAmountTooLow);

    // Transfer SOL from bettor to vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.bettor.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        amount,
    )?;

    // Update market totals
    if outcome {
        market.total_yes_amount = market.total_yes_amount.checked_add(amount)
            .ok_or(PredictionMarketError::ArithmeticOverflow)?;
    } else {
        market.total_no_amount = market.total_no_amount.checked_add(amount)
            .ok_or(PredictionMarketError::ArithmeticOverflow)?;
    }
    market.total_bets = market.total_bets.checked_add(1)
        .ok_or(PredictionMarketError::ArithmeticOverflow)?;

    // Initialize bet account
    bet.market = market.key();
    bet.bettor = ctx.accounts.bettor.key();
    bet.amount = amount;
    bet.outcome = outcome;
    bet.placed_at = clock.unix_timestamp;
    bet.claimed = false;
    bet.bump = ctx.bumps.bet;

    msg!(
        "Bet placed: {} SOL on {} for market {}",
        amount as f64 / 1_000_000_000.0,
        if outcome { "YES" } else { "NO" },
        market.market_id
    );

    Ok(())
}