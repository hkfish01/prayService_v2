import React, { useEffect, useState } from "react";
import { getProvider, connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import ProfileInfo from "../components/ProfileInfo";
import WalletConnect from "../components/WalletConnect";

interface Transaction {
  requester: string;
  isCompleted: boolean;
  [key: string]: unknown;
}

export default function Profile() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [purchasedServices, setPurchasedServices] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!wallet) return;
    async function fetchProfile() {
      const provider = await getProvider();
      const contract = getContract(provider);
      const reqIds = await contract.getUserRequests(wallet);
      const srvIds = await contract.getUserServices(wallet);
      const transactionIds = await contract.getUserTransactions(wallet);
      const reqs = [];
      for (const id of reqIds) {
        const r = await contract.requests(id);
        reqs.push(r);
      }
      const srvs = [];
      for (const id of srvIds) {
        const s = await contract.services(id);
        srvs.push(s);
      }
      const purchasedSrvs = [];
      for (const id of transactionIds) {
        const transaction = await contract.transactions(id);
        const ps = await contract.services(transaction.serviceId);
        purchasedSrvs.push({ ...ps, transactionId: id, transaction });
      }
      setRequests(reqs);
      setServices(srvs);
      setPurchasedServices(purchasedSrvs);
    }
    fetchProfile();
  }, [wallet]);

  const confirmService = async (transactionId: string | number) => {
    if (!wallet) return alert("Please connect your wallet first.");
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      await contract.confirmService(transactionId);
      alert("Confirm the service successfully, the funds have been transferred.");
      // 刷新已購買服務列表
      const provider = await getProvider();
      const updatedContract = getContract(provider);
      const transactionIds = await updatedContract.getUserTransactions(wallet);
      const purchasedSrvs = [];
      for (const id of transactionIds) {
        const transaction = await updatedContract.transactions(id);
        const ps = await updatedContract.services(transaction.serviceId);
        purchasedSrvs.push({ ...ps, transactionId: id, transaction });
      }
      setPurchasedServices(purchasedSrvs);
    } catch (err: unknown) {
      alert("Confirm the service failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: 20, fontSize: 24, fontWeight: "bold", color: "#FFFFFF" }}>Profile</h1>
      <WalletConnect onConnected={setWallet} />
      {wallet && (
        <> 
          <ProfileInfo wallet={wallet} requests={requests} services={services} />
          <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>Confirmed Services</h2>
          <ul>
            {purchasedServices.map((service) => {
              const s = service as Record<string, unknown>;
              return (
                <li style={{ color: "#FFFFFF" }} key={s.id as string}>
                  <p style={{ color: "#FFFFFF" }}>{s.title as string}</p>
                  <p style={{ color: "#FFFFFF" }}>Price: {s.price ? Number(s.price as string) / 1e18 : 0} BNB</p>
                  {(() => {
                    const t = s.transaction as Transaction;
                    return t && typeof t.requester === 'string' &&
                      t.requester.toLowerCase() === wallet?.toLowerCase() &&
                      !t.isCompleted ? (
                        <button onClick={() => confirmService(s.transactionId as string)}>Confirm the Service</button>
                      ) : null;
                  })()}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
