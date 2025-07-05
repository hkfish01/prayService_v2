import React, { useEffect, useState } from "react";
import { getProvider, connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import ProfileInfo from "../components/ProfileInfo";
import WalletConnect from "../components/WalletConnect";

export default function Profile() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [requests, setRequests] = useState<unknown[]>([]);
  const [services, setServices] = useState<unknown[]>([]);
  const [purchasedServices, setPurchasedServices] = useState<unknown[]>([]);

  useEffect(() => {
    if (!wallet) return;
    async function fetchProfile() {
      const provider = await getProvider();
      const contract = getContract(provider);
      const reqIds = await contract.getUserRequests(wallet);
      const srvIds = await contract.getUserServices(wallet);
      const transactionIds = await contract.getUserTransactions(wallet);
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
        const ps = await contract.services(transaction.serviceId);
        purchasedSrvs.push({ ...ps, transactionId: id, transaction });
      }
      setRequests(reqs);
      setServices(srvs);
      setPurchasedServices(purchasedSrvs);
    }
    fetchProfile();
  }, [wallet]);

  const confirmService = async (transactionId: string | number) => {
    if (!wallet) return alert("Please connect your wallet first.");
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      await contract.confirmService(transactionId);
      alert("Confirm the service successfully, the funds have been transferred.");
      // 刷新已购买服务列表
      const provider = await getProvider();
      const updatedContract = getContract(provider);
      const transactionIds = await updatedContract.getUserTransactions(wallet);
      const purchasedSrvs = [];
      for (const id of transactionIds) {
        const transaction = await updatedContract.transactions(id);
        const ps = await updatedContract.services(transaction.serviceId);
        purchasedSrvs.push({ ...ps, transactionId: id, transaction });
      }
      setPurchasedServices(purchasedSrvs);
    } catch (err) {
      alert("Confirm the service failed: " + (err as any).message);
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      <WalletConnect onConnected={setWallet} />
      {wallet && (
        <> 
          <ProfileInfo wallet={wallet} requests={requests} services={services} />
          <h2>Confirmed Services</h2>
          <ul>
            {purchasedServices.map((service) => (
              <li key={(service as any).id}>
                <p>{(service as any).title}</p>
                <p>Price: {(service as any).price ? Number((service as any).price) / 1e18 : 0} BNB</p>
                {(service as any).transaction && (service as any).transaction.requester.toLowerCase() === wallet.toLowerCase() && !(service as any).transaction.isCompleted && (
                  <button onClick={() => confirmService((service as any).transactionId)}>Confirm the Service</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
