use crate::state::market::Market;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
    pub outcome: bool, // true for YES, false for NO
    pub placed_at: i64,
    pub claimed: bool,
    pub bump: u8,
}

impl Bet {
    pub fn calculate_winnings(&self, market: &Market) -> Result<u64> {
        if self.claimed {
            return Ok(0);
        }

        market.calculate_payout(self.amount, self.outcome)
    }
}