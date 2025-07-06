import React, { useState, useEffect } from "react";
import { connectWallet } from "../libs/web3";

// 定義 EthereumProvider 型別
interface EthereumProvider {
  request: (args: { method: string }) => Promise<any>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

function WalletConnect({ onConnected }: { onConnected: (address: string) => void }) {
  const [address, setAddress] = useState<string | null>(null);

  // 檢查當前連接狀態
  const checkWallet = async () => {
    if (typeof window === "undefined" || !(window.ethereum as EthereumProvider)) return;
    try {
      const accounts = await (window.ethereum as EthereumProvider).request({ method: 'eth_accounts' }) as string[];
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
    const eth = window.ethereum as EthereumProvider;
    if (eth && eth.on) {
      eth.on('accountsChanged', checkWallet);
    }
    return () => {
      if (eth && eth.removeListener) {
        eth.removeListener('accountsChanged', checkWallet);
      }
    };
  }, [onConnected, checkWallet]);

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
