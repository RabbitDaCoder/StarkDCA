/**
 * ERC20 ABI — extracted from MockBTC compiled Sierra JSON.
 * Works for both mock USDT and mock BTC tokens.
 * Contract: stark_dca::mock_btc::MockBTC
 */
export const erc20Abi = [
  {
    type: 'impl',
    name: 'ERC20Impl',
    interface_name: 'stark_dca::interfaces::IERC20',
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
    name: 'stark_dca::interfaces::IERC20',
    items: [
      {
        type: 'function',
        name: 'name',
        inputs: [],
        outputs: [{ type: 'core::felt252' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [{ type: 'core::felt252' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'decimals',
        inputs: [],
        outputs: [{ type: 'core::integer::u8' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'total_supply',
        inputs: [],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'balance_of',
        inputs: [
          {
            name: 'account',
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'transfer',
        inputs: [
          {
            name: 'recipient',
            type: 'core::starknet::contract_address::ContractAddress',
          },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'transfer_from',
        inputs: [
          {
            name: 'sender',
            type: 'core::starknet::contract_address::ContractAddress',
          },
          {
            name: 'recipient',
            type: 'core::starknet::contract_address::ContractAddress',
          },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'approve',
        inputs: [
          {
            name: 'spender',
            type: 'core::starknet::contract_address::ContractAddress',
          },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'allowance',
        inputs: [
          {
            name: 'owner',
            type: 'core::starknet::contract_address::ContractAddress',
          },
          {
            name: 'spender',
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
    ],
  },
  {
    type: 'impl',
    name: 'MintableImpl',
    interface_name: 'stark_dca::interfaces::IMintable',
  },
  {
    type: 'interface',
    name: 'stark_dca::interfaces::IMintable',
    items: [
      {
        type: 'function',
        name: 'mint',
        inputs: [
          {
            name: 'to',
            type: 'core::starknet::contract_address::ContractAddress',
          },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'set_authorized_minter',
        inputs: [
          {
            name: 'minter',
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
        outputs: [],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'get_owner',
        inputs: [],
        outputs: [
          {
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'get_authorized_minter',
        inputs: [],
        outputs: [
          {
            type: 'core::starknet::contract_address::ContractAddress',
          },
        ],
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
      { name: 'name', type: 'core::felt252' },
      { name: 'symbol', type: 'core::felt252' },
      { name: 'decimals', type: 'core::integer::u8' },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::mock_btc::MockBTC::Transfer',
    kind: 'struct',
    members: [
      {
        name: 'from',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key',
      },
      {
        name: 'to',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key',
      },
      { name: 'amount', type: 'core::integer::u256', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::mock_btc::MockBTC::Approval',
    kind: 'struct',
    members: [
      {
        name: 'owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key',
      },
      {
        name: 'spender',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key',
      },
      { name: 'amount', type: 'core::integer::u256', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::mock_btc::MockBTC::MinterUpdated',
    kind: 'struct',
    members: [
      {
        name: 'old_minter',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
      {
        name: 'new_minter',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'data',
      },
    ],
  },
  {
    type: 'event',
    name: 'stark_dca::mock_btc::MockBTC::Event',
    kind: 'enum',
    variants: [
      {
        name: 'Transfer',
        type: 'stark_dca::mock_btc::MockBTC::Transfer',
        kind: 'nested',
      },
      {
        name: 'Approval',
        type: 'stark_dca::mock_btc::MockBTC::Approval',
        kind: 'nested',
      },
      {
        name: 'MinterUpdated',
        type: 'stark_dca::mock_btc::MockBTC::MinterUpdated',
        kind: 'nested',
      },
    ],
  },
] as const;
