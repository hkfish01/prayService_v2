import React from "react";

export default function ProfileInfo({ wallet, requests, services }: { wallet: string, requests: Record<string, unknown>[], services: Record<string, unknown>[] }) {
  return (
    <div>
      <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>Wallet address: {wallet}</h2>
      <h3 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>My Request:</h3>
      <ul>
        {requests.map((r) => (
          <li key={String(r.id)}>{String(r.title)} - {r.price ? Number(r.price as string) / 1e18 : 0} BNB</li>
        ))}
      </ul>
      <h3 style={{ marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}>My Provided Service:</h3>
      <ul>
        {services.map((s) => (
          <li style={{ color: "#FFFFFF" }} key={String(s.id)}>{String(s.title)} - {s.price ? Number(s.price as string) / 1e18 : 0} BNB</li>
        ))}
      </ul>
    </div>
  );
}
