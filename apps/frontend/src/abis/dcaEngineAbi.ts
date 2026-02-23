/**
 * DCA Engine contract ABI — extracted from compiled Sierra JSON.
 * Contract: stark_dca::dca_engine::DCAEngine
 */
export const dcaEngineAbi = [
  {
    type: 'impl',
    name: 'StarkDCAImpl',
    interface_name: 'stark_dca::interfaces::IStarkDCA',
  },
  {
    type: 'struct',
    name: 'core::integer::u256',
    members: [
      { name: 'low', type: 'core::integer::u128' },
      { name: 'high', type: 'core::integer::u128' },
    ],
  },
  {
    type: 'enum',
    name: 'core::bool',
    variants: [
      { name: 'False', type: '()' },
      { name: 'True', type: '()' },
    ],
  },
  {
    type: 'interface',
    name: 'stark_dca::interfaces::IStarkDCA',
    items: [
      {
        type: 'function',
        name: 'deposit',
        inputs: [{ name: 'amount', type: 'core::integer::u256' }],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'withdraw',
        inputs: [{ name: 'amount', type: 'core::integer::u256' }],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'create_plan',
        inputs: [
          { name: 'amount_per_execution', type: 'core::integer::u256' },
          { name: 'total_executions', type: 'core::integer::u32' },
          { name: 'interval_seconds', type: 'core::integer::u64' },
        ],
        outputs: [{ type: 'core::integer::u64' }],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'cancel_plan',
        inputs: [{ name: 'plan_id', type: 'core::integer::u64' }],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'execute_plan',
        inputs: [
          { name: 'plan_id', type: 'core::integer::u64' },
          { name: 'btc_price', type: 'core::integer::u256' },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'pause',
        inputs: [],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'unpause',
        inputs: [],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'get_plan',
        inputs: [{ name: 'plan_id', type: 'core::integer::u64' }],
        outputs: [
          {
            type: '(core::starknet::contract_address::ContractAddress, core::integer::u256, core::integer::u32, core::integer::u32, core::integer::u64, core::integer::u64, core::integer::u8, core::integer::u256, core::integer::u256)',
          },
        ],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_user_balance',
        inputs: [
          {
            name: 'user',
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_user_plan_count',
        inputs: [
          {
            name: 'user',
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
        outputs: [{ type: 'core::integer::u64' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_plan_count',
        inputs: [],
        outputs: [{ type: 'core::integer::u64' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'is_paused',
        inputs: [],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'view',
      },
    ],
  },
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [
      {
        name: 'owner',
        type: 'core::starknet::contract_address::ContractAddress',
      },
      {
        name: 'usdt_token',
        type: 'core::starknet::contract_address::ContractAddress',
      },
      {
        name: 'mbtc_token',
        type: 'core::starknet::contract_address::ContractAddress',
      },
      {
        name: 'executor',
        type: 'core::starknet::contract_address::ContractAddress',
      },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::DepositMade',
    kind: 'struct',
    members: [
      {
        name: 'user',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key',
      },
      { name: 'amount', type: 'core::integer::u256', kind: 'data' },
      { name: 'new_balance', type: 'core::integer::u256', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::WithdrawalMade',
    kind: 'struct',
    members: [
      {
        name: 'user',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key',
      },
      { name: 'amount', type: 'core::integer::u256', kind: 'data' },
      { name: 'new_balance', type: 'core::integer::u256', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::PlanCreated',
    kind: 'struct',
    members: [
      { name: 'plan_id', type: 'core::integer::u64', kind: 'key' },
      {
        name: 'owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
      {
        name: 'amount_per_execution',
        type: 'core::integer::u256',
        kind: 'data',
      },
      { name: 'total_executions', type: 'core::integer::u32', kind: 'data' },
      { name: 'interval_seconds', type: 'core::integer::u64', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::PlanExecuted',
    kind: 'struct',
    members: [
      { name: 'plan_id', type: 'core::integer::u64', kind: 'key' },
      { name: 'execution_number', type: 'core::integer::u32', kind: 'data' },
      { name: 'amount_in', type: 'core::integer::u256', kind: 'data' },
      { name: 'btc_out', type: 'core::integer::u256', kind: 'data' },
      { name: 'btc_price', type: 'core::integer::u256', kind: 'data' },
      { name: 'timestamp', type: 'core::integer::u64', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::PlanCancelled',
    kind: 'struct',
    members: [
      { name: 'plan_id', type: 'core::integer::u64', kind: 'key' },
      {
        name: 'owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::ContractPaused',
    kind: 'struct',
    members: [
      {
        name: 'by',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::ContractUnpaused',
    kind: 'struct',
    members: [
      {
        name: 'by',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::dca_engine::DCAEngine::Event',
    kind: 'enum',
    variants: [
      {
        name: 'DepositMade',
        type: 'stark_dca::dca_engine::DCAEngine::DepositMade',
        kind: 'nested',
      },
      {
        name: 'WithdrawalMade',
        type: 'stark_dca::dca_engine::DCAEngine::WithdrawalMade',
        kind: 'nested',
      },
      {
        name: 'PlanCreated',
        type: 'stark_dca::dca_engine::DCAEngine::PlanCreated',
        kind: 'nested',
      },
      {
        name: 'PlanExecuted',
        type: 'stark_dca::dca_engine::DCAEngine::PlanExecuted',
        kind: 'nested',
      },
      {
        name: 'PlanCancelled',
        type: 'stark_dca::dca_engine::DCAEngine::PlanCancelled',
        kind: 'nested',
      },
      {
        name: 'ContractPaused',
        type: 'stark_dca::dca_engine::DCAEngine::ContractPaused',
        kind: 'nested',
      },
      {
        name: 'ContractUnpaused',
        type: 'stark_dca::dca_engine::DCAEngine::ContractUnpaused',
        kind: 'nested',
      },
    ],
  },
] as const;
