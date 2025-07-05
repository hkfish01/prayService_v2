import React, { useState } from "react";
import { connectWallet } from "../libs/web3";

function WalletConnect({ onConnected }: { onConnected: (address: string) => void }) {
  const [address, setAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      const signer = await connectWallet();
      const address = await signer.getAddress();
      setAddress(address);
      onConnected(address);
    } catch {
      alert("Wallet connect fail.");
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {address ? ( 
        <div style={{ animation: 'pulse 2s infinite ease-in-out', color: '#ffffff', fontSize: '16px' }}>
          <span>已连接: {address.slice(0, 6)}...{address.slice(-4)}</span>
          <p>Wallet connected.</p>
        </div>
      ) : ( 
        <> 
          <button 
            onClick={handleConnect}
            style={{ 
              animation: 'pulse 2s infinite ease-in-out',
              padding: '10px 20px',
              fontSize: '16px',
              color: '#ffffff'
            }}
          >
            Connect Wallet
          </button>
          <p style={{ color: '#ffffff', fontSize: '14px', marginTop: '10px' }}>After you connect your wallet, you can order below service.</p>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
