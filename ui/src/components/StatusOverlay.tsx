import React from 'react';

interface StatusOverlayProps {
  message: string;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({ message }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{ color: '#fff', fontSize: '2rem', textAlign: 'center' }}>
        {message}
      </div>
    </div>
  );
};
