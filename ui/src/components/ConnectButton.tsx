import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ConnectDialog } from './ConnectDialog';

export const ConnectButton: React.FC = () => {
  const { address, connect, isConnecting } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnectClick = () => {
    setIsDialogOpen(true);
  };

  const handleConnect = async () => {
    await connect();
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        {address ? (
          <div className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </div>
        ) : (
          <button
            onClick={handleConnectClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-lg"
          >
            Connect
          </button>
        )}
      </div>
      
      <ConnectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConnect={handleConnect}
        isConnecting={isConnecting}
      />
    </>
  );
};
