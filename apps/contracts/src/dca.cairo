#[starknet::contract]
pub mod StarkDCA {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess,
        StoragePointerReadAccess, StoragePointerWriteAccess,
    };

    // ─── Storage ─────────────────────────────────────────────

    #[storage]
    struct Storage {
        owner: ContractAddress,
        usdt_token: ContractAddress,
        oracle: ContractAddress,
        executor: ContractAddress,
        plan_count: u64,
        // Plan fields stored individually for simplicity
        plan_owner: Map<u64, ContractAddress>,
        plan_amount: Map<u64, u256>,
        plan_total_executions: Map<u64, u32>,
        plan_executions_done: Map<u64, u32>,
        plan_interval: Map<u64, u64>,
        plan_next_execution: Map<u64, u64>,
        plan_status: Map<u64, u8>, // 0=active, 1=cancelled, 2=completed
    }

    // ─── Constants ───────────────────────────────────────────

    const STATUS_ACTIVE: u8 = 0;
    const STATUS_CANCELLED: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;

    // ─── Events ──────────────────────────────────────────────

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        PlanCreated: PlanCreated,
        PlanExecuted: PlanExecuted,
        PlanCancelled: PlanCancelled,
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
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PlanCancelled {
        #[key]
        pub plan_id: u64,
        pub owner: ContractAddress,
    }

    // ─── Constructor ─────────────────────────────────────────

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        usdt_token: ContractAddress,
        oracle: ContractAddress,
        executor: ContractAddress,
    ) {
        self.owner.write(owner);
        self.usdt_token.write(usdt_token);
        self.oracle.write(oracle);
        self.executor.write(executor);
        self.plan_count.write(0);
    }

    // ─── External ────────────────────────────────────────────

    #[abi(embed_v0)]
    impl StarkDCAImpl of super::super::interfaces::IStarkDCA<ContractState> {
        fn create_plan(
            ref self: ContractState,
            amount_per_execution: u256,
            total_executions: u32,
            interval_seconds: u64,
        ) -> u64 {
            let caller = get_caller_address();
            assert!(amount_per_execution > 0, "Amount must be > 0");
            assert!(total_executions > 0, "Executions must be > 0");
            assert!(interval_seconds >= 60, "Interval too short");

            let plan_id = self.plan_count.read() + 1;
            self.plan_count.write(plan_id);

            let now = get_block_timestamp();

            self.plan_owner.write(plan_id, caller);
            self.plan_amount.write(plan_id, amount_per_execution);
            self.plan_total_executions.write(plan_id, total_executions);
            self.plan_executions_done.write(plan_id, 0);
            self.plan_interval.write(plan_id, interval_seconds);
            self.plan_next_execution.write(plan_id, now + interval_seconds);
            self.plan_status.write(plan_id, STATUS_ACTIVE);

            self.emit(PlanCreated {
                plan_id,
                owner: caller,
                amount_per_execution,
                total_executions,
                interval_seconds,
            });

            plan_id
        }

        fn execute_plan(ref self: ContractState, plan_id: u64) {
            let caller = get_caller_address();
            let executor = self.executor.read();
            assert!(caller == executor, "Only executor can execute plans");

            let status = self.plan_status.read(plan_id);
            assert!(status == STATUS_ACTIVE, "Plan not active");

            let now = get_block_timestamp();
            let next_exec = self.plan_next_execution.read(plan_id);
            assert!(now >= next_exec, "Too early to execute");

            let done = self.plan_executions_done.read(plan_id);
            let total = self.plan_total_executions.read(plan_id);
            assert!(done < total, "All executions completed");

            let amount = self.plan_amount.read(plan_id);
            let new_done = done + 1;
            let interval = self.plan_interval.read(plan_id);

            self.plan_executions_done.write(plan_id, new_done);
            self.plan_next_execution.write(plan_id, now + interval);

            if new_done >= total {
                self.plan_status.write(plan_id, STATUS_COMPLETED);
            }

            // NOTE: In production, this would call the USDT transfer and DEX swap.
            // For hackathon, we emit the event and track state.

            self.emit(PlanExecuted {
                plan_id,
                execution_number: new_done,
                amount_in: amount,
                timestamp: now,
            });
        }

        fn cancel_plan(ref self: ContractState, plan_id: u64) {
            let caller = get_caller_address();
            let plan_owner = self.plan_owner.read(plan_id);
            assert!(caller == plan_owner, "Only owner can cancel");

            let status = self.plan_status.read(plan_id);
            assert!(status == STATUS_ACTIVE, "Plan not active");

            self.plan_status.write(plan_id, STATUS_CANCELLED);

            self.emit(PlanCancelled {
                plan_id,
                owner: caller,
            });
        }

        fn get_plan(
            self: @ContractState,
            plan_id: u64,
        ) -> (ContractAddress, u256, u32, u32, u64, u64, u8) {
            (
                self.plan_owner.read(plan_id),
                self.plan_amount.read(plan_id),
                self.plan_total_executions.read(plan_id),
                self.plan_executions_done.read(plan_id),
                self.plan_interval.read(plan_id),
                self.plan_next_execution.read(plan_id),
                self.plan_status.read(plan_id),
            )
        }

        fn get_plan_count(self: @ContractState) -> u64 {
            self.plan_count.read()
        }
    }
}
