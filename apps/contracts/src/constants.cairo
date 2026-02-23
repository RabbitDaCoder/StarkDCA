// ─── StarkDCA Constants ──────────────────────────────────────
//
// All numeric constants used in financial calculations and
// contract logic. No magic numbers in contract code.
//
// Rule: Every named value used in financial math or state
// transitions must be defined here with documentation.
// ─────────────────────────────────────────────────────────────

// ─── Plan Status Codes ───────────────────────────────────────
// Explicit finite state machine: Active → Cancelled or Completed.
// No implicit transitions. Status is always one of these values.
pub const STATUS_ACTIVE: u8 = 0;
pub const STATUS_CANCELLED: u8 = 1;
pub const STATUS_COMPLETED: u8 = 2;

// ─── Plan Limits ─────────────────────────────────────────────
/// Minimum interval between plan executions: 60 seconds.
/// Prevents spam and excessive gas consumption.
pub const MIN_INTERVAL_SECONDS: u64 = 60;

/// Maximum number of executions per plan: 10,000.
/// Safety cap to prevent unbounded plan lifecycles.
pub const MAX_EXECUTIONS: u32 = 10_000;

// ─── Token Configuration ─────────────────────────────────────
/// Standard token decimal precision: 18 digits.
/// Both USDT (mock) and mBTC use 18 decimals on testnet.
pub const TOKEN_DECIMALS: u8 = 18;

// ─── Financial Constants (u256) ──────────────────────────────
// Note: u256 is a compound type (low: u128, high: u128) and
// cannot be defined as `const` in Cairo. Defined as pure
// functions that return constant values.

/// Fixed-point precision scaling factor: 1e18 (10^18).
///
/// All BTC price values and financial calculations use this base.
/// Example: BTC at $50,000 → represented as 50_000 * 10^18.
///
/// Used in: btc_amount = usdt_amount * PRECISION / btc_price
pub fn precision() -> u256 {
    1_000_000_000_000_000_000
}

/// Minimum valid BTC price: $1 (1 * 10^18).
///
/// Protects against division by near-zero values in the
/// BTC amount calculation. Any price below this is rejected.
pub fn min_btc_price() -> u256 {
    1_000_000_000_000_000_000
}

/// Maximum valid BTC price: $10,000,000 (10^7 * 10^18 = 10^25).
///
/// Overflow protection for the multiplication step:
///   amount * PRECISION must remain within u256 bounds.
/// With max reasonable amount of ~10^38 (10^20 tokens * 10^18 decimals)
/// and PRECISION of 10^18, the product is ~10^56, well within
/// u256 max of ~1.15 * 10^77.
pub fn max_btc_price() -> u256 {
    10_000_000_000_000_000_000_000_000
}
