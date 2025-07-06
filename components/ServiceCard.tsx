import React, { useState } from "react";
import { connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import Image from "next/image";
import { useRouter } from "next/router";

function ServiceCard({ service, wallet }: { service: Record<string, unknown>, wallet: string | null }) {
  const [closing, setClosing] = useState(false);
  const router = useRouter();

  const handleCloseService = async () => {
    if (!window.confirm('Are you sure to close this service?')) return;
    setClosing(true);
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      await contract.deactivateService(service.id);
      alert('Service closed successfully.');
    } catch (err: unknown) {
      alert('Close failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setClosing(false);
  };

  return (
    <div
      style={{ border: "1px solid #eee", margin: 2, padding: 16, width: "100%", background: "#ffffff", borderRadius: "8px", cursor: 'pointer' }}
      onClick={() => router.push(`/service/${service.id}`)}
    >
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
      {wallet && typeof service.provider === 'string' && service.provider.toLowerCase() === wallet.toLowerCase() && (
        <button onClick={handleCloseService} disabled={closing} style={{margin:'10px 0px', color:'#fff', background:'#d9534f', border:'none', padding:'8px 16px', borderRadius:4, cursor:'pointer'}}>
          {closing ? 'Closing...' : 'Close Service'}
        </button>
      )}
      {wallet && typeof service.provider === 'string' && service.provider.toLowerCase() !== wallet.toLowerCase() && (
        <button onClick={() => router.push(`/service/${service.id}`)} style={{color:'#ffffff'}}>Buy</button>
      )}
    </div>
  );
}

export default ServiceCard;
