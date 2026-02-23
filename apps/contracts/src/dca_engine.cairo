// DCA Engine Contract
//
// BTC Dollar-Cost Averaging automation engine for Starknet.
//
// Architecture:
//   - Users deposit USDT into internal balance
//   - Users create DCA plans (amount, executions, interval)
//   - Backend executor calls execute_plan with current BTC price
//   - Engine deducts USDT, calculates mBTC amount, mints to user
//
// Financial Math (fixed-point, 1e18 precision):
//   btc_amount = usdt_amount * PRECISION / btc_price
//   Rounding: integer division truncates (rounds down, favors protocol)
//
// State Machine: Plan { Active -> Cancelled | Completed }
//
// Security:
//   - Validate first, mutate last
//   - State updates before external calls (reentrancy safety)
//   - All arithmetic checked for overflow
//   - No silent failures -- assert on every invalid condition
//
// Follows: reference1.txt rules in full.

#[starknet::contract]
pub mod DCAEngine {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;
    use starknet::get_contract_address;
    use starknet::contract_address_const;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess};

    use super::super::interfaces::{IERC20Dispatcher, IERC20DispatcherTrait, IMintableDispatcher, IMintableDispatcherTrait};
    use super::super::constants;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        paused: bool,
        usdt_token: ContractAddress,
        mbtc_token: ContractAddress,
        executor: ContractAddress,
        user_usdt_balance: Map<ContractAddress, u256>,
        plan_count: u64,
        user_plan_count: Map<ContractAddress, u64>,
        plan_owner: Map<u64, ContractAddress>,
        plan_amount: Map<u64, u256>,
        plan_total_executions: Map<u64, u32>,
        plan_executions_done: Map<u64, u32>,
        plan_interval: Map<u64, u64>,
        plan_next_execution: Map<u64, u64>,
        plan_status: Map<u64, u8>,
        plan_total_invested: Map<u64, u256>,
        plan_total_btc_received: Map<u64, u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        DepositMade: DepositMade,
        WithdrawalMade: WithdrawalMade,
        PlanCreated: PlanCreated,
        PlanExecuted: PlanExecuted,
        PlanCancelled: PlanCancelled,
        ContractPaused: ContractPaused,
        ContractUnpaused: ContractUnpaused,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DepositMade {
        #[key]
        pub user: ContractAddress,
        pub amount: u256,
        pub new_balance: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawalMade {
        #[key]
        pub user: ContractAddress,
        pub amount: u256,
        pub new_balance: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PlanCreated {
        #[key]
        pub plan_id: u64,
        pub owner: ContractAddress,
        pub amount_per_execution: u256,
        pub total_executions: u32,
        pub interval_seconds: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PlanExecuted {
        #[key]
        pub plan_id: u64,
        pub execution_number: u32,
        pub amount_in: u256,
        pub btc_out: u256,
        pub btc_price: u256,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PlanCancelled {
        #[key]
        pub plan_id: u64,
        pub owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ContractPaused {
        pub by: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ContractUnpaused {
        pub by: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        usdt_token: ContractAddress,
        mbtc_token: ContractAddress,
        executor: ContractAddress,
    ) {
        let zero = contract_address_const::<0>();
        assert!(owner != zero, "OWNER_IS_ZERO");
        assert!(usdt_token != zero, "USDT_TOKEN_IS_ZERO");
        assert!(mbtc_token != zero, "MBTC_TOKEN_IS_ZERO");
        assert!(executor != zero, "EXECUTOR_IS_ZERO");

        self.owner.write(owner);
        self.usdt_token.write(usdt_token);
        self.mbtc_token.write(mbtc_token);
        self.executor.write(executor);
        self.paused.write(false);
        self.plan_count.write(0);
    }

    #[abi(embed_v0)]
    impl StarkDCAImpl of super::super::interfaces::IStarkDCA<ContractState> {
        fn deposit(ref self: ContractState, amount: u256) {
            self._assert_not_paused();
            let caller = get_caller_address();
            let zero = contract_address_const::<0>();
            assert!(caller != zero, "INVALID_CALLER");
            assert!(amount > 0, "ZERO_DEPOSIT_AMOUNT");

            let usdt = IERC20Dispatcher { contract_address: self.usdt_token.read() };
            let this_contract = get_contract_address();
            let success = usdt.transfer_from(caller, this_contract, amount);
            assert!(success, "USDT_TRANSFER_FAILED");

            let current_balance = self.user_usdt_balance.read(caller);
            let new_balance = current_balance + amount;
            self.user_usdt_balance.write(caller, new_balance);
            self.emit(DepositMade { user: caller, amount, new_balance });
        }

        fn withdraw(ref self: ContractState, amount: u256) {
            self._assert_not_paused();
            let caller = get_caller_address();
            let zero = contract_address_const::<0>();
            assert!(caller != zero, "INVALID_CALLER");
            assert!(amount > 0, "ZERO_WITHDRAWAL_AMOUNT");

            let current_balance = self.user_usdt_balance.read(caller);
            assert!(current_balance >= amount, "INSUFFICIENT_BALANCE");

            let new_balance = current_balance - amount;
            self.user_usdt_balance.write(caller, new_balance);
            self.emit(WithdrawalMade { user: caller, amount, new_balance });

            let usdt = IERC20Dispatcher { contract_address: self.usdt_token.read() };
            let success = usdt.transfer(caller, amount);
            assert!(success, "USDT_TRANSFER_FAILED");
        }

        fn create_plan(
            ref self: ContractState,
            amount_per_execution: u256,
            total_executions: u32,
            interval_seconds: u64,
        ) -> u64 {
            self._assert_not_paused();
            let caller = get_caller_address();
            let zero = contract_address_const::<0>();
            assert!(caller != zero, "INVALID_CALLER");
            assert!(amount_per_execution > 0, "ZERO_AMOUNT");
            assert!(total_executions > 0, "ZERO_EXECUTIONS");
            assert!(total_executions <= constants::MAX_EXECUTIONS, "EXCEEDS_MAX_EXECUTIONS");
            assert!(interval_seconds >= constants::MIN_INTERVAL_SECONDS, "INTERVAL_TOO_SHORT");

            let plan_id = self.plan_count.read() + 1;
            let now = get_block_timestamp();

            self.plan_count.write(plan_id);
            self.plan_owner.write(plan_id, caller);
            self.plan_amount.write(plan_id, amount_per_execution);
            self.plan_total_executions.write(plan_id, total_executions);
            self.plan_executions_done.write(plan_id, 0);
            self.plan_interval.write(plan_id, interval_seconds);
            self.plan_next_execution.write(plan_id, now + interval_seconds);
            self.plan_status.write(plan_id, constants::STATUS_ACTIVE);
            self.plan_total_invested.write(plan_id, 0);
            self.plan_total_btc_received.write(plan_id, 0);

            let user_count = self.user_plan_count.read(caller);
            self.user_plan_count.write(caller, user_count + 1);

            self.emit(PlanCreated {
                plan_id,
                owner: caller,
                amount_per_execution,
                total_executions,
                interval_seconds,
            });

            plan_id
        }

        fn cancel_plan(ref self: ContractState, plan_id: u64) {
            let caller = get_caller_address();
            let plan_owner = self.plan_owner.read(plan_id);
            assert!(caller == plan_owner, "ONLY_PLAN_OWNER");

            let status = self.plan_status.read(plan_id);
            assert!(status == constants::STATUS_ACTIVE, "PLAN_NOT_ACTIVE");

            self.plan_status.write(plan_id, constants::STATUS_CANCELLED);
            self.emit(PlanCancelled { plan_id, owner: caller });
        }

        fn execute_plan(ref self: ContractState, plan_id: u64, btc_price: u256) {
            self._assert_not_paused();
            let caller = get_caller_address();
            let executor = self.executor.read();
            assert!(caller == executor, "ONLY_EXECUTOR");

            let min_price = constants::min_btc_price();
            let max_price = constants::max_btc_price();
            assert!(btc_price >= min_price, "BTC_PRICE_TOO_LOW");
            assert!(btc_price <= max_price, "BTC_PRICE_TOO_HIGH");

            let status = self.plan_status.read(plan_id);
            assert!(status == constants::STATUS_ACTIVE, "PLAN_NOT_ACTIVE");

            let now = get_block_timestamp();
            let next_exec = self.plan_next_execution.read(plan_id);
            assert!(now >= next_exec, "TOO_EARLY_TO_EXECUTE");

            let done = self.plan_executions_done.read(plan_id);
            let total = self.plan_total_executions.read(plan_id);
            assert!(done < total, "ALL_EXECUTIONS_COMPLETED");

            let amount = self.plan_amount.read(plan_id);
            let plan_owner = self.plan_owner.read(plan_id);
            let user_balance = self.user_usdt_balance.read(plan_owner);
            assert!(user_balance >= amount, "INSUFFICIENT_USER_BALANCE");

            // btc_amount = usdt_amount * PRECISION / btc_price
            // Multiply BEFORE divide to maintain precision
            let precision = constants::precision();
            let btc_amount = (amount * precision) / btc_price;
            assert!(btc_amount > 0, "BTC_AMOUNT_ROUNDS_TO_ZERO");

            let new_user_balance = user_balance - amount;
            self.user_usdt_balance.write(plan_owner, new_user_balance);

            let new_done = done + 1;
            let interval = self.plan_interval.read(plan_id);
            self.plan_executions_done.write(plan_id, new_done);
            self.plan_next_execution.write(plan_id, now + interval);

            let prev_invested = self.plan_total_invested.read(plan_id);
            self.plan_total_invested.write(plan_id, prev_invested + amount);

            let prev_btc = self.plan_total_btc_received.read(plan_id);
            self.plan_total_btc_received.write(plan_id, prev_btc + btc_amount);

            if new_done >= total {
                self.plan_status.write(plan_id, constants::STATUS_COMPLETED);
            }

            self.emit(PlanExecuted {
                plan_id,
                execution_number: new_done,
                amount_in: amount,
                btc_out: btc_amount,
                btc_price,
                timestamp: now,
            });

            let mbtc = IMintableDispatcher { contract_address: self.mbtc_token.read() };
            mbtc.mint(plan_owner, btc_amount);
        }

        fn pause(ref self: ContractState) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "ONLY_OWNER");
            assert!(!self.paused.read(), "ALREADY_PAUSED");
            self.paused.write(true);
            self.emit(ContractPaused { by: caller });
        }

        fn unpause(ref self: ContractState) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "ONLY_OWNER");
            assert!(self.paused.read(), "NOT_PAUSED");
            self.paused.write(false);
            self.emit(ContractUnpaused { by: caller });
        }

        fn get_plan(
            self: @ContractState, plan_id: u64,
        ) -> (ContractAddress, u256, u32, u32, u64, u64, u8, u256, u256) {
            (
                self.plan_owner.read(plan_id),
                self.plan_amount.read(plan_id),
                self.plan_total_executions.read(plan_id),
                self.plan_executions_done.read(plan_id),
                self.plan_interval.read(plan_id),
                self.plan_next_execution.read(plan_id),
                self.plan_status.read(plan_id),
                self.plan_total_invested.read(plan_id),
                self.plan_total_btc_received.read(plan_id),
            )
        }

        fn get_user_balance(self: @ContractState, user: ContractAddress) -> u256 {
            self.user_usdt_balance.read(user)
        }

        fn get_user_plan_count(self: @ContractState, user: ContractAddress) -> u64 {
            self.user_plan_count.read(user)
        }

        fn get_plan_count(self: @ContractState) -> u64 {
            self.plan_count.read()
        }

        fn is_paused(self: @ContractState) -> bool {
            self.paused.read()
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _assert_not_paused(self: @ContractState) {
            assert!(!self.paused.read(), "CONTRACT_PAUSED");
        }
    }
}
