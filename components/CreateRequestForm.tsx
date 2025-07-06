import React, { useState, useEffect } from "react";
import { connectWallet } from "../libs/web3";
import { getContract } from "../libs/contract";
import { parseEther } from "ethers";

const categories = process.env.NEXT_PUBLIC_REQUEST_CATEGORIES?.split(',') || [];

export default function CreateRequestForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCategory(categories[0] || "");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signer = await connectWallet();
      const contract = getContract(signer);
      const img = `/${category.trim().toLowerCase().replace(/\s+/g, '_')}.jpg`;
      await contract.createRequest(title, desc, img, parseEther(price));
      alert("Publish Success.");
      setTitle("");
      setDesc("");
      setCategory(categories[0] || "");
      setPrice("");
      if (onCreated) onCreated();
    } catch (err: unknown) {
      alert("Publish Fail：" + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: 16 }}>
      <h2>Post a Joss paper burning service request</h2>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required  style={{margin:'5px 0px', color:'#ffffff', width:'100%'}}/><br />
      <textarea placeholder="Description of the Job" value={desc} onChange={e => setDesc(e.target.value)} required  style={{margin:'5px 0px', color:'#ffffff', width:'100%'}}/><br />
      {isClient && (
        <select value={category} onChange={e => setCategory(e.target.value)} required style={{margin:'5px 0px', color:'#ffffff', background: 'rgba(54, 37, 88, 0.8)', width:'100%', height:'40px'}}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      )}<br />
      <input placeholder="Price(BNB)" value={price} onChange={e => setPrice(e.target.value)} required type="number" min="0" step="0.0001"  style={{margin:'5px 0px', color:'#ffffff', width:'100%'}}/><br />
      <button type="submit" disabled={loading}  style={{margin:'5px 0px', color:"#ffffff", width:'100%', height:'40px', textAlign:'center'}}>{loading ? "Publishing..." : "Published"}</button>
    </form>
  );
}