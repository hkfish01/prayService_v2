import React, { useState } from "react";
import { getProvider, connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import Image from "next/image";

function ServiceCard({ service, wallet }: { service: Record<string, any>, wallet: string | null }) {
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      const price = typeof service.price === 'object' ? service.price.value : service.price;
      await contract.purchaseService(service.id, contact, { value: BigInt(price.toString()).toString() });
      alert("Pay Success, Please contact the Service Provider.");
    } catch (err: any) {
      alert("Pay Fail: " + err.message);
    }
  };

  return (
    <div style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px" }}>
      <Image src={service.imageUrl && service.imageUrl !== 'NA' ? service.imageUrl : '/default.jpg'} alt={service.title} width={400} height={200} style={{ width: '100%', objectFit: 'cover' }} />
      <h3 style={{margin:'10px 0px'}}>{service.title}</h3>
      <p style={{margin:'10px 0px'}}>{service.description}</p>
      <p style={{margin:'10px 0px'}}>Price: {Number(service.price) / 1e18} BNB</p>
      {/* <p style={{margin:'10px 0px'}}>Contact Method: {service.contactMethod}</p> */}
      <p style={{margin:'10px 0px'}}>Service Provider: {service.provider.slice(0, 6)}...{service.provider.slice(-4)}</p>
      {wallet && (
        <div>
          <input
            placeholder="Your Contact Method"
            value={contact}
            onChange={e => setContact(e.target.value)}
            style={{ width: "100%", color:"#ffffff", marginBottom: '10px' }}
          />
          <button onClick={handleBuy} disabled={loading} style={{color:'#ffffff'}}>{loading ? "Buying service..." : "Buy"}</button>
        </div>
      )}
    </div>
  );
}

export default ServiceCard;
