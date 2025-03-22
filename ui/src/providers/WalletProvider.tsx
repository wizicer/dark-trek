import React, { useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../contexts/WalletContext';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Using type assertion for ethereum
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ethersProvider = new ethers.BrowserProvider(window.ethereum as any);
          setProvider(ethersProvider);
          
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
            const ethersSigner = await ethersProvider.getSigner();
            setSigner(ethersSigner);
          }
        } catch (error) {
          console.error("Failed to check connection:", error);
        }
      }
    };
    
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on?.('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
          setSigner(null);
        }
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask to connect.");
      return;
    }

    setIsConnecting(true);
    
    try {
      // Using type assertion for ethereum
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethersProvider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(ethersProvider);
      
      if (window.ethereum.request) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }
      
      const accounts = await ethersProvider.listAccounts();
      
      if (accounts.length > 0) {
        setAddress(accounts[0].address);
        const ethersSigner = await ethersProvider.getSigner();
        setSigner(ethersSigner);
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      alert("Failed to connect to MetaMask");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <WalletContext.Provider value={{ address, provider, signer, isConnecting, connect }}>
      {children}
    </WalletContext.Provider>
  );
};
