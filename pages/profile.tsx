import React, { useEffect, useState, useRef } from "react";
import { getProvider, connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import WalletConnect from "../components/WalletConnect";
import ServiceCard from "../components/ServiceCard";
import RequestCard from "../components/RequestCard";
import PurchaseCard from "../components/PurchaseCard";

interface Transaction {
  requester: string;
  isCompleted: boolean;
  isCancelled: boolean;
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

  // 區塊ref
  const myRequestRef = useRef<HTMLDivElement | null>(null);
  const myProvidedServiceRef = useRef<HTMLDivElement | null>(null);
  const myPendingRequestRef = useRef<HTMLDivElement | null>(null);
  const myPendingServicesRef = useRef<HTMLDivElement | null>(null);

  // 手機判斷
  const [isMobile, setIsMobile] = useState(false);
  const [myRequestStatus, setMyRequestStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [myServiceStatus, setMyServiceStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 跳轉函數
  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    // 自動恢復 wallet
    const w = localStorage.getItem('wallet');
    if (w) setWallet(w);
  }, []);

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
      {/* 手機版跳轉菜單 */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '16px 0' }}>
          <button style={{ padding: 8, borderRadius: 6 }} onClick={() => scrollToRef(myRequestRef)}>My Request</button>
          <button style={{ padding: 8, borderRadius: 6 }} onClick={() => scrollToRef(myProvidedServiceRef)}>My Provided Service</button>
          <button style={{ padding: 8, borderRadius: 6 }} onClick={() => scrollToRef(myPendingRequestRef)}>My Pending Request</button>
          <button style={{ padding: 8, borderRadius: 6 }} onClick={() => scrollToRef(myPendingServicesRef)}>My Pending Services</button>
        </div>
      )}
      {wallet && (
        <>
          <h2 ref={myRequestRef} style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginLeft:10 }}>My Joss Paper Burning Service Requests</h2>
          <div style={{ 
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            maxWidth: 1240,
            margin: '0 auto',
          }}>
            {requests.map((r) => (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 10px', maxWidth: 300, width: '100%' }} key={String(r.id)}>
                <RequestCard request={r} wallet={wallet} />
              </div>
            ))}
          </div>
          <h2 ref={myProvidedServiceRef} style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginLeft:10 }}>My Provided Joss Paper Burning Service</h2>
          <div style={{ 
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            maxWidth: 1240,
            margin: '0 auto',
          }}>
            {services.map((s) => (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 10px', maxWidth: 300, width: '100%' }} key={String(s.id)}>
                <ServiceCard service={s} wallet={wallet} />
              </div>
            ))}
          </div>

          {/* 新增分組：My Requests（我購買的服務）和 My Services（我提供的服務） */}
          {(() => {
            const walletLower = wallet?.toLowerCase();
            const myRequests = purchasedServices.filter(item => {
              const isMine = typeof item.transaction?.requester === 'string' && item.transaction.requester.toLowerCase() === walletLower;
              if (!isMine) return false;
              if (myRequestStatus === 'all') return true;
              if (myRequestStatus === 'completed') return item.transaction.isCompleted;
              if (myRequestStatus === 'pending') return !item.transaction.isCompleted && !item.transaction.isCancelled;
              if (myRequestStatus === 'cancelled') return item.transaction.isCancelled;
              return false;
            });
            const myServices = purchasedServices.filter(item => {
              const isMine = typeof item.transaction?.provider === 'string' && item.transaction.provider.toLowerCase() === walletLower;
              if (!isMine) return false;
              if (myServiceStatus === 'all') return true;
              if (myServiceStatus === 'completed') return item.transaction.isCompleted;
              if (myServiceStatus === 'pending') return !item.transaction.isCompleted && !item.transaction.isCancelled;
              if (myServiceStatus === 'cancelled') return item.transaction.isCancelled;
              return false;
            });
            return (
              <>
                <h2 ref={myPendingRequestRef} style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginLeft:10 }}>
                  My Joss Paper Burning Service Requests
                  <select value={myRequestStatus} onChange={e => setMyRequestStatus(e.target.value as 'all' | 'completed' | 'pending' | 'cancelled')} style={{ color:'#000', marginLeft:12, padding:2, borderRadius:4}}>
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </h2>
                {myRequests.length === 0 && (
                  <div style={{ color: 'yellow', margin: 16 }}>No purchased services found.</div>
                )}
                <div style={{
                  display: 'grid',
                  gap: 16,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  maxWidth: 1240,
                  margin: '0 auto',
                }}>
                  {myRequests.map((service) => (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '0 10px', maxWidth: 300, width: '100%' }} key={String(service.transactionId)}>
                      <PurchaseCard 
                        purchase={service} 
                        confirmService={confirmService} 
                        wallet={wallet}
                      />
                    </div>
                  ))}
                </div>
                <h2 ref={myPendingServicesRef} style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF", marginLeft:10 }}>
                  My Joss Paper Burning Service
                  <select value={myServiceStatus} onChange={e => setMyServiceStatus(e.target.value as 'all' | 'completed' | 'pending' | 'cancelled')} style={{ color:'#000', marginLeft:12, padding:2, borderRadius:4}}>
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </h2>
                {myServices.length === 0 && (
                  <div style={{ color: 'yellow', margin: 16 }}>No provided services found.</div>
                )}
                <div style={{
                  display: 'grid',
                  gap: 16,
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  maxWidth: 1240,
                  margin: '0 auto',
                }}>
                  {myServices.map((service) => (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '0 10px', maxWidth: 300, width: '100%' }} key={String(service.transactionId)}>
                      <PurchaseCard 
                        purchase={service} 
                        confirmService={confirmService} 
                        wallet={wallet}
                      />
                    </div>
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
