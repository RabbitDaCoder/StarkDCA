// Mock BTC (mBTC) Token Contract
//
// ERC20-compliant token representing mock Bitcoin on Starknet testnet.
// Used by the DCA engine to mint mBTC when executing DCA plans.
//
// Security Model:
//   - Owner: can mint tokens and set authorized minter
//   - Authorized Minter: the DCA engine contract, can mint mBTC
//   - All other addresses: standard ERC20 operations only
//
// Also deployable as mock USDT (same contract, different name/symbol).
// Follows: reference1.txt rules for validation, events, state management.

#[starknet::contract]
pub mod MockBTC {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::contract_address_const;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry};

    #[storage]
    struct Storage {
        token_name: felt252,
        token_symbol: felt252,
        token_decimals: u8,
        total_supply: u256,
        owner: ContractAddress,
        authorized_minter: ContractAddress,
        balances: Map<ContractAddress, u256>,
        allowances: Map<ContractAddress, Map<ContractAddress, u256>>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Transfer: Transfer,
        Approval: Approval,
        MinterUpdated: MinterUpdated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Transfer {
        #[key]
        pub from: ContractAddress,
        #[key]
        pub to: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Approval {
        #[key]
        pub owner: ContractAddress,
        #[key]
        pub spender: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct MinterUpdated {
        pub old_minter: ContractAddress,
        pub new_minter: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        name: felt252,
        symbol: felt252,
        decimals: u8,
    ) {
        let zero = contract_address_const::<0>();
        assert!(owner != zero, "OWNER_IS_ZERO");
        self.owner.write(owner);
        self.token_name.write(name);
        self.token_symbol.write(symbol);
        self.token_decimals.write(decimals);
        self.total_supply.write(0);
    }

    #[abi(embed_v0)]
    impl ERC20Impl of super::super::interfaces::IERC20<ContractState> {
        fn name(self: @ContractState) -> felt252 {
            self.token_name.read()
        }

        fn symbol(self: @ContractState) -> felt252 {
            self.token_symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.token_decimals.read()
        }

        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }

        fn transfer(
            ref self: ContractState, recipient: ContractAddress, amount: u256,
        ) -> bool {
            let caller = get_caller_address();
            self._transfer(caller, recipient, amount);
            true
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool {
            let caller = get_caller_address();
            let current_allowance = self.allowances.entry(sender).read(caller);
            assert!(current_allowance >= amount, "INSUFFICIENT_ALLOWANCE");
            self.allowances.entry(sender).write(caller, current_allowance - amount);
            self._transfer(sender, recipient, amount);
            true
        }

        fn approve(
            ref self: ContractState, spender: ContractAddress, amount: u256,
        ) -> bool {
            let caller = get_caller_address();
            let zero = contract_address_const::<0>();
            assert!(caller != zero, "APPROVE_FROM_ZERO");
            assert!(spender != zero, "APPROVE_TO_ZERO");
            self.allowances.entry(caller).write(spender, amount);
            self.emit(Approval { owner: caller, spender, amount });
            true
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress,
        ) -> u256 {
            self.allowances.entry(owner).read(spender)
        }
    }

    #[abi(embed_v0)]
    impl MintableImpl of super::super::interfaces::IMintable<ContractState> {
        fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            let owner = self.owner.read();
            let minter = self.authorized_minter.read();
            assert!(caller == owner || caller == minter, "NOT_AUTHORIZED_TO_MINT");
            let zero = contract_address_const::<0>();
            assert!(to != zero, "MINT_TO_ZERO");
            assert!(amount > 0, "MINT_ZERO_AMOUNT");

            let current_supply = self.total_supply.read();
            self.total_supply.write(current_supply + amount);

            let current_balance = self.balances.read(to);
            self.balances.write(to, current_balance + amount);

            self.emit(Transfer { from: zero, to, amount });
        }

        fn set_authorized_minter(ref self: ContractState, minter: ContractAddress) {
            let caller = get_caller_address();
            assert!(caller == self.owner.read(), "ONLY_OWNER");
            let old_minter = self.authorized_minter.read();
            self.authorized_minter.write(minter);
            self.emit(MinterUpdated { old_minter, new_minter: minter });
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn get_authorized_minter(self: @ContractState) -> ContractAddress {
            self.authorized_minter.read()
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _transfer(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            amount: u256,
        ) {
            let zero = contract_address_const::<0>();
            assert!(from != zero, "TRANSFER_FROM_ZERO");
            assert!(to != zero, "TRANSFER_TO_ZERO");
            assert!(amount > 0, "TRANSFER_ZERO_AMOUNT");

            let from_balance = self.balances.read(from);
            assert!(from_balance >= amount, "INSUFFICIENT_BALANCE");

            self.balances.write(from, from_balance - amount);
            let to_balance = self.balances.read(to);
            self.balances.write(to, to_balance + amount);
            self.emit(Transfer { from, to, amount });
        }
    }
}
