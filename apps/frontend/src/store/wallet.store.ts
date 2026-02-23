import { create } from 'zustand';
import { connectWallet, disconnectWallet, syncWalletAddress } from '@/services/blockchain/wallet';

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Sync address from starknet-react useAccount hook */
  syncFromProvider: (address: string | undefined) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  connected: false,
  connecting: false,

  connect: async () => {
    set({ connecting: true });
    const address = await connectWallet();
    if (address) {
      set({ address, connected: true, connecting: false });
    } else {
      set({ connecting: false });
    }
  },

  disconnect: async () => {
    await disconnectWallet();
    set({ address: null, connected: false });
  },

  syncFromProvider: (address: string | undefined) => {
    syncWalletAddress(address);
    if (address) {
      set({ address, connected: true, connecting: false });
    } else {
      set({ address: null, connected: false, connecting: false });
    }
  },
}));
