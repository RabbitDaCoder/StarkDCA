// ─── Starknet Service ────────────────────────────────────────────────
// Abstraction over Starknet.js for contract interactions.

import { RpcProvider, Account, Contract } from 'starknet';
import { config } from '../../config';
import { logger } from '../../infrastructure/logger';

let provider: RpcProvider | null = null;
let executorAccount: Account | null = null;

export function getProvider(): RpcProvider {
  if (!provider) {
    provider = new RpcProvider({ nodeUrl: config.starknet.rpcUrl });
  }
  return provider;
}

export function getExecutorAccount(): Account {
  if (!executorAccount) {
    const p = getProvider();
    executorAccount = new Account(
      p,
      config.starknet.executorAddress,
      config.starknet.executorPrivateKey,
    );
  }
  return executorAccount;
}

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
