/**
 * useStarknetConnect — unified wallet connection hook.
 *
 * Opens starknetkit's built-in modal popup (nice UI showing Argent + Braavos)
 * AND connects through @starknet-react/core so all contract hooks work.
 *
 * Usage:
 *   const { address, isConnected, isConnecting, connect, disconnect } = useStarknetConnect();
 */
import { useCallback, useState } from 'react';
import { useConnect, useDisconnect, useAccount } from '@starknet-react/core';
import { connect as starknetkitConnect, disconnect as starknetkitDisconnect } from 'starknetkit';

export function useStarknetConnect() {
  const { connect: reactConnect, connectors } = useConnect();
  const { disconnect: reactDisconnect } = useDisconnect();
  const { address, status } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = status === 'connected' && !!address;

  /**
   * Opens the starknetkit wallet-picker modal, then tells @starknet-react/core
   * about the chosen connector so useAccount / useReadContract / etc. all work.
   */
  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // 1. Show the starknetkit modal — user picks Argent or Braavos
      const result = await starknetkitConnect({
        connectors: connectors as any,
      });

      if (result?.connector) {
        // 2. Feed the selected connector into @starknet-react/core
        reactConnect({ connector: result.connector as any });
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [connectors, reactConnect]);

  /**
   * Disconnect from both starknetkit and @starknet-react/core.
   */
  const disconnect = useCallback(async () => {
    reactDisconnect();
    await starknetkitDisconnect();
  }, [reactDisconnect]);

  return {
    address: address ?? null,
    isConnected,
    isConnecting: isConnecting || status === 'connecting' || status === 'reconnecting',
    connect,
    disconnect,
  };
}
