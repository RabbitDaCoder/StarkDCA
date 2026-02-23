/**
 * useContractBalance — Read USDT / mBTC balance for connected wallet.
 *
 * Uses @starknet-react/core `useReadContract` following the bootcamp pattern.
 */
import { useReadContract, useAccount } from '@starknet-react/core';
import { erc20Abi } from '@/abis';
import { USDT_TOKEN_ADDRESS, MBTC_TOKEN_ADDRESS } from '@/constants';

/**
 * Hook to read the connected user's USDT balance from the token contract.
 */
export function useUsdtBalance() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    abi: erc20Abi,
    address: USDT_TOKEN_ADDRESS as `0x${string}`,
    functionName: 'balance_of',
    args: address ? [address] : undefined,
    watch: true,
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read the connected user's mBTC balance from the token contract.
 */
export function useMbtcBalance() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    abi: erc20Abi,
    address: MBTC_TOKEN_ADDRESS as `0x${string}`,
    functionName: 'balance_of',
    args: address ? [address] : undefined,
    watch: true,
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to read the USDT allowance the user has granted to the DCA engine.
 */
export function useUsdtAllowance(spender: string) {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    abi: erc20Abi,
    address: USDT_TOKEN_ADDRESS as `0x${string}`,
    functionName: 'allowance',
    args: address ? [address, spender] : undefined,
    watch: true,
  });

  return {
    allowance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}
