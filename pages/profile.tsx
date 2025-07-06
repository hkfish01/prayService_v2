import React, { useEffect, useState } from "react";
import { getProvider, connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import WalletConnect from "../components/WalletConnect";
import ServiceCard from "../components/ServiceCard";
import RequestCard from "../components/RequestCard";
import PurchaseCard from "../components/PurchaseCard";

interface Transaction {
  requester: string;
  isCompleted: boolean;
  [key: string]: unknown;
}

export default function Profile() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [purchasedServices, setPurchasedServices] = useState<{
    service: Record<string, unknown>;
    transaction: Transaction;
    transactionId: string | number;
  }[]>([]);

  useEffect(() => {
    if (!wallet) return;
    async function fetchProfile() {
      const provider = await getProvider();
      const contract = getContract(provider);
      const reqIds = await contract.getUserRequests(wallet);
      const srvIds = await contract.getUserServices(wallet);
      const transactionIds = await contract.getUserTransactions(wallet);
      console.log('transactionIds', transactionIds);
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
        console.log('transaction', transaction);
        const ps = await contract.services(transaction.serviceId);
        purchasedSrvs.push({ service: ps, transactionId: id, transaction });
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
        purchasedSrvs.push({ service: ps, transactionId: id, transaction });
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
          <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>My Requests</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 16 
          }}>
            {requests.map((r) => (
              <RequestCard key={String(r.id)} request={r} />
            ))}
          </div>
          <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>My Provided Services</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 16 
          }}>
            {services.map((s) => (
              <ServiceCard key={String(s.id)} service={s} wallet={wallet} />
            ))}
          </div>

          {/* 新增分組：My Requests（我購買的服務）和 My Services（我提供的服務） */}
          {(() => {
            const walletLower = wallet?.toLowerCase();
            const myRequests = purchasedServices.filter(
              (item) => typeof item.transaction?.requester === 'string' && item.transaction.requester.toLowerCase() === walletLower
            );
            const myServices = purchasedServices.filter(
              (item) => typeof item.transaction?.provider === 'string' && item.transaction.provider.toLowerCase() === walletLower
            );
            return (
              <>
                <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>My Pending Requests (我購買中的服務)</h2>
                {myRequests.length === 0 && (
                  <div style={{ color: 'yellow', margin: 16 }}>No purchased services found.</div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {myRequests.map((service) => (
                    <PurchaseCard 
                      key={String(service.transactionId)} 
                      purchase={service} 
                      confirmService={confirmService} 
                      wallet={wallet}
                    />
                  ))}
                </div>
                <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>My Pending Services (我提供的服務)</h2>
                {myServices.length === 0 && (
                  <div style={{ color: 'yellow', margin: 16 }}>No provided services found.</div>
                )}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {myServices.map((service) => (
                    <PurchaseCard 
                      key={String(service.transactionId)} 
                      purchase={service} 
                      confirmService={confirmService} 
                      wallet={wallet}
                    />
                  ))}
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
