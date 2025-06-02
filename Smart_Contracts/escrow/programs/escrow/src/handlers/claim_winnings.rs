use anchor_lang::prelude::*;

use crate::{constants::*, error::PredictionMarketError, state::{Market, Bet}};

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        seeds = [MARKET_SEED, market.market_id.to_le_bytes().as_ref()],
        bump = market.bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [BET_SEED, market.key().as_ref(), bettor.key().as_ref()],
        bump = bet.bump,
        has_one = bettor
    )]
    pub bet: Account<'info, Bet>,

    /// CHECK: Vault holding the funds
    #[account(
        mut,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
    let market = &ctx.accounts.market;
    let bet = &mut ctx.accounts.bet;

    // Validate market is resolved
    require!(market.is_resolved(), PredictionMarketError::MarketNotResolved);
    require!(!bet.claimed, PredictionMarketError::NoWinningsToClaim);

    // Check if user won
    let winning_outcome = market.winning_outcome.unwrap();
    require!(
        bet.outcome == winning_outcome,
        PredictionMarketError::UserBetOnLosingOutcome
    );

    // Calculate winnings
    let winnings = bet.calculate_winnings(market)?;
    require!(winnings > 0, PredictionMarketError::NoWinningsToClaim);

    // Calculate platform fee
    let platform_fee = winnings.checked_mul(PLATFORM_FEE_BPS)
        .and_then(|x| x.checked_div(10000))
        .ok_or(PredictionMarketError::ArithmeticOverflow)?;
    
    let payout = winnings.checked_sub(platform_fee)
        .ok_or(PredictionMarketError::ArithmeticOverflow)?;

    // Transfer winnings from vault to bettor
    let market_key = market.key();
    let vault_seeds = &[
        VAULT_SEED,
        market_key.as_ref(),
        &[ctx.bumps.vault],
    ];
    let signer_seeds = &[&vault_seeds[..]];

    **ctx.accounts.vault.try_borrow_mut_lamports()? = ctx.accounts.vault.lamports()
        .checked_sub(payout)
        .ok_or(PredictionMarketError::ArithmeticOverflow)?;
    
    **ctx.accounts.bettor.try_borrow_mut_lamports()? = ctx.accounts.bettor.lamports()
        .checked_add(payout)
        .ok_or(PredictionMarketError::ArithmeticOverflow)?;

    // Mark bet as claimed
    bet.claimed = true;

    msg!(
        "Winnings claimed: {} SOL (fee: {} SOL) for market {}",
        payout as f64 / 1_000_000_000.0,
        platform_fee as f64 / 1_000_000_000.0,
        market.market_id
    );

    Ok(())
}