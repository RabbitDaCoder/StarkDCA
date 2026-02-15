import { connect as starknetConnect, disconnect as starknetDisconnect } from 'get-starknet-core';

export async function connectWallet(): Promise<string | null> {
  try {
    const wallet = await starknetConnect();
    if (wallet && wallet.selectedAddress) {
      window.__STARK_DCA_WALLET_ADDRESS__ = wallet.selectedAddress;
      return wallet.selectedAddress;
    }
    return null;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    return null;
  }
}

export function disconnectWallet(): void {
  starknetDisconnect();
  window.__STARK_DCA_WALLET_ADDRESS__ = undefined;
}
