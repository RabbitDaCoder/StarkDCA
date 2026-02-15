import { RpcProvider, Account, Contract } from 'starknet';
import { config } from '../config';
import { logger } from '../utils/logger';

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
    logger.info(`Contract call ${method} tx: ${result.transaction_hash}`);
    return result;
  } catch (error) {
    logger.error(`Contract call ${method} failed`, error);
    throw error;
  }
}
