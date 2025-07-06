import React from "react";
import Image from "next/image";

export default function RequestCard({ request }: { request: Record<string, unknown> }) {
  return (
    <div style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px" }}>
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
      {/* 可擴展：支付按鈕 */}
    </div>
  );
}
