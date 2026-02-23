// ─── StarkDCA Interface Definitions ──────────────────────────
//
// All public trait interfaces for the StarkDCA protocol.
// Each interface generates Dispatcher types for cross-contract calls.
//
// Generated types per interface:
//   - {Name}Dispatcher       (for external calls)
//   - {Name}DispatcherTrait  (trait for dispatcher methods)
//   - {Name}SafeDispatcher   (for fallible external calls)
// ─────────────────────────────────────────────────────────────

use starknet::ContractAddress;

// ─── ERC20 Standard Interface ────────────────────────────────
//
// Minimal ERC20 interface for token interactions.
// Used by DCA engine to interact with USDT and mBTC tokens.
// Follows the standard ERC20 function signatures.

#[starknet::interface]
pub trait IERC20<TContractState> {
    /// Returns the token name as a short string (felt252).
    fn name(self: @TContractState) -> felt252;

    /// Returns the token symbol as a short string (felt252).
    fn symbol(self: @TContractState) -> felt252;

    /// Returns the number of decimal places (typically 18).
    fn decimals(self: @TContractState) -> u8;

    /// Returns the total token supply in existence.
    fn total_supply(self: @TContractState) -> u256;

    /// Returns the token balance of the given account.
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;

    /// Transfers tokens from caller to recipient.
    /// Returns true on success, panics on failure.
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;

    /// Transfers tokens from sender to recipient using allowance.
    /// Caller must have sufficient allowance from sender.
    /// Returns true on success, panics on failure.
    fn transfer_from(
        ref self: TContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;

    /// Approves spender to spend up to `amount` of caller's tokens.
    /// Returns true on success, panics on failure.
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;

    /// Returns the remaining allowance that spender can spend on behalf of owner.
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;
}

// ─── Mintable Token Interface ────────────────────────────────
//
// Extended interface for tokens that support controlled minting.
// The DCA engine is set as authorized_minter to mint mBTC
// when executing DCA plans. Owner can also mint for initial
// distribution and testing.

#[starknet::interface]
pub trait IMintable<TContractState> {
    /// Mints `amount` tokens to the `to` address.
    /// Only callable by owner or authorized_minter.
    /// Panics if caller is unauthorized.
    fn mint(ref self: TContractState, to: ContractAddress, amount: u256);

    /// Sets the authorized minter address.
    /// Only callable by the contract owner.
    /// The DCA engine should be set as the authorized minter.
    fn set_authorized_minter(ref self: TContractState, minter: ContractAddress);

    /// Returns the contract owner address.
    fn get_owner(self: @TContractState) -> ContractAddress;

    /// Returns the authorized minter address.
    fn get_authorized_minter(self: @TContractState) -> ContractAddress;
}

// ─── DCA Engine Interface ────────────────────────────────────
//
// Core interface for the BTC Dollar-Cost Averaging engine.
// Manages USDT deposits, DCA plan lifecycle, and automated
// BTC purchases with mBTC minting.
//
// State Machine: Plans follow Active → Cancelled | Completed
// Financial Flow: Deposit USDT → Create Plan → Execute → Mint mBTC

#[starknet::interface]
pub trait IStarkDCA<TContractState> {
    // ── Deposit & Withdraw ──────────────────────────────

    /// Deposits USDT into the user's internal balance.
    /// Calls USDT.transferFrom(caller, contract, amount).
    /// User must approve this contract to spend their USDT first.
    fn deposit(ref self: TContractState, amount: u256);

    /// Withdraws USDT from the user's internal balance.
    /// Transfers USDT back to the caller.
    /// State update happens before external transfer (reentrancy safety).
    fn withdraw(ref self: TContractState, amount: u256);

    // ── Plan Management ─────────────────────────────────

    /// Creates a new DCA plan for the caller.
    /// Returns the globally unique plan ID.
    /// Does NOT require full balance upfront — balance checked at execution.
    fn create_plan(
        ref self: TContractState,
        amount_per_execution: u256,
        total_executions: u32,
        interval_seconds: u64,
    ) -> u64;

    /// Cancels an active plan. Only the plan owner can cancel.
    /// Transitions plan status from Active to Cancelled.
    fn cancel_plan(ref self: TContractState, plan_id: u64);

    // ── Execution (Executor Only) ───────────────────────

    /// Executes a DCA plan: deducts USDT, calculates BTC amount, mints mBTC.
    /// Only callable by the designated executor (backend automation).
    ///
    /// BTC amount calculation (fixed-point):
    ///   btc_amount = usdt_amount * PRECISION / btc_price
    ///
    /// Order of operations (per reference rules):
    ///   1. Validate all preconditions
    ///   2. Update internal state (balance, plan accounting)
    ///   3. Emit event
    ///   4. External call (mint mBTC)
    fn execute_plan(ref self: TContractState, plan_id: u64, btc_price: u256);

    // ── Admin ───────────────────────────────────────────

    /// Pauses the contract. Only callable by owner.
    /// All deposits, withdrawals, plan creation, and executions are blocked.
    fn pause(ref self: TContractState);

    /// Unpauses the contract. Only callable by owner.
    fn unpause(ref self: TContractState);

    // ── View Functions ──────────────────────────────────

    /// Returns full plan data as a tuple:
    /// (owner, amount_per_execution, total_executions, executions_done,
    ///  interval_seconds, next_execution_timestamp, status,
    ///  total_invested, total_btc_received)
    fn get_plan(
        self: @TContractState, plan_id: u64,
    ) -> (ContractAddress, u256, u32, u32, u64, u64, u8, u256, u256);

    /// Returns the user's internal USDT balance held by this contract.
    fn get_user_balance(self: @TContractState, user: ContractAddress) -> u256;

    /// Returns how many plans the user has created.
    fn get_user_plan_count(self: @TContractState, user: ContractAddress) -> u64;

    /// Returns the total number of plans created across all users.
    fn get_plan_count(self: @TContractState) -> u64;

    /// Returns whether the contract is currently paused.
    fn is_paused(self: @TContractState) -> bool;
}

