import { createContext } from 'react';
import { ethers } from 'ethers';

export interface WalletContextType {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
}

const defaultContext: WalletContextType = {
  address: null,
  provider: null,
  signer: null,
  isConnecting: false,
  connect: async () => {}
};

export const WalletContext = createContext<WalletContextType>(defaultContext);
