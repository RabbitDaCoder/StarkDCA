/**
 * useDCAContract — Read DCA Engine on-chain state for the connected wallet.
 *
 * Provides hooks that mirror the contract's view functions:
 *   - get_user_balance (USDT deposited in the DCA engine)
 *   - get_plan (plan details by ID)
 *   - get_user_plan_count
 *   - get_plan_count (global)
 *   - is_paused
 */
import { useReadContract, useAccount } from '@starknet-react/core';
import { dcaEngineAbi } from '@/abis';
import { DCA_ENGINE_ADDRESS } from '@/constants';

const DCA_ADDR = DCA_ENGINE_ADDRESS as `0x${string}`;

/**
 * Read the user's deposited USDT balance inside the DCA engine contract.
 */
export function useDCAUserBalance() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    abi: dcaEngineAbi,
    address: DCA_ADDR,
    functionName: 'get_user_balance',
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
 * Read a specific DCA plan by ID.
 * Returns tuple: (owner, amount, total, done, interval, lastExec, status, invested, btcReceived)
 */
export function useDCAPlan(planId: number | bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    abi: dcaEngineAbi,
    address: DCA_ADDR,
    functionName: 'get_plan',
    args: planId !== undefined ? [BigInt(planId)] : undefined,
    watch: true,
  });

  // Parse the flat tuple into a named object
  const plan = data
    ? {
        owner: (data as any)[0] as string,
        amountPerExecution: (data as any)[1] as bigint,
        totalExecutions: Number((data as any)[2]),
        executionsDone: Number((data as any)[3]),
        intervalSeconds: Number((data as any)[4]),
        lastExecutedAt: Number((data as any)[5]),
        status: Number((data as any)[6]), // 0=Active, 1=Cancelled, 2=Completed
        totalInvested: (data as any)[7] as bigint,
        btcReceived: (data as any)[8] as bigint,
      }
    : undefined;

  return { plan, isLoading, error, refetch };
}

/**
 * Read how many plans the connected user has created.
 */
export function useDCAUserPlanCount() {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    abi: dcaEngineAbi,
    address: DCA_ADDR,
    functionName: 'get_user_plan_count',
    args: address ? [address] : undefined,
    watch: true,
  });

  return {
    count: data !== undefined ? Number(data) : undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Read the global plan count.
 */
export function useDCAPlanCount() {
  const { data, isLoading, error, refetch } = useReadContract({
    abi: dcaEngineAbi,
    address: DCA_ADDR,
    functionName: 'get_plan_count',
    args: [],
    watch: true,
  });

  return {
    count: data !== undefined ? Number(data) : undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Read whether the DCA contract is paused.
 */
export function useDCAIsPaused() {
  const { data, isLoading, error, refetch } = useReadContract({
    abi: dcaEngineAbi,
    address: DCA_ADDR,
    functionName: 'is_paused',
    args: [],
    watch: true,
  });

  return {
    isPaused: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}
