// Mock BTC Token Tests
//
// Coverage:
//   - Constructor validation
//   - Minting (owner, authorized minter, unauthorized)
//   - Transfer (happy path, insufficient balance, zero address)
//   - Approve + TransferFrom (happy path, insufficient allowance)
//   - Set authorized minter (owner only)
//   - Multiple users, edge cases

use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
use starknet::ContractAddress;
use starknet::contract_address_const;
use stark_dca::interfaces::{IERC20Dispatcher, IERC20DispatcherTrait, IMintableDispatcher, IMintableDispatcherTrait};

fn OWNER() -> ContractAddress {
    contract_address_const::<'OWNER'>()
}

fn MINTER() -> ContractAddress {
    contract_address_const::<'MINTER'>()
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

fn deploy_token(name: felt252, symbol: felt252) -> (ContractAddress, IERC20Dispatcher, IMintableDispatcher) {
    let contract = declare("MockBTC").unwrap().contract_class();
    let mut calldata: Array<felt252> = array![];
    calldata.append(OWNER().into());
    calldata.append(name);
    calldata.append(symbol);
    calldata.append(18);
    let (address, _) = contract.deploy(@calldata).unwrap();
    let erc20 = IERC20Dispatcher { contract_address: address };
    let mintable = IMintableDispatcher { contract_address: address };
    (address, erc20, mintable)
}

fn deploy_mbtc() -> (ContractAddress, IERC20Dispatcher, IMintableDispatcher) {
    deploy_token('Mock BTC', 'mBTC')
}

#[test]
fn test_constructor_sets_metadata() {
    let (_, erc20, mintable) = deploy_mbtc();
    assert!(erc20.name() == 'Mock BTC', "wrong name");
    assert!(erc20.symbol() == 'mBTC', "wrong symbol");
    assert!(erc20.decimals() == 18, "wrong decimals");
    assert!(erc20.total_supply() == 0, "wrong supply");
    assert!(mintable.get_owner() == OWNER(), "wrong owner");
}

#[test]
fn test_mint_by_owner() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 1000);
    stop_cheat_caller_address(addr);
    assert!(erc20.balance_of(USER1()) == 1000, "wrong balance");
    assert!(erc20.total_supply() == 1000, "wrong supply");
}

#[test]
fn test_mint_by_authorized_minter() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.set_authorized_minter(MINTER());
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, MINTER());
    mintable.mint(USER1(), 500);
    stop_cheat_caller_address(addr);
    assert!(erc20.balance_of(USER1()) == 500, "wrong balance");
}

#[test]
fn test_mint_multiple_times() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 100);
    mintable.mint(USER1(), 200);
    mintable.mint(USER2(), 300);
    stop_cheat_caller_address(addr);
    assert!(erc20.balance_of(USER1()) == 300, "wrong user1");
    assert!(erc20.balance_of(USER2()) == 300, "wrong user2");
    assert!(erc20.total_supply() == 600, "wrong supply");
}

#[test]
#[should_panic(expected: "NOT_AUTHORIZED_TO_MINT")]
fn test_mint_unauthorized_panics() {
    let (addr, _, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, ATTACKER());
    mintable.mint(USER1(), 1000);
    stop_cheat_caller_address(addr);
}

#[test]
#[should_panic(expected: "MINT_TO_ZERO")]
fn test_mint_to_zero_address_panics() {
    let (addr, _, mintable) = deploy_mbtc();
    let zero = contract_address_const::<0>();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(zero, 1000);
    stop_cheat_caller_address(addr);
}

#[test]
#[should_panic(expected: "MINT_ZERO_AMOUNT")]
fn test_mint_zero_amount_panics() {
    let (addr, _, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 0);
    stop_cheat_caller_address(addr);
}

#[test]
fn test_transfer_happy_path() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 1000);
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, USER1());
    erc20.transfer(USER2(), 400);
    stop_cheat_caller_address(addr);

    assert!(erc20.balance_of(USER1()) == 600, "wrong sender");
    assert!(erc20.balance_of(USER2()) == 400, "wrong recipient");
}

#[test]
#[should_panic(expected: "INSUFFICIENT_BALANCE")]
fn test_transfer_insufficient_balance_panics() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 100);
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, USER1());
    erc20.transfer(USER2(), 200);
    stop_cheat_caller_address(addr);
}

#[test]
#[should_panic(expected: "TRANSFER_ZERO_AMOUNT")]
fn test_transfer_zero_amount_panics() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 100);
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, USER1());
    erc20.transfer(USER2(), 0);
    stop_cheat_caller_address(addr);
}

#[test]
fn test_approve_and_transfer_from() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 1000);
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, USER1());
    erc20.approve(USER2(), 500);
    stop_cheat_caller_address(addr);

    assert!(erc20.allowance(USER1(), USER2()) == 500, "wrong allowance");

    start_cheat_caller_address(addr, USER2());
    erc20.transfer_from(USER1(), USER2(), 300);
    stop_cheat_caller_address(addr);

    assert!(erc20.balance_of(USER1()) == 700, "wrong sender");
    assert!(erc20.balance_of(USER2()) == 300, "wrong recipient");
    assert!(erc20.allowance(USER1(), USER2()) == 200, "wrong remaining");
}

#[test]
#[should_panic(expected: "INSUFFICIENT_ALLOWANCE")]
fn test_transfer_from_insufficient_allowance_panics() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 1000);
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, USER1());
    erc20.approve(USER2(), 100);
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, USER2());
    erc20.transfer_from(USER1(), USER2(), 200);
    stop_cheat_caller_address(addr);
}

#[test]
fn test_set_authorized_minter_by_owner() {
    let (addr, _, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.set_authorized_minter(MINTER());
    stop_cheat_caller_address(addr);
    assert!(mintable.get_authorized_minter() == MINTER(), "wrong minter");
}

#[test]
#[should_panic(expected: "ONLY_OWNER")]
fn test_set_authorized_minter_not_owner_panics() {
    let (addr, _, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, ATTACKER());
    mintable.set_authorized_minter(MINTER());
    stop_cheat_caller_address(addr);
}

#[test]
fn test_multiple_users_independent_balances() {
    let (addr, erc20, mintable) = deploy_mbtc();
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), 1000);
    mintable.mint(USER2(), 2000);
    stop_cheat_caller_address(addr);

    start_cheat_caller_address(addr, USER1());
    erc20.transfer(USER2(), 500);
    stop_cheat_caller_address(addr);

    assert!(erc20.balance_of(USER1()) == 500, "wrong user1");
    assert!(erc20.balance_of(USER2()) == 2500, "wrong user2");
}

#[test]
fn test_mint_large_value() {
    let (addr, erc20, mintable) = deploy_mbtc();
    let large: u256 = 1_000_000_000_000_000_000_000_000_000;
    start_cheat_caller_address(addr, OWNER());
    mintable.mint(USER1(), large);
    stop_cheat_caller_address(addr);
    assert!(erc20.balance_of(USER1()) == large, "wrong large");
    assert!(erc20.total_supply() == large, "wrong supply");
}
