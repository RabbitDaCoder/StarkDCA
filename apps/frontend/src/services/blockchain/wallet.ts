import { connect, disconnect } from 'starknetkit';

/**
 * Connect wallet via starknetkit.
 *
 * The primary wallet interaction now goes through @starknet-react/core hooks
 * (useConnect / useDisconnect / useAccount) provided by StarknetProvider.
 *
 * This service is kept as a fallback and to power the x-starknet-address
 * header for the REST API layer.
 */
export async function connectWallet(): Promise<string | null> {
  try {
    const { wallet } = await connect();
    if (wallet?.selectedAddress) {
      window.__STARK_DCA_WALLET_ADDRESS__ = wallet.selectedAddress;
      return wallet.selectedAddress;
    }
    return null;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    return null;
  }
}

export async function disconnectWallet(): Promise<void> {
  await disconnect();
  window.__STARK_DCA_WALLET_ADDRESS__ = undefined;
}

/**
 * Sync the address header used by the API client when starknet-react manages
 * the connection. Call this from the wallet store whenever the address changes.
 */
export function syncWalletAddress(address: string | undefined): void {
  window.__STARK_DCA_WALLET_ADDRESS__ = address;
}
