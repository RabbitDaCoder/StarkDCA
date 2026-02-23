# Starknet Frontend Integration Patterns

## Extracted from: [GIDA_Cairo_Bootcamp_2_Week_7](https://github.com/OWK50GA/GIDA_Cairo_Bootcamp_2_Week_7)

This document contains **complete source code** from the reference repo showing how a React/Next.js frontend connects to Cairo smart contracts on Starknet.

---

## Table of Contents

1. [Package Dependencies](#1-package-dependencies)
2. [StarknetProvider Setup](#2-starknetprovider-setup)
3. [Layout (Provider Wrapping)](#3-layout-provider-wrapping)
4. [Wallet Connection (Connect.tsx)](#4-wallet-connection)
5. [Account & Address Display (AddressBar.tsx)](#5-address-bar--disconnect)
6. [Contract Read - useReadContract (AccountBalance.tsx)](#6-contract-read---usereadcontract)
7. [Contract Read - useReadContract (AddToken.tsx)](#7-contract-read---addtoken)
8. [ABI Files](#8-abi-files)
9. [Constants (Contract Addresses)](#9-constants)
10. [Helper Utilities](#10-helper-utilities)
11. [Network Switcher](#11-network-switcher)
12. [TSConfig Path Aliases](#12-tsconfig-path-aliases)
13. [Cairo Smart Contract](#13-cairo-smart-contract)
14. [Contract Scarb.toml](#14-contract-scarbtoml)
15. [Environment Configuration](#15-environment-configuration)
16. [Key Integration Patterns Summary](#16-key-integration-patterns-summary)

---

## 1. Package Dependencies

**File:** `frontend/package.json`  
**Role:** Defines all starknet-related packages used in the project.

```json
{
  "name": "my-dapp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@argent/x-shared": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-slot": "^1.0.2",
    "@starknet-react/chains": "^5.0.3",
    "@starknet-react/core": "^5.0.3",
    "@types/react-blockies": "^1.4.4",
    "bignumber.js": "^9.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cmdk": "^0.2.1",
    "lucide-react": "^0.331.0",
    "next": "14.0.4",
    "react": "^18",
    "react-blockies": "^1.4.1",
    "react-dom": "^18",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^5.5.0",
    "starknet": "^8.9.1",
    "starknetkit": "^1.1.9",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "prettier": "^3.7.4",
    "prettier-plugin-tailwindcss": "^0.6.6",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

### Key Starknet Packages:

| Package                  | Version | Role                                                                     |
| ------------------------ | ------- | ------------------------------------------------------------------------ |
| `@starknet-react/core`   | ^5.0.3  | React hooks for Starknet (useAccount, useConnect, useReadContract, etc.) |
| `@starknet-react/chains` | ^5.0.3  | Chain definitions (mainnet, sepolia)                                     |
| `starknet`               | ^8.9.1  | Low-level Starknet.js library (types, ABI, shortString, etc.)            |
| `starknetkit`            | ^1.1.9  | Wallet connection toolkit                                                |

---

## 2. StarknetProvider Setup

**File:** `frontend/src/app/components/StarknetProvider.tsx`  
**Role:** Configures starknet-react with chains, connectors, RPC provider, and explorer. Wraps the whole app.

```tsx
'use client';
import { sepolia, mainnet, Chain } from '@starknet-react/chains';
import {
  argent,
  braavos,
  jsonRpcProvider,
  StarknetConfig,
  useInjectedConnectors,
  voyager,
} from '@starknet-react/core';

interface StarknetProviderProps {
  children: React.ReactNode;
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'always',
  });

  function rpc(chain: Chain) {
    return {
      nodeUrl: 'https://rpc.starknet-testnet.lava.build/rpc/v0_9',
    };
  }

  const provider = jsonRpcProvider({ rpc });

  return (
    <StarknetConfig
      connectors={injected}
      chains={[mainnet, sepolia]}
      provider={provider}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
```

### Key Patterns:

- **`useInjectedConnectors`** — detects wallet extensions (Argent, Braavos) installed in the browser
- **`jsonRpcProvider`** — configures a custom RPC endpoint
- **`StarknetConfig`** — the top-level provider, similar to wagmi's `WagmiConfig`
- **`autoConnect`** — automatically reconnects the last used wallet on page load
- **`explorer={voyager}`** — configures Voyager as the block explorer

---

## 3. Layout (Provider Wrapping)

**File:** `frontend/src/app/layout.tsx`  
**Role:** Root layout wraps all pages with `StarknetProvider`.

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { StarknetProvider } from '~/StarknetProvider';
import Footer from './components/internal/Footer';
import { Analytics } from './components/internal/Analytics';

export const metadata: Metadata = {
  title: 'Starknet Scaffold',
  description: 'Build pixel-perfect dApps on Starknet...',
  openGraph: {
    title: 'Starknet Scaffold',
    description:
      'An open-source, up-to-date toolkit for building decentralized applications (dapps) on Starknet.',
    url: 'https://app.starknetscaffold.xyz/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starknet Scaffold',
    description:
      'An open-source, up-to-date toolkit for building decentralized applications (dapps) on Starknet.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen bg-white font-coolvetica text-sm text-text-primary md:text-md">
        <div className="h-[125vh]">
          <StarknetProvider>{children}</StarknetProvider>
        </div>
      </body>
    </html>
  );
}
```

---

## 4. Wallet Connection

**File:** `frontend/src/app/components/lib/Connect.tsx`  
**Role:** Handles wallet connection UI, listing available connectors, and triggering `connect()`.

```tsx
import Image from 'next/image';
import { Connector, useConnect } from '@starknet-react/core';
import Close from 'public/svg/Close';
import GenericModal from '../internal/util/GenericModal';

const loader = ({ src }: { src: string }) => {
  return src;
};

const Wallet = ({
  name,
  alt,
  src,
  connector,
}: {
  name: string;
  alt: string;
  src: string;
  connector: Connector;
}) => {
  const { connect } = useConnect();
  const isSvg = src?.startsWith('<svg');

  function handleConnectWallet(e: React.MouseEvent<HTMLButtonElement>): void {
    connect({ connector });
    const popover = document.getElementById('connect-modal');
    //@ts-ignore
    popover?.hidePopover();
    localStorage.setItem('lastUsedConnector', connector.name);
  }

  return (
    <button
      className="hover:bg-outline-grey flex cursor-pointer items-center gap-4 p-[.2rem] text-start transition-all hover:rounded-[10px]"
      onClick={(e) => handleConnectWallet(e)}
    >
      <div className="h-[2.2rem] w-[2.2rem] rounded-[5px]">
        {isSvg ? (
          <div
            className="h-full w-full rounded-[5px] object-cover"
            dangerouslySetInnerHTML={{ __html: src ?? '' }}
          />
        ) : (
          <Image
            alt={alt}
            loader={loader}
            unoptimized
            src={src}
            width={70}
            height={70}
            className="h-full w-full rounded-[5px] object-cover"
          />
        )}
      </div>
      <p className="flex-1">{name}</p>
    </button>
  );
};

const ConnectModal = () => {
  const { connectors } = useConnect();
  return (
    <GenericModal
      popoverId="connect-modal"
      style="text-white border-outline-grey mx-auto w-[90vw] rounded-[25px] border-[1px] border-solid bg-[#1c1b1f] md:h-[30rem] md:w-[45rem]"
    >
      <div className="flex flex-col">
        <div className="flex w-full p-4 lg:grid lg:grid-cols-5 lg:p-0">
          <div className="lg:border-outline-grey basis-5/6 lg:col-span-2 lg:border-r-[1px] lg:border-solid lg:py-4 lg:pl-8">
            <h2 className="my-4 text-center text-[1.125em] font-bold text-white lg:text-start">
              Connect a Wallet
            </h2>
          </div>
          <div className="ml-auto lg:col-span-3 lg:py-4 lg:pr-8">
            <button
              //@ts-ignore
              popovertarget="connect-modal"
              popovertargetaction="hide"
              className="bg-outline-grey grid h-8 w-8 place-content-center rounded-full"
            >
              <Close />
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between lg:grid lg:grid-cols-5">
          <div className="lg:border-outline-grey px-8 lg:col-span-2 lg:h-full lg:border-r-[1px] lg:border-solid">
            <h4 className="text-text-grey mb-[1rem] font-semibold">Popular</h4>
            <div className="flex flex-col gap-4 py-8">
              {connectors.map((connector, index) => (
                <Wallet
                  key={connector.id || index}
                  src={connector.icon.toString()}
                  name={connector.name}
                  connector={connector}
                  alt="alt"
                />
              ))}
            </div>
          </div>
          {/* ... informational panel ... */}
        </div>
      </div>
    </GenericModal>
  );
};

const ConnectButton = ({
  text = ' Connect Wallet',
  className = 'rounded-[12px] bg-blue-600 px-6 py-3 text-background-primary-light transition-all duration-300 hover:rounded-[30px] md:py-4',
}: {
  text?: string;
  className?: string;
}) => {
  const togglePopover = ({ targetId }: { targetId: string }) => {
    const popover = document.getElementById(targetId);
    // @ts-ignore
    popover.togglePopover();
    if (popover) {
      popover.addEventListener('toggle', () => {
        if (popover.matches(':popover-open')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }
      });
    }
  };
  return (
    <>
      <button
        aria-haspopup="dialog"
        onClick={() => togglePopover({ targetId: 'connect-modal' })}
        className={className}
      >
        {text}
      </button>
      <ConnectModal />
    </>
  );
};

export default ConnectButton;
```

### Key Patterns:

- **`useConnect()`** — returns `{ connect, connectors }` from starknet-react
- **`connect({ connector })`** — triggers wallet connection with a specific connector
- **`connectors.map()`** — iterates all detected connectors to render wallet options
- **`connector.icon`** — each connector provides its own icon (SVG or URL)
- **`localStorage.setItem("lastUsedConnector", connector.name)`** — persists last used wallet

---

## 5. Address Bar & Disconnect

**File:** `frontend/src/app/components/lib/AddressBar.tsx`  
**Role:** Shows connected address, Stark profile, and disconnect button.

```tsx
'use client';
import { useAccount, useDisconnect, useStarkProfile } from '@starknet-react/core';
import Blockies from 'react-blockies';
import AccountBalance from './AccountBalance';
import GenericModal from '../internal/util/GenericModal';
import Close from 'public/svg/Close';
import { useEffect, useState } from 'react';
import CopyButton from '../internal/util/CopyButton';

const UserModal = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [imageError, setImageError] = useState(false);
  const { data: starkProfile } = useStarkProfile({
    address,
  });

  return (
    <GenericModal
      popoverId="user-popover"
      style="mt-[5rem] w-full bg-transparent backdrop:mt-[5rem] md:mt-[9rem] md:backdrop:mt-[9rem] h-screen"
    >
      <div className="user-modal mx-auto flex w-full max-w-[--header-max-w] flex-col items-center py-8 md:items-end md:px-12">
        <div className="flex w-[90vw] max-w-[25rem] flex-col justify-between gap-4 rounded-[24px] bg-[--background] p-8 text-md text-text-primary shadow-popover-shadow transition-colors duration-500 ease-linear md:max-w-[30rem]">
          <div className="flex justify-between">
            <h3 className="text-l text-[--headings]">Connected</h3>
            <button popovertarget="user-popover">
              <Close />
            </button>
          </div>

          <div className="mx-auto">
            <div className="mx-auto mb-4 h-20 w-20 overflow-clip rounded-full md:h-24 md:w-24">
              {!imageError && starkProfile?.profilePicture ? (
                <img
                  src={starkProfile?.profilePicture}
                  className="w-full rounded-full"
                  alt="starknet profile"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Blockies
                  seed={address || ''}
                  scale={12}
                  className="mx-auto h-full w-full scale-110 rounded-full md:scale-100"
                />
              )}
            </div>
            <CopyButton
              copyText={starkProfile?.name || address || ''}
              buttonText={
                starkProfile?.name || address?.slice(0, 12).concat('...').concat(address?.slice(-5))
              }
              className="flex items-center gap-2 text-sm text-yellow-primary"
              iconClassName="rounded-full bg-[--link-card] p-1 text-yellow-primary dark:bg-black"
            />
          </div>

          <div className="rounded-[12px] bg-[--modal-assets-bg] transition-colors duration-500 ease-linear">
            <AccountBalance address={address || ''} />
          </div>

          <div>
            <button
              onClick={(e) => {
                const popover = document.getElementById('user-popover');
                // @ts-ignore
                popover.hidePopover();
                disconnect();
              }}
              className="w-full rounded-[12px] border-[2px] border-solid border-[--borders] bg-[--modal-disconnect-bg] p-3 text-red-secondary md:p-4"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

const AddressBar = () => {
  const { address } = useAccount();
  const { data: starkProfile } = useStarkProfile({ address });
  const [imageError, setImageError] = useState(false);

  if (!address) return null;

  const togglePopover = ({ targetId }: { targetId: string }) => {
    const popover = document.getElementById(targetId);
    // @ts-ignore
    popover.togglePopover();
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        onClick={() => togglePopover({ targetId: 'user-popover' })}
        className="rounded-full bg-button-tertiary px-2 py-1 text-accent-secondary md:px-4 md:py-2"
      >
        <span className="flex items-center">
          {!imageError && starkProfile?.profilePicture ? (
            <img
              src={starkProfile.profilePicture}
              className="mr-2 h-8 w-8 rounded-full"
              alt="starknet profile"
              onError={() => setImageError(true)}
            />
          ) : (
            <Blockies seed={address} className="mr-2 h-8 w-8 rounded-full" />
          )}
          {starkProfile?.name
            ? starkProfile.name
            : address?.slice(0, 6).concat('...').concat(address?.slice(-5))}
        </span>
      </button>
      <UserModal />
    </>
  );
};

export default AddressBar;
```

### Key Patterns:

- **`useAccount()`** — returns `{ address }` of connected wallet
- **`useDisconnect()`** — returns `{ disconnect }` function
- **`useStarkProfile({ address })`** — fetches Stark ID profile (name, picture) for the address

---

## 6. Contract Read - useReadContract

**File:** `frontend/src/app/components/lib/AccountBalance.tsx`  
**Role:** Reads ETH and STRK token balances using `useReadContract` hook.

```tsx
import { useReadContract } from '@starknet-react/core';
import { ERC20ABI } from '../../../../public/abi/tokenAbi';
import { ETH_SEPOLIA, STRK_SEPOLIA } from '@/app/components/internal/helpers/constant';
import { formatCurrency } from '../internal/helpers';

type Props = {
  address: string;
  heading?: boolean;
};

function AccountBalance({ address, heading = true }: Props) {
  const { data: eth, isLoading: ethLoading } = useReadContract({
    address: ETH_SEPOLIA as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balance_of',
    args: [address!],
    watch: true,
  });

  const { data: strk, isLoading: strkLoading } = useReadContract({
    address: STRK_SEPOLIA as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balance_of',
    args: [address!],
    watch: true,
  });

  // @ts-ignore
  const ethBalance = formatCurrency(eth?.balance.low.toString());
  // @ts-ignore
  const strkBalance = formatCurrency(strk?.balance?.low.toString());

  return (
    <div className="p-4 text-sm">
      {heading && <h3 className="mb-4 text-md">Assets</h3>}
      <div className="flex flex-col gap-4 text-[--headings]">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full md:h-12 md:w-12">
              <img className="w-full" src="/assets/eth.svg" alt="" />
            </div>
            <div>
              <p className="mb-2 text-md">ETH</p>
              <p>Ethereum</p>
            </div>
          </div>
          <div className="mr-4 flex items-center">
            <p>{Number(ethBalance).toFixed(3)}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full md:h-12 md:w-12">
              <img className="w-full" src="/assets/strk.svg" alt="" />
            </div>
            <div>
              <p className="mb-2 text-md">STRK</p>
              <p>Starknet token</p>
            </div>
          </div>
          <div className="mr-4 flex items-center">
            <p>{Number(strkBalance).toFixed(3)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountBalance;
```

### Key Pattern — `useReadContract`:

```tsx
const { data, isLoading } = useReadContract({
  address: CONTRACT_ADDRESS as `0x${string}`, // contract address
  abi: ABI_ARRAY, // ABI definition
  functionName: 'function_name', // function to call
  args: [arg1, arg2], // function arguments
  watch: true, // auto-refresh
});
```

---

## 7. Contract Read - AddToken

**File:** `frontend/src/app/components/lib/AddToken.tsx`  
**Role:** Reads ERC20 token metadata (name, symbol, decimals) using `useReadContract`.

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useConnect, useReadContract } from '@starknet-react/core';
import { shortString } from 'starknet';
import Close from 'public/svg/Close';
import GenericModal from '../internal/util/GenericModal';
import { erc20MetadataAbi } from '@/app/common/abis/erc20-metadata';

const AddTokenModal = () => {
  const { connector } = useConnect();
  const [tokenAddress, setTokenAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState('');
  const [name, setName] = useState('');

  const { data: tokenName } = useReadContract({
    abi: erc20MetadataAbi,
    functionName: 'name',
    address: tokenAddress as `0x${string}`,
    args: [],
  });

  const { data: tokenSymbol } = useReadContract({
    abi: erc20MetadataAbi,
    functionName: 'symbol',
    address: tokenAddress as `0x${string}`,
    args: [],
  });

  const { data: tokenDecimals } = useReadContract({
    abi: erc20MetadataAbi,
    functionName: 'decimals',
    address: tokenAddress as `0x${string}`,
    args: [],
  });

  useEffect(() => {
    tokenName ? setName(shortString.decodeShortString(tokenName.toString())) : setName('');
    tokenSymbol ? setSymbol(shortString.decodeShortString(tokenSymbol.toString())) : setSymbol('');
    tokenDecimals ? setDecimals(tokenDecimals.toString()) : setDecimals('');
  }, [tokenName, tokenSymbol, tokenDecimals]);

  function handleAddToken() {
    const fetchAddToken = async () => {
      try {
        const decimalFloat = parseFloat(decimals);
        //@ts-ignore
        const walletProvider = connector?._wallet;
        const asset = {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol,
            decimalFloat,
            name,
          },
        };
        const resp = await walletProvider.request({
          type: 'wallet_watchAsset',
          params: asset,
        });
        console.log(resp);
      } catch (err) {
        console.log(err);
      } finally {
        setDecimals('');
        setName('');
        setSymbol('');
        setTokenAddress('');
      }
    };
    fetchAddToken();
  }

  // ... JSX form for input fields and Add Token button ...
};
```

### Key Pattern — Reading felt252 strings:

```tsx
import { shortString } from 'starknet';

// After getting data from useReadContract:
const decodedName = shortString.decodeShortString(tokenName.toString());
```

### Key Pattern — Direct wallet RPC call:

```tsx
const walletProvider = connector?._wallet;
await walletProvider.request({
  type: 'wallet_watchAsset',
  params: { type: 'ERC20', options: { address, symbol, decimals, name } },
});
```

---

## 8. ABI Files

### 8a. ERC20 Full ABI

**File:** `frontend/public/abi/tokenAbi.ts`  
**Role:** Complete ERC20 ABI used for balance reads and token operations.

```tsx
export const ERC20ABI = [
  {
    type: 'impl',
    name: 'ERC20Impl',
    interface_name: 'erc20::interfaces::ierc20::IERC20',
  },
  {
    type: 'struct',
    name: 'core::byte_array::ByteArray',
    members: [
      { name: 'data', type: 'core::array::Array::<core::bytes_31::bytes31>' },
      { name: 'pending_word', type: 'core::felt252' },
      { name: 'pending_word_len', type: 'core::internal::bounded_int::BoundedInt::<0, 30>' },
    ],
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
    name: 'erc20::interfaces::ierc20::IERC20',
    items: [
      {
        type: 'function',
        name: 'name',
        inputs: [],
        outputs: [{ type: 'core::byte_array::ByteArray' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'symbol',
        inputs: [],
        outputs: [{ type: 'core::byte_array::ByteArray' }],
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
        inputs: [{ name: 'account', type: 'core::starknet::contract_address::ContractAddress' }],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'allowance',
        inputs: [
          { name: 'owner', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
        ],
        outputs: [{ type: 'core::integer::u256' }],
        state_mutability: 'view',
      },
      {
        type: 'function',
        name: 'approve',
        inputs: [
          { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'transfer',
        inputs: [
          { name: 'recipient', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'transfer_from',
        inputs: [
          { name: 'sender', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'recipient', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'external',
      },
      {
        type: 'function',
        name: 'mint',
        inputs: [
          { name: 'recipient', type: 'core::starknet::contract_address::ContractAddress' },
          { name: 'amount', type: 'core::integer::u256' },
        ],
        outputs: [{ type: 'core::bool' }],
        state_mutability: 'external',
      },
    ],
  },
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [
      { name: 'token_name', type: 'core::byte_array::ByteArray' },
      { name: 'symbol', type: 'core::byte_array::ByteArray' },
    ],
  },
  {
    type: 'event',
    name: 'erc20::erc20::ERC20::Transfer',
    kind: 'struct',
    members: [
      { name: 'from', type: 'core::starknet::contract_address::ContractAddress', kind: 'key' },
      { name: 'to', type: 'core::starknet::contract_address::ContractAddress', kind: 'key' },
      { name: 'amount', type: 'core::integer::u256', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'erc20::erc20::ERC20::Approval',
    kind: 'struct',
    members: [
      { name: 'owner', type: 'core::starknet::contract_address::ContractAddress', kind: 'key' },
      { name: 'spender', type: 'core::starknet::contract_address::ContractAddress', kind: 'key' },
      { name: 'value', type: 'core::integer::u256', kind: 'data' },
    ],
  },
  {
    type: 'event',
    name: 'erc20::erc20::ERC20::Event',
    kind: 'enum',
    variants: [
      { name: 'Transfer', type: 'erc20::erc20::ERC20::Transfer', kind: 'nested' },
      { name: 'Approval', type: 'erc20::erc20::ERC20::Approval', kind: 'nested' },
    ],
  },
] as const;
```

### 8b. ERC20 Metadata ABI (minimal)

**File:** `frontend/src/app/common/abis/erc20-metadata.ts`  
**Role:** Minimal ABI for reading ERC20 metadata (name, symbol, decimals).

```tsx
import { Abi } from 'starknet';

export const erc20MetadataAbi: Abi = [
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'core::felt252' }],
    state_mutability: 'view',
  },
  {
    name: 'name',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'core::felt252' }],
    state_mutability: 'view',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'core::integer::u8' }],
    state_mutability: 'view',
  },
];
```

---

## 9. Constants

**File:** `frontend/src/app/components/internal/helpers/constant.ts`  
**Role:** Well-known token contract addresses on Sepolia.

```tsx
export const ETH_SEPOLIA: string =
  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
export const STRK_SEPOLIA: string =
  '0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
```

**File:** `frontend/src/app/common/data.ts`  
**Role:** Application contract address and static data.

```tsx
import { StartElection, RemoveVote, EndElection, CountVotes } from '../components/icons';

export const ContractAddress = '0x05e24a19845e7b6561ee367becc293a34f860a0cea0935cf1e319876f1aa9466';

export const SideBarOptions = [
  { id: 1, label: 'Start Election', icon: StartElection },
  { id: 2, label: 'Suspend Election', icon: RemoveVote },
  { id: 5, label: 'End Election', icon: EndElection },
  { id: 6, label: 'Count Votes', icon: CountVotes },
];

export const Candidates = [
  { id: 1, surname: 'Yamal', firstname: 'Lamine', noOfVotes: 6, qualified: true },
  { id: 2, surname: 'Ethan', firstname: 'Nwaneri', noOfVotes: 4, qualified: true },
  { id: 3, surname: 'Fermin', firstname: 'Lopez', noOfVotes: 1, qualified: false },
  { id: 4, surname: 'Vinicius', firstname: 'Jr', noOfVotes: 9, qualified: false },
  { id: 5, surname: 'Florian', firstname: 'Wirtz', noOfVotes: 12, qualified: true },
  { id: 6, surname: 'Florian', firstname: 'Wirtz', noOfVotes: 12, qualified: true },
];
```

---

## 10. Helper Utilities

**File:** `frontend/src/app/components/internal/helpers/index.ts`  
**Role:** Utility functions for formatting on-chain data.

```tsx
export const searchResources = async ({
  resources,
  search,
}: {
  search: string;
  resources: any;
}) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const lowerCaseSearch = search.toLocaleLowerCase();
  return resources.filter((resource: any) =>
    Object.values(resource).some(
      (value) => typeof value === 'string' && value.toLocaleLowerCase().includes(lowerCaseSearch),
    ),
  );
};

export const formatCurrency = (currency: number) => {
  let amount = currency / 1e18;
  return amount || 0;
};

export const formatDate = (isoString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', options);
};

export const formatAmount = (hex: any) => {
  const decimal = parseInt(hex, 16);
  return decimal.toString();
};

export function felt252ToString(feltValue: any) {
  let hex = feltValue.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substr(i, 2), 16);
    result += String.fromCharCode(charCode);
  }
  return result;
}
```

---

## 11. Network Switcher

**File:** `frontend/src/app/components/lib/NetworkSwitcher.tsx`  
**Role:** UI for displaying/switching between Starknet networks.

```tsx
'use client';
import * as React from 'react';
import { useNetwork } from '@starknet-react/core';
import Check from 'public/svg/Check';
import ChevronDown from 'public/svg/ChevronDown';

const NETWORK_MAPPING: { [key: string]: string } = {
  mainnet: 'SN_MAIN',
  sepolia: 'SN_SEPOLIA',
};

const networks = [
  { value: 'SN_MAIN', label: 'Mainnet' },
  { value: 'SN_SEPOLIA', label: 'Sepolia' },
];

export default function NetworkSwitcher() {
  const { chain } = useNetwork();
  const [open, setOpen] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState(NETWORK_MAPPING[chain.network]);

  React.useEffect(() => {
    setSelectedNetwork(NETWORK_MAPPING[chain.network]);
  }, [chain.network]);

  return (
    <div className="relative flex w-[50%] max-w-[12rem] flex-col gap-y-3 text-[--headings] transition-all duration-500">
      <button
        role="combobox"
        aria-expanded={open}
        aria-controls="network-listbox"
        className="flex cursor-pointer items-center justify-between rounded-[12px] border-[2px] border-solid border-[--borders] bg-[--link-card] p-3"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>
          {selectedNetwork
            ? networks.find((n) => n.value === selectedNetwork)?.label
            : 'Select Network...'}
        </span>
        <span className={`${open ? '-rotate-180' : ''} transition-all duration-500`}>
          <ChevronDown />
        </span>
      </button>
      {/* Dropdown options */}
      <div
        id="network-listbox"
        role="listbox"
        className={`absolute ... ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col rounded-[12px] border-[2px] border-solid border-[--borders] bg-[--link-card]">
            {networks.map((network) => (
              <button
                className="flex w-full cursor-pointer items-center rounded-xl px-4 py-3"
                key={network.value}
                value={network.value}
                role="option"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                <span
                  className={`mr-2 text-md ${selectedNetwork === network.value ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Check />
                </span>
                <span>{network.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Key Pattern:

- **`useNetwork()`** — returns `{ chain }` with the current network info

---

## 12. TSConfig Path Aliases

**File:** `frontend/tsconfig.json`  
**Role:** Configures import aliases for cleaner paths.

```json
{
  "compilerOptions": {
    "target": "es6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "~/*": ["./src/app/components/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Key:

- `@/` → `./src/` (e.g., `@/app/common/abis/erc20-metadata`)
- `~/` → `./src/app/components/` (e.g., `~/StarknetProvider`)

---

## 13. Cairo Smart Contract

**File:** `contracts/src/lib.cairo`  
**Role:** The Voting smart contract deployed on Starknet.

```cairo
#[derive(Copy, Drop, Serde, PartialEq, starknet::Store)]
pub struct Candidate {
    pub id: u256,
    pub index: u256,
    pub fname: felt252,
    pub lname: felt252,
    pub no_of_votes: u256,
    pub qualified: bool,
}

#[derive(Copy, Drop, Serde, PartialEq, starknet::Store)]
pub struct CandidateInput {
    pub fname: felt252,
    pub lname: felt252,
}

#[starknet::interface]
pub trait IVotingTrait<TContractState> {
    fn nominate(ref self: TContractState, candidate_fname: felt252, candidate_lname: felt252);
    fn batch_nominate(ref self: TContractState, candidates_data: Array<CandidateInput>);
    fn start_election(ref self: TContractState);
    fn cast_vote(ref self: TContractState, candidate_id: u256);
    fn uncast_vote(ref self: TContractState, candidate_id: u256);
    fn get_all_candidates(self: @TContractState) -> Array<Candidate>;
    fn get_candidate(self: @TContractState, candidate_id: u256) -> (felt252, felt252);
    fn disqualify_candidate(ref self: TContractState, candidate_id: u256);
    fn suspend_election(ref self: TContractState);
    fn count_votes(self: @TContractState) -> (u256, u256, Candidate);
    fn end_election(ref self: TContractState);
}

#[derive(Copy, Drop, Serde, PartialEq, starknet::Store)]
pub enum ElectionStatus {
    #[default]
    NotActive,
    Started,
    Suspended,
    Ended
}

#[starknet::contract]
pub mod VotingContract {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{Map, StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Vec, VecTrait, MutableVecTrait};
    use super::{Candidate, IVotingTrait, ElectionStatus, CandidateInput};
    use core::poseidon::PoseidonTrait;
    use core::hash::{HashStateTrait, HashStateExTrait};
    use core::option::OptionTrait;

    #[storage]
    pub struct Storage {
        candidates: Map::<u256, Option<Candidate>>,
        has_voted: Map::<ContractAddress, Option<(bool, u256)>>,
        total_candidates_no: u256,
        total_voters: u256,
        owner: ContractAddress,
        election_status: ElectionStatus,
        existing_candidate_ids: Vec<u256>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.election_status.write(ElectionStatus::NotActive);
    }

    #[abi(embed_v0)]
    pub impl VotingContractImpl of IVotingTrait<ContractState> {
        fn nominate(ref self: ContractState, candidate_fname: felt252, candidate_lname: felt252) {
            assert(self.election_status.read() != ElectionStatus::Ended, 'Election already ended');
            let id: u256 = generate_id(candidate_fname, candidate_lname);
            let mistake_id: u256 = generate_id(candidate_lname, candidate_fname);
            let no_of_candidates = self.total_candidates_no.read();
            let existing_candidate = self.candidates.entry(id).read();
            let mistake_existing_candidate = self.candidates.entry(mistake_id).read();
            assert(!existing_candidate.is_some(), 'Candidate already exists');
            assert(!mistake_existing_candidate.is_some(), 'Candidate already exists');
            let new_candidate = Candidate {
                id,
                index: no_of_candidates + 1,
                fname: candidate_fname,
                lname: candidate_lname,
                no_of_votes: 0,
                qualified: true
            };
            self.candidates.entry(id).write(Option::Some(new_candidate));
            self.total_candidates_no.write(self.total_candidates_no.read() + 1);
            self.existing_candidate_ids.push(id);
        }

        fn batch_nominate(ref self: ContractState, candidates_data: Array<CandidateInput>) {
            assert(self.election_status.read() != ElectionStatus::Ended, 'Election already ended');
            let mut current_total = self.total_candidates_no.read();
            for i in 0..candidates_data.len() {
                let candidate_input = *candidates_data.at(i);
                let fname = candidate_input.fname;
                let lname = candidate_input.lname;
                let id: u256 = generate_id(fname, lname);
                let mistake_id: u256 = generate_id(lname, fname);
                assert(
                    !self.candidates.entry(id).read().is_some()
                    && !self.candidates.entry(mistake_id).read().is_some(),
                    'Candidate already exists'
                );
                let new_candidate = Candidate {
                    id, index: current_total + 1, fname, lname, no_of_votes: 0, qualified: true
                };
                self.candidates.entry(id).write(Option::Some(new_candidate));
                current_total += 1;
                self.existing_candidate_ids.push(id);
            }
            self.total_candidates_no.write(current_total);
        }

        fn start_election(ref self: ContractState) { /* ... owner check, status check, write Started */ }
        fn cast_vote(ref self: ContractState, candidate_id: u256) { /* ... */ }
        fn uncast_vote(ref self: ContractState, candidate_id: u256) { /* ... */ }
        fn get_all_candidates(self: @ContractState) -> Array<Candidate> { /* ... */ }
        fn get_candidate(self: @ContractState, candidate_id: u256) -> (felt252, felt252) { /* ... */ }
        fn disqualify_candidate(ref self: ContractState, candidate_id: u256) { /* ... */ }
        fn suspend_election(ref self: ContractState) { /* ... */ }
        fn count_votes(self: @ContractState) -> (u256, u256, Candidate) { /* ... */ }
        fn end_election(ref self: ContractState) { /* ... */ }
    }

    fn generate_id(fname: felt252, lname: felt252) -> u256 {
        let id = PoseidonTrait::new().update_with(fname).update_with(lname).finalize();
        id.into()
    }
}
```

---

## 14. Contract Scarb.toml

**File:** `contracts/Scarb.toml`

```toml
[package]
name = "contracts"
version = "0.1.0"
edition = "2023_11"

[dependencies]
starknet = "2.11.2"
openzeppelin_access = "0.20.0"
openzeppelin_token = "0.20.0"

[dev-dependencies]
openzeppelin_utils = "0.20.0"
snforge_std = "0.52.0"

[[target.starknet-contract]]
casm = true
sierra = true

[tool.fmt]
sort-module-level-items = true

[[tool.snforge.fork]]
name = "SEPOLIA_LATEST"
url = "https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
block_id.tag = "latest"
```

---

## 15. Environment Configuration

**File:** `frontend/.env.example`

```
NEXT_PUBLIC_PROVIDER=alchemy
NEXT_PUBLIC_API_KEY=
```

---

## 16. Key Integration Patterns Summary

### Architecture Flow

```
layout.tsx
  └─ StarknetProvider (wraps entire app)
       ├─ StarknetConfig
       │    ├─ chains: [mainnet, sepolia]
       │    ├─ connectors: useInjectedConnectors([argent, braavos])
       │    ├─ provider: jsonRpcProvider({ rpc })
       │    ├─ explorer: voyager
       │    └─ autoConnect: true
       └─ Page Components
            ├─ ConnectButton → useConnect() → connect({ connector })
            ├─ AddressBar → useAccount() + useStarkProfile() + useDisconnect()
            ├─ AccountBalance → useReadContract({ abi, address, functionName, args, watch })
            ├─ AddToken → useReadContract() + shortString.decodeShortString()
            └─ NetworkSwitcher → useNetwork()
```

### Hook Usage Summary

| Hook                    | Package                | Purpose                                        |
| ----------------------- | ---------------------- | ---------------------------------------------- |
| `useInjectedConnectors` | `@starknet-react/core` | Detect installed wallet extensions             |
| `useConnect`            | `@starknet-react/core` | Get `connect()` function and `connectors` list |
| `useAccount`            | `@starknet-react/core` | Get connected wallet `address`                 |
| `useDisconnect`         | `@starknet-react/core` | Get `disconnect()` function                    |
| `useStarkProfile`       | `@starknet-react/core` | Fetch Stark ID profile (name, picture)         |
| `useReadContract`       | `@starknet-react/core` | Read data from any contract (view functions)   |
| `useNetwork`            | `@starknet-react/core` | Get current network/chain info                 |

### ABI Pattern

- **Full ABIs** are stored as TypeScript exports (`export const ERC20ABI = [...] as const`)
- ABIs are placed either in `public/abi/` or `src/app/common/abis/`
- Import and pass to `useReadContract({ abi: ERC20ABI, ... })`
- The ABI format is the Sierra/Starknet ABI JSON format (not Ethereum Solidity ABI)

### Contract Address Pattern

- Stored as string constants in dedicated files
- Cast to `0x${string}` when passed to hooks: `address: CONTRACT_ADDRESS as \`0x\${string}\``

### Data Formatting

- **Token balances**: Divide by `1e18` for human-readable amounts
- **felt252 strings**: Use `shortString.decodeShortString()` from `starknet` package
- **Hex amounts**: Use `parseInt(hex, 16)` for conversion

### Write Operations (not yet implemented in this repo but the pattern would be):

```tsx
import { useSendTransaction } from '@starknet-react/core';

const { send, data, isPending } = useSendTransaction({
  calls: [
    {
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: 'nominate',
      calldata: [candidate_fname, candidate_lname],
    },
  ],
});
```

Or with `useContract`:

```tsx
import { useContract } from '@starknet-react/core';

const { contract } = useContract({
  address: CONTRACT_ADDRESS,
  abi: VOTING_ABI,
});

// Then call: contract.nominate(fname, lname)
```
