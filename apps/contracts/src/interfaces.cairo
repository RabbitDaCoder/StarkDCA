use starknet::ContractAddress;

// ─── Oracle Interface ────────────────────────────────────────

#[starknet::interface]
pub trait IPriceOracle<TContractState> {
    fn get_btc_price(self: @TContractState) -> u256;
}

// ─── ERC20 Interface (minimal) ───────────────────────────────

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn transfer_from(
        ref self: TContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
}

// ─── DCA Contract Interface ─────────────────────────────────

#[starknet::interface]
pub trait IStarkDCA<TContractState> {
    fn create_plan(
        ref self: TContractState,
        amount_per_execution: u256,
        total_executions: u32,
        interval_seconds: u64,
    ) -> u64;

    fn execute_plan(ref self: TContractState, plan_id: u64);

    fn cancel_plan(ref self: TContractState, plan_id: u64);

    fn get_plan(self: @TContractState, plan_id: u64) -> (ContractAddress, u256, u32, u32, u64, u64, u8);

    fn get_plan_count(self: @TContractState) -> u64;
}
