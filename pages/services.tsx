import React, { useEffect, useState } from "react";
import { getProvider } from "../libs/web3";
import { getContract } from "../libs/contract";
import ServiceCard from "../components/ServiceCard";
import WalletConnect from "../components/WalletConnect";
import CreateServiceForm from "../components/CreateServiceForm";
import { Layout, Typography, Row, Col } from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Services() {
  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);

  const fetchServices = async () => {
    const provider = await getProvider();
    const contract = getContract(provider);
    const data = await contract.getAllServices();
    setServices(data.filter((s: unknown) => (s as Record<string, unknown>).isActive));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header style={{ padding: '8px 16px', background: 'rgba(34, 17, 68, 0.8)', color: '#e0d4ff', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0, display: 'inline-block' }}>Pray Service Provide</Title>
      </Header>
      <Content style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Row gutter={[16, 16]} style={{ width: '90%', maxWidth: '800px'}}>
          <Col span={24} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ animation: 'fadeInDown 0.5s ease-out', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '500px' }}>
              <WalletConnect onConnected={setWallet} />
            </div>
          </Col>
          <Col span={24} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', padding: '20px'  }}>
            <div style={{ animation: 'fadeInDown 0.5s ease-out', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '500px', padding: '10px' }}>
              <CreateServiceForm onCreated={fetchServices} />
            </div>
          </Col>
          <Col span={24}> 
            <Row gutter={[16, 16]}>
              {services.map((req) => ( 
                <Col key={(req as Record<string, unknown>).id as string} xs={24} sm={12} md={8} lg={8} style={{ animation: `fadeInDown 0.5s ease-out ${(Number((req as Record<string, unknown>).id) % 4) * 0.1}s both` }}>
                  <ServiceCard service={req as Record<string, unknown>} wallet={wallet} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
