/**
 * Contract addresses and network config.
 *
 * After deploying to Starknet Sepolia, replace the placeholders below
 * with the actual deployed addresses.
 */

// ----- Starknet Sepolia (SN_SEPOLIA) -----
export const NETWORK = 'sepolia' as const;

// Deployed contract addresses — update after `sncast deploy`
export const DCA_ENGINE_ADDRESS =
  import.meta.env.VITE_DCA_ENGINE_ADDRESS ??
  '0x0000000000000000000000000000000000000000000000000000000000000000';

export const USDT_TOKEN_ADDRESS =
  import.meta.env.VITE_USDT_TOKEN_ADDRESS ??
  '0x0000000000000000000000000000000000000000000000000000000000000000';

export const MBTC_TOKEN_ADDRESS =
  import.meta.env.VITE_MBTC_TOKEN_ADDRESS ??
  '0x0000000000000000000000000000000000000000000000000000000000000000';

// Blockchain explorer
export const STARKSCAN_BASE_URL = 'https://sepolia.starkscan.co';
export const STARKSCAN_TX_URL = (hash: string) => `${STARKSCAN_BASE_URL}/tx/${hash}`;
export const STARKSCAN_CONTRACT_URL = (addr: string) => `${STARKSCAN_BASE_URL}/contract/${addr}`;

// Token decimals (both mock USDT and mock BTC use 18)
export const TOKEN_DECIMALS = 18;
export const PRECISION = BigInt('1000000000000000000'); // 1e18

// Starknet RPC endpoint (Sepolia)
export const STARKNET_RPC_URL =
  import.meta.env.VITE_STARKNET_RPC_URL ?? 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';
