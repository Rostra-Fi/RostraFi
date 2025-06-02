use anchor_lang::prelude::*;

#[error_code]
pub enum PredictionMarketError {
    #[msg("Market has already been resolved")]
    MarketAlreadyResolved,
    
    #[msg("Market resolution time has not passed")]
    MarketNotExpired,
    
    #[msg("Market has expired and cannot accept new bets")]
    MarketExpired,
    
    #[msg("Bet amount is below minimum required")]
    BetAmountTooLow,
    
    #[msg("Market is not resolved yet")]
    MarketNotResolved,
    
    #[msg("User has no winnings to claim")]
    NoWinningsToClaim,
    
    #[msg("User already has a bet on this market")]
    UserAlreadyBet,
    
    #[msg("Unauthorized to resolve market")]
    UnauthorizedResolver,
    
    #[msg("Title too long")]
    TitleTooLong,
    
    #[msg("Description too long")]
    DescriptionTooLong,
    
    #[msg("Invalid resolution time")]
    InvalidResolutionTime,
    
    #[msg("Market is still active")]
    MarketStillActive,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("User bet on losing outcome")]
    UserBetOnLosingOutcome,
}