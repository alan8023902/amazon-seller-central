import React from 'react';
import { 
  Card, 
  Button, 
  message, 
  Typography,
  Space,
  Form,
  InputNumber,
  Row,
  Col,
  Statistic
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut } from '../config/api';

const { Title } = Typography;

interface CXHealthConfigProps {
  selectedStoreId: string;
  selectedStore: any;
}

const CXHealthConfig: React.FC<CXHealthConfigProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取CX Health数据
  const { data: cxHealthData, isLoading } = useQuery({
    queryKey: ['cxHealthData', selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return null;
      const data = await adminApiGet(`/api/voc/cx-health/${selectedStoreId}`);
      // adminApiGet 现在直接返回数据
      return data || null;
    },
    enabled: !!selectedStoreId,
  });

  // 当数据加载完成时，更新表单
  React.useEffect(() => {
    if (cxHealthData) {
      form.setFieldsValue(cxHealthData);
    }
  }, [cxHealthData, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      const data = await adminApiPut(`/api/voc/cx-health/${selectedStoreId}`, values);
      if (data.success) {
        message.success('CX Health数据更新成功！');
        queryClient.invalidateQueries({ queryKey: ['cxHealthData'] });
      } else {
        message.error('更新失败');
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      message.error('操作失败');
    }
  };

  const handleReset = () => {
    if (cxHealthData) {
      form.setFieldsValue(cxHealthData);
      message.info('已重置为原始数据');
    }
  };

  const getTotalListings = () => {
    if (!cxHealthData) return 0;
    return (
      cxHealthData.poor_listings +
      cxHealthData.fair_listings +
      cxHealthData.good_listings +
      cxHealthData.very_good_listings +
      cxHealthData.excellent_listings
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'poor': return '#ff4d4f';
      case 'fair': return '#faad14';
      case 'good': return '#52c41a';
      case 'very_good': return '#1890ff';
      case 'excellent': return '#722ed1';
      default: return '#d9d9d9';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>CX Health 数据配置</Title>
        {selectedStore && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            当前店铺: <strong>{selectedStore.name}</strong> ({selectedStore.marketplace})
          </div>
        )}
      </div>

      {!selectedStoreId ? (
        <Card>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0', 
            color: '#999',
            fontSize: '16px' 
          }}>
            请先在页面顶部选择一个店铺
          </div>
        </Card>
      ) : (
        <>
          {/* 当前数据概览 */}
          <Card title="📊 当前CX Health概览" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={4}>
                <Statistic
                  title="Poor Listings"
                  value={cxHealthData?.poor_listings || 0}
                  valueStyle={{ color: getStatusColor('poor') }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Fair Listings"
                  value={cxHealthData?.fair_listings || 0}
                  valueStyle={{ color: getStatusColor('fair') }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Good Listings"
                  value={cxHealthData?.good_listings || 0}
                  valueStyle={{ color: getStatusColor('good') }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Very Good Listings"
                  value={cxHealthData?.very_good_listings || 0}
                  valueStyle={{ color: getStatusColor('very_good') }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Excellent Listings"
                  value={cxHealthData?.excellent_listings || 0}
                  valueStyle={{ color: getStatusColor('excellent') }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Total Listings"
                  value={getTotalListings()}
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                />
              </Col>
            </Row>
          </Card>

          {/* 编辑表单 */}
          <Card 
            title="✏️ 编辑CX Health数据" 
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleReset}
                >
                  重置
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSave}
                  loading={isLoading}
                >
                  保存更改
                </Button>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                poor_listings: 0,
                fair_listings: 0,
                good_listings: 0,
                very_good_listings: 0,
                excellent_listings: 0,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span style={{ color: getStatusColor('poor') }}>
                        🔴 Poor Listings
                      </span>
                    }
                    name="poor_listings"
                    rules={[{ required: true, message: '请输入Poor Listings数量' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <span style={{ color: getStatusColor('fair') }}>
                        🟡 Fair Listings
                      </span>
                    }
                    name="fair_listings"
                    rules={[{ required: true, message: '请输入Fair Listings数量' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span style={{ color: getStatusColor('good') }}>
                        🟢 Good Listings
                      </span>
                    }
                    name="good_listings"
                    rules={[{ required: true, message: '请输入Good Listings数量' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <span style={{ color: getStatusColor('very_good') }}>
                        🔵 Very Good Listings
                      </span>
                    }
                    name="very_good_listings"
                    rules={[{ required: true, message: '请输入Very Good Listings数量' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span style={{ color: getStatusColor('excellent') }}>
                        🟣 Excellent Listings
                      </span>
                    }
                    name="excellent_listings"
                    rules={[{ required: true, message: '请输入Excellent Listings数量' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* 使用说明 */}
          <Card title="💡 使用说明" style={{ marginTop: 24 }}>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>CX Health Breakdown</strong> 显示了您店铺中不同客户体验健康状态的商品数量：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li><span style={{ color: getStatusColor('poor') }}>🔴 Poor Listings</span>: 客户体验较差的商品</li>
                <li><span style={{ color: getStatusColor('fair') }}>🟡 Fair Listings</span>: 客户体验一般的商品</li>
                <li><span style={{ color: getStatusColor('good') }}>🟢 Good Listings</span>: 客户体验良好的商品</li>
                <li><span style={{ color: getStatusColor('very_good') }}>🔵 Very Good Listings</span>: 客户体验很好的商品</li>
                <li><span style={{ color: getStatusColor('excellent') }}>🟣 Excellent Listings</span>: 客户体验优秀的商品</li>
              </ul>
              <p><strong>注意：</strong>修改这些数值后，前端Voice of the Customer页面的CX Health breakdown部分会实时更新。</p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default CXHealthConfig;


