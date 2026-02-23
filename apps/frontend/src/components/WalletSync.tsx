/**
 * WalletSync — bridges @starknet-react/core account state into the Zustand
 * wallet store so that existing components (Navbar, Dashboard, etc.) that use
 * `useWalletStore` continue to work seamlessly.
 *
 * Render this component once inside the StarknetProvider tree.
 */
import { useEffect } from 'react';
import { useAccount } from '@starknet-react/core';
import { useWalletStore } from '@/store/wallet.store';

export function WalletSync() {
  const { address, status } = useAccount();
  const syncFromProvider = useWalletStore((s) => s.syncFromProvider);

  useEffect(() => {
    syncFromProvider(address);
  }, [address, status, syncFromProvider]);

  return null; // render nothing
}
