import React from "react";
import Image from "next/image";

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
  wallet, 
  onReviewClick 
}: { 
  purchase: Record<string, unknown> & { service: Record<string, unknown>; transaction: Transaction; transactionId: string | number }; 
  confirmService: (transactionId: string | number) => Promise<void>; 
  wallet: string | null; 
  onReviewClick: (transactionId: string | number) => void; 
}) { 
  // 根据分类设置默认图片
  const getDefaultImage = (category: string) => {
    if (!category) return '/default.jpg';
    // 將空格轉為下劃線，並轉小寫
    const fileName = category.trim().toLowerCase().replace(/\s+/g, '_');
    return `/${fileName}.jpg`;
  };

  const imageUrl = purchase.service && typeof purchase.service.imageUrl === 'string' && purchase.service.imageUrl !== 'NA'
    ? purchase.service.imageUrl
    : getDefaultImage(String(purchase.service?.category));

  // DEBUG: 輸出按鈕顯示條件
  console.log('DEBUG Confirm Button:', { wallet: wallet, requester: purchase.transaction.requester, isCompleted: purchase.transaction.isCompleted });

  return (
    <div style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px" }}>
      <Image 
        src={imageUrl}
        alt={String(purchase.service?.title) || 'No Title'}
        width={400}
        height={200}
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
      <h3 style={{margin:'10px 0px'}}>{String(purchase.service?.title) || 'No Title'}</h3>
      <p style={{margin:'10px 0px'}}>{String(purchase.service?.description) || 'No Description'}</p>
      <p style={{margin:'10px 0px'}}>Price: {purchase.service?.price ? (Number(purchase.service.price as string) / 1e18).toFixed(4) : '0.0000'} BNB</p>
      <p style={{margin:'10px 0px'}}>Requester: {purchase.transaction.requester ? String(purchase.transaction.requester).slice(0, 6) + '...' + String(purchase.transaction.requester).slice(-4) : ''}</p>
      <p style={{margin:'10px 0px'}}>Provider: {purchase.transaction.provider ? String(purchase.transaction.provider).slice(0, 6) + '...' + String(purchase.transaction.provider).slice(-4) : ''}</p>
      <p style={{margin:'10px 0px'}}>Time: {purchase.transaction.timestamp ? new Date(Number(purchase.transaction.timestamp) * 1000).toLocaleString() : ''}</p>
      <p style={{margin:'10px 0px', color: purchase.transaction.isCancelled ? '#888' : (purchase.transaction.isCompleted ? 'green' : 'red')}}>
        Status: {purchase.transaction.isCancelled ? 'Cancelled' : (purchase.transaction.isCompleted ? 'Completed' : 'Pending')}
      </p>
      {/* Ancestor info */}
      {purchase.transaction.ancestorInfo && String(purchase.transaction.ancestorInfo).split('|').some(v => v) ? (() => {
        const [name, birthPlace, birthDate, deadDate] = String(purchase.transaction.ancestorInfo).split('|');
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
      {purchase.transaction && typeof purchase.transaction.requester === 'string' &&
        purchase.transaction.requester.toLowerCase() === wallet?.toLowerCase() &&
        purchase.transaction.isCompleted ? (
          <button
            onClick={() => onReviewClick(purchase.transactionId)}
            style={{ color: 'white', background: '#5cb85c', marginTop: 8, padding: '8px 16px', cursor: 'pointer', marginLeft: 8 }}
          >
            Review
          </button>
        ) : null}
    </div>
  );
}
