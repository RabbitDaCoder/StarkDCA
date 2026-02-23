'use client';

import { ReactNode } from 'react';
import { sepolia } from '@starknet-react/chains';
import { StarknetConfig, jsonRpcProvider, voyager } from '@starknet-react/core';
import { InjectedConnector } from 'starknetkit/injected';
import { ArgentMobileConnector } from 'starknetkit/argentMobile';
import { WebWalletConnector } from 'starknetkit/webwallet';
import { STARKNET_RPC_URL } from '@/constants';
import { WalletSync } from './WalletSync';

// RPC provider — Sepolia
function rpc() {
  return { nodeUrl: STARKNET_RPC_URL };
}

// Available wallet connectors (cast to any to bridge starknetkit ↔ starknet-react types)
const connectors = [
  new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
  new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
  new ArgentMobileConnector(),
  new WebWalletConnector({ url: 'https://web.argent.xyz' }),
] as any;

interface StarknetProviderProps {
  children: ReactNode;
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={jsonRpcProvider({ rpc })}
      connectors={connectors}
      explorer={voyager}
      autoConnect
    >
      <WalletSync />
      {children}
    </StarknetConfig>
  );
}
