/**
 * useDCAWrite — Write hooks for DCA Engine contract interactions.
 *
 * Uses @starknet-react/core `useSendTransaction` to send on-chain txs.
 * Each hook returns { send, data, isPending, error } matching starknet-react conventions.
 */
import { useMemo } from 'react';
import { useSendTransaction, useAccount } from '@starknet-react/core';
import { Call } from 'starknet';
import { dcaEngineAbi } from '@/abis';
import { erc20Abi } from '@/abis';
import { DCA_ENGINE_ADDRESS, USDT_TOKEN_ADDRESS, PRECISION } from '@/constants';

/**
 * Approve USDT spending by the DCA engine, then deposit.
 * This combines the two calls into a single multicall tx if the wallet supports it.
 */
export function useDeposit() {
  const { account } = useAccount();

  const deposit = async (amountHuman: string) => {
    if (!account) throw new Error('Wallet not connected');

    const amountWei = BigInt(Math.floor(parseFloat(amountHuman) * 1e18)).toString();

    // Build multicall: approve + deposit
    const calls: Call[] = [
      {
        contractAddress: USDT_TOKEN_ADDRESS,
        entrypoint: 'approve',
        calldata: [DCA_ENGINE_ADDRESS, amountWei, '0'], // u256 = (low, high)
      },
      {
        contractAddress: DCA_ENGINE_ADDRESS,
        entrypoint: 'deposit',
        calldata: [amountWei, '0'],
      },
    ];

    const tx = await account.execute(calls);
    return tx;
  };

  return { deposit, account };
}

/**
 * Withdraw USDT from the DCA engine back to user wallet.
 */
export function useWithdraw() {
  const { account } = useAccount();

  const withdraw = async (amountHuman: string) => {
    if (!account) throw new Error('Wallet not connected');

    const amountWei = BigInt(Math.floor(parseFloat(amountHuman) * 1e18)).toString();

    const calls: Call[] = [
      {
        contractAddress: DCA_ENGINE_ADDRESS,
        entrypoint: 'withdraw',
        calldata: [amountWei, '0'],
      },
    ];

    const tx = await account.execute(calls);
    return tx;
  };

  return { withdraw, account };
}

/**
 * Create a new DCA plan on-chain.
 */
export function useCreatePlan() {
  const { account } = useAccount();

  const createPlan = async (
    amountPerExecutionHuman: string,
    totalExecutions: number,
    intervalSeconds: number,
  ) => {
    if (!account) throw new Error('Wallet not connected');

    const amountWei = BigInt(Math.floor(parseFloat(amountPerExecutionHuman) * 1e18)).toString();

    const calls: Call[] = [
      {
        contractAddress: DCA_ENGINE_ADDRESS,
        entrypoint: 'create_plan',
        calldata: [
          amountWei,
          '0', // u256 high
          totalExecutions.toString(),
          intervalSeconds.toString(),
        ],
      },
    ];

    const tx = await account.execute(calls);
    return tx;
  };

  return { createPlan, account };
}

/**
 * Cancel an existing DCA plan.
 */
export function useCancelPlan() {
  const { account } = useAccount();

  const cancelPlan = async (planId: number | bigint) => {
    if (!account) throw new Error('Wallet not connected');

    const calls: Call[] = [
      {
        contractAddress: DCA_ENGINE_ADDRESS,
        entrypoint: 'cancel_plan',
        calldata: [planId.toString()],
      },
    ];

    const tx = await account.execute(calls);
    return tx;
  };

  return { cancelPlan, account };
}

/**
 * Approve USDT spending for the DCA engine (standalone).
 * Useful when the user wants to set a large approval once.
 */
export function useApproveUsdt() {
  const { account } = useAccount();

  const approve = async (amountHuman: string) => {
    if (!account) throw new Error('Wallet not connected');

    const amountWei = BigInt(Math.floor(parseFloat(amountHuman) * 1e18)).toString();

    const calls: Call[] = [
      {
        contractAddress: USDT_TOKEN_ADDRESS,
        entrypoint: 'approve',
        calldata: [DCA_ENGINE_ADDRESS, amountWei, '0'],
      },
    ];

    const tx = await account.execute(calls);
    return tx;
  };

  return { approve, account };
}
