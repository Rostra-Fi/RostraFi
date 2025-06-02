use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::{constants::*, error::PredictionMarketError, state::Market};

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Market::INIT_SPACE,
        seeds = [MARKET_SEED, market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    /// CHECK: This is the resolver authority, can be the same as creator
    pub resolver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_market(
    ctx: Context<CreateMarket>,
    market_id: u64,
    title: String,
    description: String,
    resolution_time: i64,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let clock = Clock::get()?;

    // Validate inputs
    require!(
        title.len() <= MAX_TITLE_LENGTH,
        PredictionMarketError::TitleTooLong
    );
    require!(
        description.len() <= MAX_DESCRIPTION_LENGTH,
        PredictionMarketError::DescriptionTooLong
    );
    require!(
        resolution_time > clock.unix_timestamp,
        PredictionMarketError::InvalidResolutionTime
    );

    market.market_id = market_id;
    market.title = title;
    market.description = description;
    market.creator = ctx.accounts.creator.key();
    market.resolver = ctx.accounts.resolver.key();
    market.resolution_time = resolution_time;
    market.created_at = clock.unix_timestamp;
    market.resolved_at = None;
    market.winning_outcome = None;
    market.total_yes_amount = 0;
    market.total_no_amount = 0;
    market.total_bets = 0;
    market.is_active = true;
    market.bump = ctx.bumps.market;

    msg!(
        "Market created: {} - {} (ID: {})",
        market.title,
        market.description,
        market.market_id
    );

    Ok(())
}