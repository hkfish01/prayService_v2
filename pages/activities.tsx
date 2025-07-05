import React, { useEffect, useState } from "react";
import { getProvider } from "../libs/web3";
import { getContract } from "../libs/contract";
import ActivityCard from "../components/ActivityCard";
import WalletConnect from "../components/WalletConnect";

export default function Activities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      const provider = await getProvider();
      const contract = getContract(provider);
      const txCount = await contract.transactionCounter();
      const arr = [];
      for (let i = 1; i <= txCount; i++) {
        const tx = await contract.transactions(i);
        if (tx.isCompleted) arr.push(tx);
      }
      setActivities(arr);
    }
    fetchActivities();
  }, []);

  return (
    <div>
      <h1>Completed Transaction</h1>
      <WalletConnect onConnected={setWallet} />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {activities.map((act) => (
          <ActivityCard key={act.id} activity={act} />
        ))}
      </div>
    </div>
  );
}
