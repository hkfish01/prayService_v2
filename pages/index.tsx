import React, { useEffect, useState } from "react";
import { getProvider } from "../libs/web3";
import { getContract } from "../libs/contract";
import RequestCard from "../components/RequestCard";
import ServiceCard from "../components/ServiceCard";
import { Layout, Typography, Row, Col } from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Home() {
  const [requests, setRequests] = useState<unknown[]>([]);
  const [services, setServices] = useState<unknown[]>([]);

  const fetchRequests = async () => {
    try {
      const provider = await getProvider();
      // console.log('Provider obtained:', provider);
      let signer;
      try {
        signer = await provider.getSigner();
        // console.log('Signer obtained:', signer);
      } catch {
        console.log('No signer available, using provider instead.');
      }
      const contract = getContract(signer || provider);
      console.log('Contract created:', contract);
      const data = await contract.getAllRequests();
      // console.log('Raw getAllRequests data:', data);
      // console.log('getAllRequests:', data);
      setRequests(data.filter((r: unknown) => (r as Record<string, unknown>).isActive));
    } catch (e) {
      console.error('getAllRequests error:', e);
    }
  };

  const fetchServices = async () => {
    try {
      const provider = await getProvider();
      let signer;
      try {
        signer = await provider.getSigner();
      } catch {
        console.log('No signer available, using provider instead.');
      }
      const contract = getContract(signer || provider);
      const data = await contract.getAllServices();
      setServices(data.filter((s: unknown) => (s as Record<string, unknown>).isActive));
    } catch (e) {
      console.error('getAllServices error:', e);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchServices();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header style={{ padding: '8px 16px', background: 'rgba(34, 17, 68, 0.8)', color: '#e0d4ff', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0, display: 'inline-block' }}>Joss Paper Burning Service</Title>
      </Header>
      <Content style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Row gutter={[16, 16]} style={{ width: '90%', maxWidth: '800px'}}>
          <Col span={24}> 
            <Title level={3} style={{color:'#ffffff'}}>Request Joss Paper Burning Service</Title>
            <Row gutter={[16, 16]}>
              {requests.map((req) => ( 
                <Col key={(req as Record<string, unknown>).id as string} xs={24} sm={12} md={8} lg={8} style={{ animation: `fadeInDown 0.5s ease-out ${(Number((req as Record<string, unknown>).id) % 4) * 0.1}s both` }}>
                  <RequestCard request={req as Record<string, unknown>} wallet={null} /> 
                </Col>
              ))}
            </Row>
          </Col>
          <Col span={24} style={{ marginTop: '24px' }}>
            <Title level={3}  style={{color:'#ffffff'}}>Joss Paper Burning Service List</Title>
            <Row gutter={[16, 16]}>
              {services.map((service) => ( 
                <Col key={(service as Record<string, unknown>).id as string} xs={24} sm={12} md={8} lg={8} style={{ animation: `fadeInDown 0.5s ease-out ${(Number((service as Record<string, unknown>).id) % 4) * 0.1}s both` }}>
                  <ServiceCard service={service as Record<string, unknown>} wallet={null} /> 
                </Col>
              ))}
            </Row>
          </Col>
          <Col span={24} style={{ marginTop: '48px' }}>
            <Title level={2} style={{color:'#ffffff', textAlign: 'center', marginBottom: '40px'}}>How It Works</Title>
            <Row gutter={[24, 24]} justify="space-around">
              <Col xs={24} md={7} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>1</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{color:'#ffffff', marginBottom: '8px'}}>Connect Wallet</Title>
                  <p style={{ color: '#e0d4ff' }}>Click the wallet connection button to connect your wallet securely</p>
                </div>
              </Col>
              
              <Col xs={24} md={7} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>2</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{color:'#ffffff', marginBottom: '8px'}}>Choose Service</Title>
                  <p style={{ color: '#e0d4ff' }}>Browse our services and select the one that meets your spiritual needs</p>
                </div>
              </Col>
              
              <Col xs={24} md={7} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>3</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{color:'#ffffff', marginBottom: '8px'}}>Complete Order</Title>
                  <p style={{ color: '#e0d4ff' }}>Provide details and submit to finalize your spiritual service request</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
