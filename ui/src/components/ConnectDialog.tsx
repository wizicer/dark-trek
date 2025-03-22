import React from 'react';

interface ConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  isConnecting: boolean;
}

export const ConnectDialog: React.FC<ConnectDialogProps> = ({
  isOpen,
  onClose,
  onConnect,
  isConnecting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl z-10 max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Connect to MetaMask</h2>
        <p className="text-gray-300 mb-6">
          Connect your MetaMask wallet to interact with the game and perform transactions.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};
