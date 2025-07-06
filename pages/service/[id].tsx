import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProvider, connectWallet } from "../../libs/web3";
import { getContract } from "../../libs/contract";
import WalletConnect from "../../components/WalletConnect";
import Image from "next/image";

export default function ServiceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [service, setService] = useState<Record<string, unknown> | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  const [closing, setClosing] = useState(false);
  const [ancestorName, setAncestorName] = useState("");
  const [ancestorBirthPlace, setAncestorBirthPlace] = useState("");
  const [ancestorBirthDate, setAncestorBirthDate] = useState("");
  const [ancestorDeadDate, setAncestorDeadDate] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchService() {
      const provider = await getProvider();
      const contract = getContract(provider);
      const s = await contract.services(id);
      setService(s);
    }
    fetchService();
  }, [id]);

  const handleCloseService = async () => {
    if (!service) return;
    if (!window.confirm('Are you sure to close this service?')) return;
    setClosing(true);
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      await contract.deactivateService(service.id);
      alert('Service closed successfully.');
      window.location.reload();
    } catch (err: unknown) {
      alert('Close failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setClosing(false);
  };

  const handleBuy = async () => {
    if (!service) return;
    const ancestorInfo = [ancestorName, ancestorBirthPlace, ancestorBirthDate, ancestorDeadDate].join('|');
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      const price = typeof service.price === 'object' ? (service.price as { value: string }).value : service.price;
      await contract.purchaseService(
        service.id,
        contact,
        ancestorInfo,
        { value: BigInt(String(price)).toString() }
      );
      alert("Pay Success, Please contact the Service Provider.");
      router.push('/profile');
    } catch (err: unknown) {
      alert("Pay Fail: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (!service) return <div style={{color:'#fff'}}>Loading...</div>;

  const isProvider = service && wallet && typeof service.provider === 'string' && service.provider.toLowerCase() === wallet.toLowerCase();

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, padding: 24 }}>
      <WalletConnect onConnected={setWallet} />
      <h2 style={{margin:'20px 0'}}>{service.title}</h2>
      <Image
        src={typeof service.imageUrl === 'string' && service.imageUrl !== 'NA'
          ? service.imageUrl
          : (typeof service.category === 'string' && service.category.trim() !== ''
              ? `/${service.category.trim().toLowerCase().replace(/\s+/g, '_')}.jpg`
              : '/default.jpg')}
        alt={String(service.title)}
        width={400}
        height={200}
        style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
      />
      <p style={{margin:'10px 0px'}}>{service.description}</p>
      <p style={{margin:'10px 0px'}}>Price: {service.price ? (Number(service.price as string) / 1e18).toFixed(4) : '0.0000'} BNB</p>
      <p style={{margin:'10px 0px'}}>Service Provider: {typeof service.provider === 'string' ? service.provider.slice(0, 6) + '...' + service.provider.slice(-4) : ''}</p>
      {/* provider 本人可見的關閉按鈕 */}
      {wallet && isProvider && (
        <button onClick={handleCloseService} disabled={closing} style={{margin:'10px 0px', color:'#fff', background:'#d9534f', border:'none', padding:'8px 16px', borderRadius:4, cursor:'pointer'}}>
          {closing ? 'Closing...' : 'Close Service'}
        </button>
      )}
      {/* 非 provider，且已 connect wallet，顯示購買區塊 */}
      {wallet && !isProvider && (
        <div style={{marginTop: 20}}>
          <input
            placeholder="Your Contact Method"
            value={contact}
            onChange={e => setContact(e.target.value)}
            style={{ width: "100%", color:"#FFF", marginBottom: '10px', border:'1px solid #ccc', borderRadius:4, padding:8 }}
          />
          <input
            placeholder="Ancestor Name (optional)"
            value={ancestorName}
            onChange={e => setAncestorName(e.target.value)}
            style={{ width: "100%", color:"#FFF", marginBottom: '10px', border:'1px solid #ccc', borderRadius:4, padding:8 }}
          />
          <input
            placeholder="Ancestor Birth Place (optional)"
            value={ancestorBirthPlace}
            onChange={e => setAncestorBirthPlace(e.target.value)}
            style={{ width: "100%", color:"#FFF", marginBottom: '10px', border:'1px solid #ccc', borderRadius:4, padding:8 }}
          />
          <label style={{ color: '#333', fontWeight: 500, marginBottom: 4, display: 'block' }}>Ancestor Birth Date (Optional)</label>
          <input
            placeholder="Ancestor Birth Date (optional, yyyy-mm-dd)"
            value={ancestorBirthDate}
            onChange={e => setAncestorBirthDate(e.target.value)}
            type="date"
            style={{ width: "100%", color:"#FFF", marginBottom: '10px', border:'1px solid #ccc', borderRadius:4, padding:8 }}
          />
          <label style={{ color: '#333', fontWeight: 500, marginBottom: 4, display: 'block' }}>Ancestor Dead Date (Optional)</label>
          <input
            placeholder="Ancestor Dead Date (optional, yyyy-mm-dd)"
            value={ancestorDeadDate}
            onChange={e => setAncestorDeadDate(e.target.value)}
            type="date"
            style={{ width: "100%", color:"#FFF", marginBottom: '10px', border:'1px solid #ccc', borderRadius:4, padding:8 }}
          />
          <button onClick={handleBuy} style={{color:'#fff', background:'#4caf50', border:'none', padding:'8px 16px', borderRadius:4, cursor:'pointer'}}>Buy</button>
        </div>
      )}
    </div>
  );
} 