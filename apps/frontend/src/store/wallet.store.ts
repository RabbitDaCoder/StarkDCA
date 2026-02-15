import { create } from 'zustand';
import { connectWallet, disconnectWallet } from '@/services/blockchain/wallet';

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
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

  disconnect: () => {
    disconnectWallet();
    set({ address: null, connected: false });
  },
}));
