use anchor_lang::prelude::*;
use handlers::*;

pub mod constants;
pub mod error;
pub mod handlers;
pub mod state;

declare_id!("7yMnrzoEQZ6DmgNLH7PRoHduGRffPdMq7H1drrMZV83H");

#[program]
pub mod prediction_market {
    use super::*;

    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_id: u64,
        title: String,
        description: String,
        resolution_time: i64,
    ) -> Result<()> {
        handlers::create_market::create_market(ctx, market_id, title, description, resolution_time)
    }

    pub fn place_bet(
        ctx: Context<PlaceBet>,
        amount: u64,
        outcome: bool, 
    ) -> Result<()> {
        handlers::place_bet::place_bet(ctx, amount, outcome)
    }

    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        winning_outcome: bool,
    ) -> Result<()> {
        handlers::resolve_market::resolve_market(ctx, winning_outcome)
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        handlers::claim_winnings::claim_winnings(ctx)
    }

    pub fn close_market(ctx: Context<CloseMarket>) -> Result<()> {
        handlers::close_market::close_market(ctx)
    }
}