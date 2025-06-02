use crate::error::PredictionMarketError;

use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub market_id: u64,
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    pub creator: Pubkey,
    pub resolver: Pubkey, // Authority that can resolve the market
    pub resolution_time: i64,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
    pub winning_outcome: Option<bool>, // None = unresolved, Some(true) = YES wins, Some(false) = NO wins
    pub total_yes_amount: u64,
    pub total_no_amount: u64,
    pub total_bets: u64,
    pub is_active: bool,
    pub bump: u8,
}

impl Market {
    pub fn is_resolved(&self) -> bool {
        self.winning_outcome.is_some()
    }

    pub fn is_expired(&self) -> bool {
        Clock::get().unwrap().unix_timestamp >= self.resolution_time
    }

    pub fn can_accept_bets(&self) -> bool {
        self.is_active && !self.is_resolved() && !self.is_expired()
    }

    pub fn total_pool(&self) -> u64 {
        self.total_yes_amount + self.total_no_amount
    }

    pub fn calculate_payout(&self, bet_amount: u64, bet_outcome: bool) -> Result<u64> {
        if !self.is_resolved() {
            return Ok(0);
        }

        let winning_outcome = self.winning_outcome.unwrap();
        if bet_outcome != winning_outcome {
            return Ok(0);
        }

        let total_pool = self.total_pool();
        let winning_pool = if winning_outcome {
            self.total_yes_amount
        } else {
            self.total_no_amount
        };

        if winning_pool == 0 {
            return Ok(0);
        }

        // Calculate proportional payout: (bet_amount / winning_pool) * total_pool
        let payout = (bet_amount as u128)
            .checked_mul(total_pool as u128)
            .and_then(|x| x.checked_div(winning_pool as u128))
            .and_then(|x| u64::try_from(x).ok())
            .ok_or(PredictionMarketError::ArithmeticOverflow)?;

        Ok(payout)
    }
}