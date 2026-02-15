use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait,
    start_cheat_caller_address, stop_cheat_caller_address,
    start_cheat_block_timestamp_global, stop_cheat_block_timestamp_global,
};
use starknet::ContractAddress;
use starknet::contract_address_const;
use stark_dca::interfaces::IStarkDCADispatcher;
use stark_dca::interfaces::IStarkDCADispatcherTrait;

fn OWNER() -> ContractAddress {
    contract_address_const::<'OWNER'>()
}

fn EXECUTOR() -> ContractAddress {
    contract_address_const::<'EXECUTOR'>()
}

fn USDT_TOKEN() -> ContractAddress {
    contract_address_const::<'USDT'>()
}

fn ORACLE() -> ContractAddress {
    contract_address_const::<'ORACLE'>()
}

fn USER1() -> ContractAddress {
    contract_address_const::<'USER1'>()
}

fn deploy_contract() -> IStarkDCADispatcher {
    let contract = declare("StarkDCA").unwrap().contract_class();
    let mut calldata: Array<felt252> = array![];

    // constructor args: owner, usdt_token, oracle, executor
    calldata.append(OWNER().into());
    calldata.append(USDT_TOKEN().into());
    calldata.append(ORACLE().into());
    calldata.append(EXECUTOR().into());

    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    IStarkDCADispatcher { contract_address }
}

#[test]
fn test_create_plan() {
    let dca = deploy_contract();

    start_cheat_caller_address(dca.contract_address, USER1());
    start_cheat_block_timestamp_global(1000);

    let plan_id = dca.create_plan(
        100_u256,   // 100 USDT per execution
        10_u32,     // 10 total executions
        86400_u64,  // daily (24h in seconds)
    );

    assert!(plan_id == 1, "First plan should have ID 1");
    assert!(dca.get_plan_count() == 1, "Plan count should be 1");

    let (owner, amount, total, done, interval, next_exec, status) = dca.get_plan(plan_id);
    assert!(owner == USER1(), "Owner mismatch");
    assert!(amount == 100_u256, "Amount mismatch");
    assert!(total == 10_u32, "Total executions mismatch");
    assert!(done == 0_u32, "Should have 0 executions done");
    assert!(interval == 86400_u64, "Interval mismatch");
    assert!(next_exec == 1000 + 86400, "Next execution time wrong");
    assert!(status == 0, "Status should be active (0)");

    stop_cheat_caller_address(dca.contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
fn test_execute_plan() {
    let dca = deploy_contract();

    start_cheat_block_timestamp_global(1000);
    start_cheat_caller_address(dca.contract_address, USER1());

    let plan_id = dca.create_plan(50_u256, 3_u32, 3600_u64);

    stop_cheat_caller_address(dca.contract_address);

    // Fast-forward past the interval
    start_cheat_block_timestamp_global(1000 + 3600);
    start_cheat_caller_address(dca.contract_address, EXECUTOR());

    dca.execute_plan(plan_id);

    let (_, _, _, done, _, _, status) = dca.get_plan(plan_id);
    assert!(done == 1_u32, "Should have 1 execution done");
    assert!(status == 0, "Should still be active");

    stop_cheat_caller_address(dca.contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
fn test_execute_plan_completes() {
    let dca = deploy_contract();

    start_cheat_block_timestamp_global(1000);
    start_cheat_caller_address(dca.contract_address, USER1());

    let plan_id = dca.create_plan(50_u256, 1_u32, 60_u64);

    stop_cheat_caller_address(dca.contract_address);

    start_cheat_block_timestamp_global(1000 + 60);
    start_cheat_caller_address(dca.contract_address, EXECUTOR());

    dca.execute_plan(plan_id);

    let (_, _, _, done, _, _, status) = dca.get_plan(plan_id);
    assert!(done == 1_u32, "Should have 1 execution");
    assert!(status == 2, "Should be completed (2)");

    stop_cheat_caller_address(dca.contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
fn test_cancel_plan() {
    let dca = deploy_contract();

    start_cheat_caller_address(dca.contract_address, USER1());
    start_cheat_block_timestamp_global(1000);

    let plan_id = dca.create_plan(100_u256, 5_u32, 86400_u64);
    dca.cancel_plan(plan_id);

    let (_, _, _, _, _, _, status) = dca.get_plan(plan_id);
    assert!(status == 1, "Status should be cancelled (1)");

    stop_cheat_caller_address(dca.contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic(expected: "Only owner can cancel")]
fn test_cancel_plan_not_owner() {
    let dca = deploy_contract();

    start_cheat_block_timestamp_global(1000);
    start_cheat_caller_address(dca.contract_address, USER1());
    let plan_id = dca.create_plan(100_u256, 5_u32, 86400_u64);
    stop_cheat_caller_address(dca.contract_address);

    // Try to cancel as a different user
    start_cheat_caller_address(dca.contract_address, EXECUTOR());
    dca.cancel_plan(plan_id);
    stop_cheat_caller_address(dca.contract_address);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic(expected: "Only executor can execute plans")]
fn test_execute_plan_not_executor() {
    let dca = deploy_contract();

    start_cheat_block_timestamp_global(1000);
    start_cheat_caller_address(dca.contract_address, USER1());
    let plan_id = dca.create_plan(100_u256, 5_u32, 3600_u64);

    // Try to execute as the plan owner (not executor)
    start_cheat_block_timestamp_global(1000 + 3600);
    dca.execute_plan(plan_id);

    stop_cheat_caller_address(dca.contract_address);
    stop_cheat_block_timestamp_global();
}
