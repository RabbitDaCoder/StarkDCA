// DCA Engine Tests
//
// Coverage:
//   - Deposit / Withdraw
//   - Create plan / Cancel plan
//   - Execute plan with BTC calculation verification
//   - Pause / Unpause
//   - Multiple users
//   - Full lifecycle
//   - Edge cases and access control

use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address, start_cheat_block_timestamp_global, stop_cheat_block_timestamp_global};
use starknet::ContractAddress;
use starknet::contract_address_const;
use stark_dca::interfaces::{IStarkDCADispatcher, IStarkDCADispatcherTrait, IERC20Dispatcher, IERC20DispatcherTrait, IMintableDispatcher, IMintableDispatcherTrait};

fn OWNER() -> ContractAddress {
    contract_address_const::<'OWNER'>()
}

fn EXECUTOR() -> ContractAddress {
    contract_address_const::<'EXECUTOR'>()
}

fn USER1() -> ContractAddress {
    contract_address_const::<'USER1'>()
}

fn USER2() -> ContractAddress {
    contract_address_const::<'USER2'>()
}

fn ATTACKER() -> ContractAddress {
    contract_address_const::<'ATTACKER'>()
}

const PRECISION: u256 = 1_000_000_000_000_000_000;
const BTC_PRICE_50K: u256 = 50_000_000_000_000_000_000_000;
const BTC_PRICE_100K: u256 = 100_000_000_000_000_000_000_000;
const USDT_1000: u256 = 1_000_000_000_000_000_000_000;
const USDT_100: u256 = 100_000_000_000_000_000_000;
const USDT_50: u256 = 50_000_000_000_000_000_000;
const MAX_APPROVE: u256 = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

fn deploy_mock_token(name: felt252, symbol: felt252) -> (ContractAddress, IERC20Dispatcher, IMintableDispatcher) {
    let contract = declare("MockBTC").unwrap().contract_class();
    let mut calldata: Array<felt252> = array![];
    calldata.append(OWNER().into());
    calldata.append(name);
    calldata.append(symbol);
    calldata.append(18);
    let (address, _) = contract.deploy(@calldata).unwrap();
    (address, IERC20Dispatcher { contract_address: address }, IMintableDispatcher { contract_address: address })
}

fn deploy_dca(usdt_addr: ContractAddress, mbtc_addr: ContractAddress) -> (ContractAddress, IStarkDCADispatcher) {
    let contract = declare("DCAEngine").unwrap().contract_class();
    let mut calldata: Array<felt252> = array![];
    calldata.append(OWNER().into());
    calldata.append(usdt_addr.into());
    calldata.append(mbtc_addr.into());
    calldata.append(EXECUTOR().into());
    let (address, _) = contract.deploy(@calldata).unwrap();
    (address, IStarkDCADispatcher { contract_address: address })
}

fn full_setup() -> (
    ContractAddress, IERC20Dispatcher, IMintableDispatcher,
    ContractAddress, IERC20Dispatcher, IMintableDispatcher,
    ContractAddress, IStarkDCADispatcher,
) {
    let (usdt_addr, usdt_erc20, usdt_mint) = deploy_mock_token('Mock USDT', 'mUSDT');
    let (mbtc_addr, mbtc_erc20, mbtc_mint) = deploy_mock_token('Mock BTC', 'mBTC');
    let (dca_addr, dca) = deploy_dca(usdt_addr, mbtc_addr);

    start_cheat_caller_address(mbtc_addr, OWNER());
    mbtc_mint.set_authorized_minter(dca_addr);
    stop_cheat_caller_address(mbtc_addr);

    start_cheat_caller_address(usdt_addr, OWNER());
    usdt_mint.mint(USER1(), USDT_1000);
    usdt_mint.mint(USER2(), USDT_1000);
    stop_cheat_caller_address(usdt_addr);

    start_cheat_caller_address(usdt_addr, USER1());
    usdt_erc20.approve(dca_addr, MAX_APPROVE);
    stop_cheat_caller_address(usdt_addr);

    start_cheat_caller_address(usdt_addr, USER2());
    usdt_erc20.approve(dca_addr, MAX_APPROVE);
    stop_cheat_caller_address(usdt_addr);

    (usdt_addr, usdt_erc20, usdt_mint, mbtc_addr, mbtc_erc20, mbtc_mint, dca_addr, dca)
}

