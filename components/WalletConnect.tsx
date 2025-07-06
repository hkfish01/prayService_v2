import React, { useState, useEffect } from "react";
import { connectWallet } from "../libs/web3";

function WalletConnect({ onConnected }: { onConnected: (address: string) => void }) {
  const [address, setAddress] = useState<string | null>(null);

  // 檢查當前連接狀態
  const checkWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
        localStorage.setItem('wallet', accounts[0]);
        onConnected(accounts[0]);
      } else {
        setAddress(null);
        localStorage.removeItem('wallet');
        onConnected("");
      }
    } catch {
      setAddress(null);
      localStorage.removeItem('wallet');
      onConnected("");
    }
  };

  useEffect(() => {
    checkWallet();
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', checkWallet);
    }
    return () => {
      if ((window as any).ethereum && (window as any).ethereum.removeListener) {
        (window as any).ethereum.removeListener('accountsChanged', checkWallet);
      }
    };
  }, [onConnected]);

  const handleConnect = async () => {
    try {
      const signer = await connectWallet();
      const address = await signer.getAddress();
      setAddress(address);
      localStorage.setItem('wallet', address);
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
