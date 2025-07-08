"use client";
import React, { useEffect, useState, useRef } from "react";
import { getProvider, connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import WalletConnect from "../components/WalletConnect";
import ServiceCard from "../components/ServiceCard";
import RequestCard from "../components/RequestCard";
import PurchaseCard from "../components/PurchaseCard";

// Remove the import of Pool from 'pg'

interface Transaction {
  requester: string;
  isCompleted: boolean;
  isCancelled: boolean;
  [key: string]: unknown;
}                                                                                 

// Define server action
const submitReview = async (transactionId: string | number, rating: number, comment: string) => {
  const { Pool } = await import('pg');
  try {
    const pool = new Pool({
      connectionString: 'postgresql://neondb_owner:npg_3SDLYaCTvZr8@ep-steep-recipe-ae1imiso-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    });
    
    await pool.query(
      'CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, transaction_id TEXT, rating INTEGER, comment TEXT)' 
    );
    
    await pool.query(
      'INSERT INTO reviews (transaction_id, rating, comment) VALUES ($1, $2, $3)',
      [transactionId, rating, comment]
    );
    
    await pool.end();
    
    console.log('Submit:', { rating, comment, transactionId });
    return true;
  } catch (error) {
    console.error('Submit Fail:', error);
    return false;
  }
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

  const ReviewModal = ({ isOpen, onClose, transactionId }: { isOpen: boolean; onClose: () => void; transactionId: string | number }) => {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    
    const handleSubmitReview = async () => {
      const success = await submitReview(transactionId, rating, comment);
      if (success) {
        alert('Submit Success!');
        onClose();
      } else {
        alert('Submit Fail');
      }
    };
    
    return (
      <div style={{ display: isOpen ? 'block' : 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
          <h3 style={{ marginBottom: '10px' }}>Please review the service</h3>
          <div style={{ marginBottom: '10px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer', color: star <= rating ? 'gold' : 'gray' }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please fill in the review (Max 200 words)"
            maxLength={200}
            style={{ width: '100%', height: '100px', marginBottom: '10px' }}
          />
          <div style={{ textAlign: 'right' }}>
            <button onClick={onClose} style={{ marginRight: '10px', padding: '5px 10px' }}>Cancel</button>
            <button onClick={handleSubmitReview} style={{ padding: '5px 10px' }}>Submit</button>
          </div>
        </div>
      </div>
    );
  };

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
      setShowReviewModal(true);
      setCurrentTransactionId(transactionId);
    } catch (err: unknown) {
      alert("Confirm the service failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | number | null>(null);

  const handleReviewClick = (transactionId: string | number) => {
    setShowReviewModal(true);
    setCurrentTransactionId(transactionId);
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: 20, fontSize: 24, fontWeight: "bold", color: "#FFFFFF" }}>Profile</h1>
      <WalletConnect onConnected={setWallet} />
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          transactionId={currentTransactionId || ''}
        />
      )}
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
                        wallet={wallet}
                        confirmService={confirmService}
                        onReviewClick={handleReviewClick}
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
                        onReviewClick={handleReviewClick}
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
