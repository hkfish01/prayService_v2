import React from "react";
import Image from "next/image";
import { connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";

interface Transaction {
  requester: string;
  isCompleted: boolean;
  amount?: string;
  provider?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export default function PurchaseCard({
  purchase,
  confirmService,
  wallet
}: {
  purchase: Record<string, unknown> & { service: Record<string, unknown>; transaction: Transaction; transactionId: string | number };
  confirmService: (transactionId: string | number) => Promise<void>;
  wallet: string | null;
}) {
  const t = purchase.transaction;
  const s = purchase.service;

  const [cancelling, setCancelling] = React.useState(false);
  const handleCancel = async () => {
    const reason = window.prompt('Please enter the reason for cancellation (optional):');
    if (reason === null) return;
    setCancelling(true);
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      await contract.cancelTransaction(purchase.transactionId, reason || '');
      alert('Order cancelled and refunded.');
    } catch (err: unknown) {
      alert('Cancel failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setCancelling(false);
  };

  // 根据分类设置默认图片
  const getDefaultImage = (category: string) => {
    if (!category) return '/default.jpg';
    // 將空格轉為下劃線，並轉小寫
    const fileName = category.trim().toLowerCase().replace(/\s+/g, '_');
    return `/${fileName}.jpg`;
  };

  const imageUrl = s && typeof s.imageUrl === 'string' && s.imageUrl !== 'NA'
    ? s.imageUrl
    : getDefaultImage(String(s?.category));

  // DEBUG: 輸出按鈕顯示條件
  console.log('DEBUG Confirm Button:', { wallet, requester: t.requester, isCompleted: t.isCompleted });

  return (
    <div style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px" }}>
      <Image 
        src={imageUrl}
        alt={String(s?.title) || 'No Title'}
        width={400}
        height={200}
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
      <h3 style={{margin:'10px 0px'}}>{String(s?.title) || 'No Title'}</h3>
      <p style={{margin:'10px 0px'}}>{String(s?.description) || 'No Description'}</p>
      <p style={{margin:'10px 0px'}}>Price: {s?.price ? (Number(s.price as string) / 1e18).toFixed(4) : '0.0000'} BNB</p>
      <p style={{margin:'10px 0px'}}>Requester: {t.requester ? String(t.requester).slice(0, 6) + '...' + String(t.requester).slice(-4) : ''}</p>
      <p style={{margin:'10px 0px'}}>Provider: {t.provider ? String(t.provider).slice(0, 6) + '...' + String(t.provider).slice(-4) : ''}</p>
      <p style={{margin:'10px 0px'}}>Time: {t.timestamp ? new Date(Number(t.timestamp) * 1000).toLocaleString() : ''}</p>
      <p style={{margin:'10px 0px', color: t.isCancelled ? '#888' : (t.isCompleted ? 'green' : 'red')}}>
        Status: {t.isCancelled ? 'Cancelled' : (t.isCompleted ? 'Completed' : 'Pending')}
      </p>
      {/* Ancestor info */}
      {t.ancestorInfo && String(t.ancestorInfo).split('|').some(v => v) ? (() => {
        const [name, birthPlace, birthDate, deadDate] = String(t.ancestorInfo).split('|');
        return (
          <div style={{margin:'10px 0px', background:'#f7f7f7', borderRadius:4, padding:8}}>
            <div style={{fontWeight:'bold', marginBottom:4}}>Ancestor Info</div>
            {name && <div>Name: {name}</div>}
            {birthPlace && <div>Place of Birth: {birthPlace}</div>}
            {birthDate && <div>Birth Date: {birthDate}</div>}
            {deadDate && <div>Dead Date: {deadDate}</div>}
          </div>
        );
      })() : null}
      {t && typeof t.requester === 'string' &&
        t.requester.toLowerCase() === wallet?.toLowerCase() &&
        !t.isCompleted && !t.isCancelled ? (
          <button 
            onClick={() => confirmService(purchase.transactionId as string)} 
            style={{ color: 'white', marginTop: 8, padding: '8px 16px', cursor: 'pointer' }}>
            Confirm the Service
          </button>
        ) : null}
      {t && typeof t.requester === 'string' &&
        t.requester.toLowerCase() === wallet?.toLowerCase() &&
        !t.isCompleted && !t.isCancelled ? (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{ color: 'white', background:'#d9534f', marginTop: 8, padding: '8px 16px', cursor: 'pointer', marginLeft: 8 }}>
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        ) : null}
    </div>
  );
}
