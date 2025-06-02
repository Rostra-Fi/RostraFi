use anchor_lang::prelude::*;

#[constant]
pub const MARKET_SEED: &[u8] = b"market";

#[constant]
pub const BET_SEED: &[u8] = b"bet";

#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

#[constant]
pub const TREASURY_SEED: &[u8] = b"treasury";

// Platform fee in basis points (100 = 1%)
pub const PLATFORM_FEE_BPS: u64 = 200; // 2%

// Minimum bet amount (in lamports)
pub const MIN_BET_AMOUNT: u64 = 1_000_000; // 0.001 SOL

// Maximum title length
pub const MAX_TITLE_LENGTH: usize = 100;

// Maximum description length
pub const MAX_DESCRIPTION_LENGTH: usize = 500;