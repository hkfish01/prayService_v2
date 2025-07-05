import React from "react";

export default function ProfileInfo({ wallet, requests, services }: { wallet: string, requests: Record<string, any>[], services: Record<string, any>[] }) {
  return (
    <div>
      <h2>Wallet address: {wallet}</h2>
      <h3>My Request:</h3>
      <ul>
        {requests.map((r) => (
          <li key={r.id}>{r.title} - {Number(r.price) / 1e18} BNB</li>
        ))}
      </ul>
      <h3>My Provided Service:</h3>
      <ul>
        {services.map((s) => (
          <li key={s.id}>{s.title} - {Number(s.price) / 1e18} BNB</li>
        ))}
      </ul>
    </div>
  );
}