#[test]
fn test_deposit_happy_path() {
    let (_, usdt_erc20, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_100);
    stop_cheat_caller_address(dca_addr);

    assert!(dca.get_user_balance(USER1()) == USDT_100, "wrong balance");
    assert!(usdt_erc20.balance_of(USER1()) == USDT_1000 - USDT_100, "wrong usdt");
}

#[test]
fn test_deposit_multiple() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_100);
    dca.deposit(USDT_100);
    stop_cheat_caller_address(dca_addr);
    assert!(dca.get_user_balance(USER1()) == USDT_100 + USDT_100, "wrong balance");
}

#[test]
#[should_panic(expected: "ZERO_DEPOSIT_AMOUNT")]
fn test_deposit_zero_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(0);
    stop_cheat_caller_address(dca_addr);
}

#[test]
fn test_withdraw_happy_path() {
    let (_, usdt_erc20, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_100);
    dca.withdraw(USDT_50);
    stop_cheat_caller_address(dca_addr);

    assert!(dca.get_user_balance(USER1()) == USDT_50, "wrong internal");
    assert!(usdt_erc20.balance_of(USER1()) == USDT_1000 - USDT_50, "wrong usdt");
}

#[test]
#[should_panic(expected: "INSUFFICIENT_BALANCE")]
fn test_withdraw_exceeds_balance_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_50);
    dca.withdraw(USDT_100);
    stop_cheat_caller_address(dca_addr);
}

#[test]
#[should_panic(expected: "ZERO_WITHDRAWAL_AMOUNT")]
fn test_withdraw_zero_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_100);
    dca.withdraw(0);
    stop_cheat_caller_address(dca_addr);
}

#[test]
fn test_create_plan_happy_path() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    let plan_id = dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    assert!(plan_id == 1, "wrong plan_id");
    assert!(dca.get_plan_count() == 1, "wrong count");
    assert!(dca.get_user_plan_count(USER1()) == 1, "wrong user count");

    let (owner, amount, total, done, interval, _, status, invested, btc_received) = dca.get_plan(1);
    assert!(owner == USER1(), "wrong owner");
    assert!(amount == USDT_100, "wrong amount");
    assert!(total == 5, "wrong total");
    assert!(done == 0, "wrong done");
    assert!(interval == 3600, "wrong interval");
    assert!(status == 0, "wrong status");
    assert!(invested == 0, "wrong invested");
    assert!(btc_received == 0, "wrong btc");
}

#[test]
fn test_create_multiple_plans() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    let id1 = dca.create_plan(USDT_100, 5, 3600);
    let id2 = dca.create_plan(USDT_50, 10, 7200);
    stop_cheat_caller_address(dca_addr);
    assert!(id1 == 1, "wrong id1");
    assert!(id2 == 2, "wrong id2");
    assert!(dca.get_user_plan_count(USER1()) == 2, "wrong user count");
}

#[test]
#[should_panic(expected: "ZERO_AMOUNT")]
fn test_create_plan_zero_amount_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.create_plan(0, 5, 3600);
    stop_cheat_caller_address(dca_addr);
}

#[test]
#[should_panic(expected: "ZERO_EXECUTIONS")]
fn test_create_plan_zero_executions_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.create_plan(USDT_100, 0, 3600);
    stop_cheat_caller_address(dca_addr);
}

#[test]
#[should_panic(expected: "INTERVAL_TOO_SHORT")]
fn test_create_plan_interval_too_short_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.create_plan(USDT_100, 5, 30);
    stop_cheat_caller_address(dca_addr);
}

#[test]
fn test_cancel_plan_happy_path() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.create_plan(USDT_100, 5, 3600);
    dca.cancel_plan(1);
    stop_cheat_caller_address(dca_addr);
    let (_, _, _, _, _, _, status, _, _) = dca.get_plan(1);
    assert!(status == 1, "not cancelled");
}

