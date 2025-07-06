import React, { useState } from "react";
import { connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import Image from "next/image";

function ServiceCard({ service, wallet }: { service: Record<string, unknown>, wallet: string | null }) {
  const [contact, setContact] = useState("");

  const handleBuy = async () => {
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      const price = typeof service.price === 'object' ? (service.price as { value: string }).value : service.price;
      await contract.purchaseService(service.id, contact, { value: BigInt(String(price)).toString() });
      alert("Pay Success, Please contact the Service Provider.");
    } catch (err: unknown) {
      alert("Pay Fail: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px" }}>
      <Image
        src={typeof service.imageUrl === 'string' && service.imageUrl !== 'NA'
          ? service.imageUrl
          : (typeof service.category === 'string' && service.category.trim() !== ''
              ? `/${service.category.trim().toLowerCase().replace(/\s+/g, '_')}.jpg`
              : '/default.jpg')}
        alt={String(service.title)}
        width={400}
        height={200}
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
      <h3 style={{margin:'10px 0px'}}>{String(service.title)}</h3>
      <p style={{margin:'10px 0px'}}>{String(service.description)}</p>
      <p style={{margin:'10px 0px'}}>Price: {service.price ? (Number(service.price as string) / 1e18).toFixed(4) : '0.0000'} BNB</p>
      {/* <p style={{margin:'10px 0px'}}>Contact Method: {service.contactMethod}</p> */}
      <p style={{margin:'10px 0px'}}>Service Provider: {typeof service.provider === 'string' ? service.provider.slice(0, 6) + '...' + service.provider.slice(-4) : ''}</p>
      {wallet && typeof service.provider === 'string' && service.provider.toLowerCase() !== wallet.toLowerCase() && (
        <div>
          <input
            placeholder="Your Contact Method"
            value={contact}
            onChange={e => setContact(e.target.value)}
            style={{ width: "100%", color:"#ffffff", marginBottom: '10px' }}
          />
          <button onClick={handleBuy} style={{color:'#ffffff'}}>Buy</button>
        </div>
      )}
    </div>
  );
}

export default ServiceCard;
