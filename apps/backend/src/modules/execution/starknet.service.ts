// ─── Starknet Service ────────────────────────────────────────────────
// Abstraction over Starknet.js for contract interactions.
// Provides typed methods for DCA Engine contract operations.
//
// The backend uses an "executor" account (a dedicated wallet with funds)
// to sign transactions. This is NOT the user's wallet — this is the
// automation wallet that the cron job uses to execute plans on-chain.

import { RpcProvider, Account, Contract, uint256, CallData } from 'starknet';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';
import { dcaEngineAbi } from './dca-engine.abi';

let provider: RpcProvider | null = null;
let executorAccount: Account | null = null;
let dcaContract: Contract | null = null;

// ─── Interval → seconds mapping (matches contract expectations) ──────
const INTERVAL_SECONDS: Record<string, number> = {
  DAILY: 86_400,
  WEEKLY: 604_800,
  BIWEEKLY: 1_209_600,
  MONTHLY: 2_592_000,
};

// ─── Provider & Account Singletons ───────────────────────────────────

export function getProvider(): RpcProvider {
  if (!provider) {
    provider = new RpcProvider({ nodeUrl: config.starknet.rpcUrl });
  }
  return provider;
}

export function getExecutorAccount(): Account {
  if (!executorAccount) {
    if (!config.starknet.executorAddress || !config.starknet.executorPrivateKey) {
      throw new Error(
        'Starknet executor not configured — set EXECUTOR_ADDRESS and EXECUTOR_PRIVATE_KEY',
      );
    }
    const p = getProvider();
    executorAccount = new Account(
      p,
      config.starknet.executorAddress,
      config.starknet.executorPrivateKey,
    );
  }
  return executorAccount;
}

function getDcaContract(): Contract {
  if (!dcaContract) {
    if (!config.starknet.contractAddress) {
      throw new Error('DCA contract address not configured — set DCA_CONTRACT_ADDRESS');
    }
    const account = getExecutorAccount();
    dcaContract = new Contract(dcaEngineAbi, config.starknet.contractAddress, account);
  }
  return dcaContract;
}

// ─── Check if on-chain integration is configured ─────────────────────

export function isStarknetConfigured(): boolean {
  return !!(
    config.starknet.contractAddress &&
    config.starknet.executorAddress &&
    config.starknet.executorPrivateKey
  );
}

// ─── Contract Write Methods ──────────────────────────────────────────

/**
 * Execute a DCA plan on-chain.
 * Called by the cron job. Only the executor account can call this.
 *
 * @param onChainPlanId — the plan ID on the contract (u64)
 * @param btcPriceWei — BTC price in wei (u256) with 18 decimals precision
 * @returns transaction hash
 */
export async function executeOnChainPlan(
  onChainPlanId: string | number,
  btcPriceWei: bigint,
): Promise<string> {
  try {
    const contract = getDcaContract();
    const result = await contract.invoke('execute_plan', [
      onChainPlanId,
      uint256.bnToUint256(btcPriceWei),
    ]);
    logger.info(
      { onChainPlanId, txHash: result.transaction_hash },
      'On-chain execute_plan submitted',
    );
    return result.transaction_hash;
  } catch (error) {
    logger.error({ err: error, onChainPlanId }, 'On-chain execute_plan failed');
    throw error;
  }
}

/**
 * Create a DCA plan on-chain.
 * Called when a user creates a plan via the API.
 *
 * NOTE: The contract's create_plan is called by the executor account,
 * not by the user's wallet. The contract returns a plan_id (u64).
 *
 * @returns the on-chain plan ID from the transaction receipt
 */
export async function createOnChainPlan(
  amountPerExecution: string,
  totalExecutions: number,
  interval: string,
): Promise<string | null> {
  try {
    const contract = getDcaContract();
    const intervalSeconds = INTERVAL_SECONDS[interval] || 86_400;

    // amountPerExecution is a string representing the amount in smallest unit
    const amountBigInt = BigInt(amountPerExecution);

    const result = await contract.invoke('create_plan', [
      uint256.bnToUint256(amountBigInt),
      totalExecutions,
      intervalSeconds,
    ]);

    logger.info(
      { txHash: result.transaction_hash, interval, totalExecutions },
      'On-chain create_plan submitted',
    );

    // Wait for the transaction to be accepted to extract the plan_id from events
    const p = getProvider();
    const receipt = await p.waitForTransaction(result.transaction_hash);

    // Extract plan_id from the PlanCreated event
    const planCreatedEvent = (receipt as any).events?.find(
      (e: any) =>
        e.keys?.length > 0 &&
        // Event selector varies — look for our event by checking if we can
        // find a plan_id in the data
        e.data?.length >= 3,
    );

    if (planCreatedEvent?.keys?.[1]) {
      // keys[0] = event selector, keys[1] = plan_id (keyed field)
      const planId = BigInt(planCreatedEvent.keys[1]).toString();
      logger.info(
        { onChainPlanId: planId, txHash: result.transaction_hash },
        'Plan created on-chain',
      );
      return planId;
    }

    // Fallback: we know the tx succeeded but couldn't extract plan_id
    logger.warn(
      { txHash: result.transaction_hash },
      'create_plan succeeded but could not extract plan_id from events',
    );
    return null;
  } catch (error) {
    logger.error({ err: error }, 'On-chain create_plan failed');
    throw error;
  }
}

/**
 * Cancel a DCA plan on-chain.
 *
 * @param onChainPlanId — the plan ID on the contract (u64)
 * @returns transaction hash
 */
export async function cancelOnChainPlan(onChainPlanId: string | number): Promise<string> {
  try {
    const contract = getDcaContract();
    const result = await contract.invoke('cancel_plan', [onChainPlanId]);
    logger.info(
      { onChainPlanId, txHash: result.transaction_hash },
      'On-chain cancel_plan submitted',
    );
    return result.transaction_hash;
  } catch (error) {
    logger.error({ err: error, onChainPlanId }, 'On-chain cancel_plan failed');
    throw error;
  }
}

// ─── Contract Read Methods ───────────────────────────────────────────

/**
 * Read a plan's data from the contract.
 */
export async function readOnChainPlan(onChainPlanId: string | number): Promise<any> {
  try {
    const contract = getDcaContract();
    const result = await contract.call('get_plan', [onChainPlanId]);
    return result;
  } catch (error) {
    logger.error({ err: error, onChainPlanId }, 'On-chain get_plan read failed');
    throw error;
  }
}

/**
 * Check if the contract is paused.
 */
export async function isContractPaused(): Promise<boolean> {
  try {
    const contract = getDcaContract();
    const result = await contract.call('is_paused', []);
    return !!result;
  } catch (error) {
    logger.error({ err: error }, 'On-chain is_paused read failed');
    throw error;
  }
}

// ─── Generic callContract (kept for backward compatibility) ──────────

export async function callContract(
  contractAddress: string,
  abi: any[],
  method: string,
  calldata: any[],
): Promise<any> {
  try {
    const account = getExecutorAccount();
    const contract = new Contract(abi, contractAddress, account);
    const result = await contract.invoke(method, calldata);
    logger.info({ method, txHash: result.transaction_hash }, 'Contract call executed');
    return result;
  } catch (error) {
    logger.error({ err: error, method }, 'Contract call failed');
    throw error;
  }
}
