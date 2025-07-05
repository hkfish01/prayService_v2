import { BrowserProvider } from "ethers";

export async function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    const provider = new BrowserProvider((window as any).ethereum);
    return provider;
  }
  throw new Error("Please install MetaMask");
}

export async function connectWallet() {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return signer;
}