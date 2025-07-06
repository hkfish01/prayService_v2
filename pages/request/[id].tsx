import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProvider, connectWallet } from "../../libs/web3";
import { getContract } from "../../libs/contract";
import WalletConnect from "../../components/WalletConnect";
import Image from "next/image";

export default function RequestDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [request, setRequest] = useState<Record<string, unknown> | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchRequest() {
      const provider = await getProvider();
      const contract = getContract(provider);
      const r = await contract.requests(id);
      setRequest(r);
    }
    fetchRequest();
  }, [id]);

  const handleCloseRequest = async () => {
    if (!request) return;
    if (!window.confirm('Are you sure to close this request?')) return;
    setClosing(true);
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      await contract.deactivateRequest(request.id);
      alert('Request closed successfully.');
      window.location.reload();
    } catch (err: unknown) {
      alert('Close failed: ' + (err instanceof Error ? err.message : String(err)));
    }
    setClosing(false);
  };

  if (!request) return <div style={{color:'#fff'}}>Loading...</div>;

  const isRequester = request && wallet && typeof request.requester === 'string' && request.requester.toLowerCase() === wallet.toLowerCase();

  return (
    <>
      <WalletConnect onConnected={setWallet} />
      <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, padding: 24 , color:'#000'}}>
        <button onClick={() => window.history.back()} style={{marginRight:12,marginTop:10,marginBottom:10,padding:'4px 12px',borderRadius:4,border:'1px solid #888',background:'#eee',cursor:'pointer'}}>返回</button>
        <h2 style={{margin:'20px 0'}}>{String(request.title)}</h2>
        <Image
          src={typeof request.imageUrl === 'string' && request.imageUrl !== 'NA'
            ? request.imageUrl
            : '/default.jpg'}
          alt={String(request.title)}
          width={400}
          height={200}
          style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
        />
        <p style={{margin:'10px 0px'}}>{String(request.description)}</p>
        <p style={{margin:'10px 0px'}}>Price: {request.price ? (Number(request.price as string) / 1e18).toFixed(4) : '0.0000'} BNB</p>
        <p style={{margin:'10px 0px'}}>Requester: {typeof request.requester === 'string' ? request.requester.slice(0, 6) + '...' + request.requester.slice(-4) : ''}</p>
        {/* requester 本人可見的關閉按鈕 */}
        {wallet && isRequester && (
          <button onClick={handleCloseRequest} disabled={closing} style={{margin:'10px 0px', color:'#fff', background:'#d9534f', border:'none', padding:'8px 16px', borderRadius:4, cursor:'pointer'}}>
            {closing ? 'Closing...' : 'Close Request'}
          </button>
        )}
      </div>
    </>
  );
} 