#[test]
#[should_panic(expected: "ONLY_PLAN_OWNER")]
fn test_cancel_plan_not_owner_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);
    start_cheat_caller_address(dca_addr, USER2());
    dca.cancel_plan(1);
    stop_cheat_caller_address(dca_addr);
}

#[test]
#[should_panic(expected: "PLAN_NOT_ACTIVE")]
fn test_cancel_already_cancelled_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.create_plan(USDT_100, 5, 3600);
    dca.cancel_plan(1);
    dca.cancel_plan(1);
    stop_cheat_caller_address(dca_addr);
}

#[test]
fn test_execute_plan_happy_path() {
    let (_, _, _, _, mbtc_erc20, _, dca_addr, dca) = full_setup();

    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    // 100 USDT at $50K = 100 * 1e18 / 50000e18 = 0.002 BTC = 2e15
    let expected_btc: u256 = 2_000_000_000_000_000;
    assert!(mbtc_erc20.balance_of(USER1()) == expected_btc, "wrong btc");
    assert!(dca.get_user_balance(USER1()) == USDT_1000 - USDT_100, "wrong usdt balance");

    let (_, _, _, done, _, _, status, invested, btc_received) = dca.get_plan(1);
    assert!(done == 1, "wrong done");
    assert!(status == 0, "should still be active");
    assert!(invested == USDT_100, "wrong invested");
    assert!(btc_received == expected_btc, "wrong btc_received");
}

#[test]
fn test_execute_plan_multiple_executions() {
    let (_, _, _, _, mbtc_erc20, _, dca_addr, dca) = full_setup();

    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_100, 3, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    start_cheat_block_timestamp_global(14400);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    start_cheat_block_timestamp_global(21600);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    let expected_btc_per: u256 = 2_000_000_000_000_000;
    let expected_total_btc = expected_btc_per * 3;
    assert!(mbtc_erc20.balance_of(USER1()) == expected_total_btc, "wrong total btc");

    let (_, _, _, done, _, _, status, invested, btc_received) = dca.get_plan(1);
    assert!(done == 3, "wrong done");
    assert!(status == 2, "should be completed");
    assert!(invested == USDT_100 * 3, "wrong invested");
    assert!(btc_received == expected_total_btc, "wrong btc");
}

#[test]
fn test_btc_calculation_at_100k() {
    let (_, _, _, _, mbtc_erc20, _, dca_addr, dca) = full_setup();

    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_100K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    let expected_btc: u256 = 1_000_000_000_000_000;
    assert!(mbtc_erc20.balance_of(USER1()) == expected_btc, "wrong btc at 100k");
}

#[test]
fn test_btc_calculation_small_amount() {
    let (_, _, _, _, mbtc_erc20, _, dca_addr, dca) = full_setup();

    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    let usdt_10: u256 = 10_000_000_000_000_000_000;
    dca.create_plan(usdt_10, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    let expected_btc: u256 = 200_000_000_000_000;
    assert!(mbtc_erc20.balance_of(USER1()) == expected_btc, "wrong small btc");
}

#[test]
#[should_panic(expected: "ONLY_EXECUTOR")]
fn test_execute_plan_not_executor_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, ATTACKER());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic(expected: "TOO_EARLY_TO_EXECUTE")]
fn test_execute_plan_too_early_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(100);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic(expected: "INSUFFICIENT_USER_BALANCE")]
fn test_execute_plan_insufficient_balance_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_50);
    dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic(expected: "PLAN_NOT_ACTIVE")]
fn test_execute_cancelled_plan_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_100, 5, 3600);
    dca.cancel_plan(1);
    stop_cheat_caller_address(dca_addr);

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();
}

#[test]
fn test_pause_unpause() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    assert!(!dca.is_paused(), "should not be paused");

    start_cheat_caller_address(dca_addr, OWNER());
    dca.pause();
    stop_cheat_caller_address(dca_addr);
    assert!(dca.is_paused(), "should be paused");

    start_cheat_caller_address(dca_addr, OWNER());
    dca.unpause();
    stop_cheat_caller_address(dca_addr);
    assert!(!dca.is_paused(), "should be unpaused");
}

