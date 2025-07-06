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
      const owner = await contract.owner();
      // console.log('Contract owner:', owner);
      // console.log('Data item format:', data.length > 0 ? data[0] : 'No data');
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
        </Row>
      </Content>
    </Layout>
  );
}
