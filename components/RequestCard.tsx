import React from "react";

export default function RequestCard({ request, wallet }: { request: any, wallet: string | null }) {
  return (
    <div style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px" }}>
      <img src={request.imageUrl && request.imageUrl !== 'NA' ? request.imageUrl : '/default.jpg'} alt={request.title} style={{ width: '100%', objectFit: 'cover' }} />
      <h3 style={{margin:'10px 0px'}}>{request.title}</h3>
      <p style={{margin:'10px 0px'}}>{request.description}</p>
      <p style={{margin:'10px 0px'}}>Price: {Number(request.price) / 1e18} BNB</p>
      <p style={{margin:'10px 0px'}}>Issuer: {request.requester.slice(0, 6)}...{request.requester.slice(-4)}</p>
      {/* 可扩展：支付按钮 */}
    </div>
  );
}