#[test]
#[should_panic(expected: "ONLY_OWNER")]
fn test_pause_not_owner_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, ATTACKER());
    dca.pause();
    stop_cheat_caller_address(dca_addr);
}

#[test]
#[should_panic(expected: "CONTRACT_PAUSED")]
fn test_deposit_when_paused_panics() {
    let (_, _, _, _, _, _, dca_addr, dca) = full_setup();
    start_cheat_caller_address(dca_addr, OWNER());
    dca.pause();
    stop_cheat_caller_address(dca_addr);

    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_100);
    stop_cheat_caller_address(dca_addr);
}

#[test]
fn test_two_users_independent_plans() {
    let (_, _, _, _, mbtc_erc20, _, dca_addr, dca) = full_setup();

    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_100, 5, 3600);
    stop_cheat_caller_address(dca_addr);

    start_cheat_caller_address(dca_addr, USER2());
    dca.deposit(USDT_1000);
    dca.create_plan(USDT_50, 10, 7200);
    stop_cheat_caller_address(dca_addr);

    assert!(dca.get_plan_count() == 2, "wrong total plans");

    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    start_cheat_block_timestamp_global(14400);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(2, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();

    let user1_btc: u256 = 2_000_000_000_000_000;
    let user2_btc: u256 = 1_000_000_000_000_000;
    assert!(mbtc_erc20.balance_of(USER1()) == user1_btc, "wrong user1 btc");
    assert!(mbtc_erc20.balance_of(USER2()) == user2_btc, "wrong user2 btc");
}

#[test]
fn test_full_lifecycle() {
    let (_, usdt_erc20, _, _, mbtc_erc20, _, dca_addr, dca) = full_setup();

    // 1. Deposit
    start_cheat_caller_address(dca_addr, USER1());
    dca.deposit(USDT_1000);
    stop_cheat_caller_address(dca_addr);
    assert!(dca.get_user_balance(USER1()) == USDT_1000, "deposit failed");

    // 2. Create plan
    start_cheat_caller_address(dca_addr, USER1());
    let plan_id = dca.create_plan(USDT_100, 3, 3600);
    stop_cheat_caller_address(dca_addr);
    assert!(plan_id == 1, "wrong plan id");

    // 3. Execute at $50K
    start_cheat_block_timestamp_global(7200);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();
    let btc_at_50k: u256 = 2_000_000_000_000_000;
    assert!(mbtc_erc20.balance_of(USER1()) == btc_at_50k, "exec 1 btc wrong");

    // 4. Execute at $100K
    start_cheat_block_timestamp_global(14400);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_100K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();
    let btc_at_100k: u256 = 1_000_000_000_000_000;
    assert!(mbtc_erc20.balance_of(USER1()) == btc_at_50k + btc_at_100k, "exec 2 btc wrong");

    // 5. Execute at $50K again (final)
    start_cheat_block_timestamp_global(21600);
    start_cheat_caller_address(dca_addr, EXECUTOR());
    dca.execute_plan(1, BTC_PRICE_50K);
    stop_cheat_caller_address(dca_addr);
    stop_cheat_block_timestamp_global();
    let total_btc = btc_at_50k + btc_at_100k + btc_at_50k;
    assert!(mbtc_erc20.balance_of(USER1()) == total_btc, "final btc wrong");

    let (_, _, _, done, _, _, status, invested, btc_received) = dca.get_plan(1);
    assert!(done == 3, "not done");
    assert!(status == 2, "not completed");
    assert!(invested == USDT_100 * 3, "wrong invested");
    assert!(btc_received == total_btc, "wrong btc_received");

    // 6. Withdraw remaining
    let remaining = dca.get_user_balance(USER1());
    assert!(remaining == USDT_1000 - (USDT_100 * 3), "wrong remaining");

    start_cheat_caller_address(dca_addr, USER1());
    dca.withdraw(remaining);
    stop_cheat_caller_address(dca_addr);
    assert!(dca.get_user_balance(USER1()) == 0, "not zeroed");
    assert!(usdt_erc20.balance_of(USER1()) == remaining, "wrong usdt returned");
}

