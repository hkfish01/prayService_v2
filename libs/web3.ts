import { BrowserProvider } from "ethers";

export async function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const provider = new BrowserProvider((window as any).ethereum);
    return provider;
  }
  throw new Error("Please install MetaMask");
}

export async function connectWallet() {
  try {
    const provider = await getProvider();
    console.log('[connectWallet] provider loaded', provider);
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || !accounts[0]) {
      alert("Please check if you have authorized the wallet!");
      throw new Error("No wallet address returned");
    }
    const address = accounts[0];
    localStorage.setItem('wallet', address);
    const signer = await provider.getSigner();
    console.log('[connectWallet] connected address:', address);
    return signer;
  } catch (err) {
    console.error('[connectWallet] error:', err);
    alert("Connection failed, please check if you have installed MetaMask and authorized!");
    throw err;
  }
}