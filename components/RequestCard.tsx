import React, { useState } from "react";
import Image from "next/image";
import { connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import { useRouter } from "next/router";

export default function RequestCard({ request, wallet }: { request: Record<string, unknown>, wallet: string | null }) {
  const [closing, setClosing] = useState(false);
  const router = useRouter();

  const handleCloseRequest = async () => {
    if (!window.confirm('Are you sure to close this request?')) return;
    setClosing(true);
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      await contract.deactivateRequest(request.id);
      alert('Request closed successfully.');
    } catch (err: unknown) {
      alert('Close failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setClosing(false);
  };

  return (
    <div
      style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px", cursor: 'pointer' }}
      onClick={() => router.push(`/request/${request.id}`)}
    >
      <Image 
        src={typeof request.imageUrl === 'string' && request.imageUrl !== 'NA' ? request.imageUrl : '/default.jpg'} 
        alt={String(request.title)} 
        width={400} 
        height={200} 
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
      />
      <h3 style={{margin:'10px 0px'}}>{String(request.title)}</h3>
      <p style={{margin:'10px 0px'}}>{String(request.description)}</p>
      <p style={{margin:'10px 0px'}}>Price: {request.price ? (Number(request.price as string) / 1e18).toFixed(4) : '0.0000'} BNB</p>
      <p style={{margin:'10px 0px'}}>Issuer: {typeof request.requester === 'string' ? request.requester.slice(0, 6) + '...' + request.requester.slice(-4) : ''}</p>
      {wallet && typeof request.requester === 'string' && request.requester.toLowerCase() === wallet.toLowerCase() && (
        <button onClick={handleCloseRequest} disabled={closing} style={{margin:'10px 0px', color:'#fff', background:'#d9534f', border:'none', padding:'8px 16px', borderRadius:4, cursor:'pointer'}}>
          {closing ? 'Closing...' : 'Close Request'}
        </button>
      )}
      {/* 可擴展：支付按鈕 */}
    </div>
  );
}
