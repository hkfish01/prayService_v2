import React, { useEffect, useState } from "react";
import { getProvider } from "../libs/web3";
import { getContract } from "../libs/contract";
import RequestCard from "../components/RequestCard";
import ServiceCard from "../components/ServiceCard";
import { Layout, Typography, Row, Col } from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function Home() {
  const [requests, setRequests] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const provider = await getProvider();
      console.log('Provider obtained:', provider);
      let signer;
      try {
        signer = await provider.getSigner();
        console.log('Signer obtained:', signer);
      } catch (e) {
        console.log('No signer available, using provider instead.');
      }
      const contract = getContract(signer || provider);
      console.log('Contract created:', contract);
      const data = await contract.getAllRequests();
      console.log('Raw getAllRequests data:', data);
      console.log('getAllRequests:', data);
      const owner = await contract.owner();
      console.log('Contract owner:', owner);
      console.log('Data item format:', data.length > 0 ? data[0] : 'No data');
      setRequests(data.filter((r: any) => r.isActive));
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
      } catch (e) {
        console.log('No signer available, using provider instead.');
      }
      const contract = getContract(signer || provider);
      const data = await contract.getAllServices();
      setServices(data.filter((s: any) => s.isActive));
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
      <Header style={{ padding: { xs: '8px 16px', sm: '12px 24px' }, background: 'rgba(34, 17, 68, 0.8)', color: '#e0d4ff', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0, display: 'inline-block' }}>Pray Service</Title>
      </Header>
      <Content style={{ padding: { xs: '16px', sm: '24px' }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Row gutter={[16, 16]} style={{ width: '90%', maxWidth: '800px'}}>
          <Col span={24}>
            <Title level={3} style={{color:'#ffffff'}}>Request List</Title>
            <Row gutter={[16, 16]}>
              {requests.map((req) => ( 
                <Col key={req.id} xs={24} sm={12} md={8} lg={8} style={{ animation: `fadeInDown 0.5s ease-out ${(Number(req.id) % 4) * 0.1}s both` }}>
                  <RequestCard request={req} wallet={wallet} />
                </Col>
              ))}
            </Row>
          </Col>
          <Col span={24} style={{ marginTop: '24px' }}>
            <Title level={3}  style={{color:'#ffffff'}}>Service List</Title>
            <Row gutter={[16, 16]}>
              {services.map((service) => ( 
                <Col key={service.id} xs={24} sm={12} md={8} lg={8} style={{ animation: `fadeInDown 0.5s ease-out ${(Number(service.id) % 4) * 0.1}s both` }}>
                  <ServiceCard service={service} wallet={wallet} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
