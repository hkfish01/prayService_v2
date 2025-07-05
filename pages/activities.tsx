import React, { useEffect, useState } from "react";
import { getProvider } from "../libs/web3";
import { getContract } from "../libs/contract";
import ActivityCard from "../components/ActivityCard";

export default function Activities() {
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);

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
      <h1 style={{ textAlign: "center", marginBottom: 20, fontSize: 24, fontWeight: "bold", color: "#FFFFFF" }}>Completed Transaction</h1>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {activities.map((act) => (
          <ActivityCard key={String(activities.indexOf(act))} activity={act as Record<string, unknown>} />
        ))}
      </div>
    </div>
  );
}