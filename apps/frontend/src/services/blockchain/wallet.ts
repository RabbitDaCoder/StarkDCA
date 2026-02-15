import { connect, disconnect } from 'starknetkit';

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
