import React, { useEffect, useState } from "react";
import { getProvider } from "../libs/web3";
import { getContract } from "../libs/contract";
import RequestCard from "../components/RequestCard";
import WalletConnect from "../components/WalletConnect";
import CreateRequestForm from "../components/CreateRequestForm";
import { Layout, Typography, Row, Col } from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Request() {
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);

  const fetchRequests = async () => {
    const provider = await getProvider();
    const contract = getContract(provider);
    const data = await contract.getAllRequests();
    setRequests(data.filter((r: unknown) => (r as Record<string, unknown>).isActive));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header style={{ padding: '12px 24px', background: 'rgba(34, 17, 68, 0.8)', color: '#e0d4ff', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0, display: 'inline-block' }}>Pray Request</Title>
      </Header>
      <Content style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Row gutter={[16, 16]} style={{ width: '90%', maxWidth: '800px'}}>
          <Col span={24} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <WalletConnect onConnected={setWallet} />
          </Col>
          <Col span={24} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', padding: '20px'  }}>
            <div style={{ animation: 'fadeInDown 0.5s ease-out', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '500px', padding: '10px' }}>
              <CreateRequestForm onCreated={fetchRequests} />
            </div>
          </Col>
          <Col span={24}> 
            <Row gutter={[16, 16]}>
              {requests.map((req) => ( 
                <Col key={(req as Record<string, unknown>).id as string} xs={24} sm={12} md={8} lg={8} style={{ animation: `fadeInDown 0.5s ease-out ${(Number((req as Record<string, unknown>).id) % 4) * 0.1}s both` }}>
                  <RequestCard request={req as Record<string, unknown>} wallet={wallet} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
