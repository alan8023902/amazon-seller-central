import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  message, 
  Tabs, 
  Space,
  Row,
  Col,
  Switch,
  Select
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { dashboardApi } from '../services/api';

interface GlobalSnapshotData {
  sales: {
    todaySoFar: number;
    currency: string;
  };
  orders: {
    totalCount: number;
    fbmUnshipped: number;
    fbmPending: number;
    fbaPending: number;
  };
  messages: {
    casesRequiringAttention: number;
  };
  featuredOffer: {
    percentage: number;
    daysAgo: number;
  };
  feedback: {
    rating: number;
    count: number;
  };
  payments: {
    totalBalance: number;
    currency: string;
  };
  ads: {
    sales: number;
    impressions: number;
    currency: string;
  };
  inventory: {
    performanceIndex: number;
  };
}

interface WelcomeBannerData {
  greeting: string;
  healthStatus: string;
  healthColor: string;
  showTour: boolean;
  showLearnMore: boolean;
}

interface DashboardConfigProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const DashboardConfig: React.FC<DashboardConfigProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const [loading, setLoading] = useState(false);
  const [globalSnapshot, setGlobalSnapshot] = useState<GlobalSnapshotData>({
    sales: { todaySoFar: 49.95, currency: 'US$' },
    orders: { totalCount: 6, fbmUnshipped: 0, fbmPending: 0, fbaPending: 6 },
    messages: { casesRequiringAttention: 0 },
    featuredOffer: { percentage: 100, daysAgo: 2 },
    feedback: { rating: 5.0, count: 2 },
    payments: { totalBalance: 228.31, currency: 'US$' },
    ads: { sales: 0, impressions: 0, currency: 'US$' },
    inventory: { performanceIndex: 400 }
  });
  
  const [welcomeBanner, setWelcomeBanner] = useState<WelcomeBannerData>({
    greeting: 'Good evening',
    healthStatus: 'Healthy',
    healthColor: '#507F00',
    showTour: true,
    showLearnMore: true
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedStoreId]);

  const loadDashboardData = async () => {
    if (!selectedStoreId) return;
    
    try {
      // 从后端加载当前配置
      const response = await dashboardApi.getConfig(selectedStoreId);
      if (response.success) {
        // 设置从后端获取的数据
        if (response.data.globalSnapshot) {
          setGlobalSnapshot(response.data.globalSnapshot);
        }
        if (response.data.welcomeBanner) {
          setWelcomeBanner(response.data.welcomeBanner);
        }
        console.log('Loaded dashboard data:', response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      message.warning('加载配置失败，使用默认配置');
    }
  };

  const handleSaveGlobalSnapshot = async () => {
    if (!selectedStoreId) {
      message.error('请先选择店铺');
      return;
    }
    
    setLoading(true);
    try {
      const computedTotalCount =
        (globalSnapshot.orders?.fbmUnshipped || 0) +
        (globalSnapshot.orders?.fbmPending || 0) +
        (globalSnapshot.orders?.fbaPending || 0);
      const response = await dashboardApi.updateConfig(selectedStoreId, {
        globalSnapshot: {
          ...globalSnapshot,
          orders: {
            ...globalSnapshot.orders,
            totalCount: computedTotalCount
          }
        },
        welcomeBanner
      });
      if (response.success) {
        message.success('Global Snapshot 配置已保存！');
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败，请重试');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWelcomeBanner = async () => {
    if (!selectedStoreId) {
      message.error('请先选择店铺');
      return;
    }
    
    setLoading(true);
    try {
      const response = await dashboardApi.updateConfig(selectedStoreId, {
        globalSnapshot,
        welcomeBanner
      });
      if (response.success) {
        message.success('欢迎横幅配置已保存！');
      } else {
        message.error(response.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败，请重试');
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setGlobalSnapshot({
      sales: { todaySoFar: 49.95, currency: 'US$' },
      orders: { totalCount: 6, fbmUnshipped: 0, fbmPending: 0, fbaPending: 6 },
      messages: { casesRequiringAttention: 0 },
      featuredOffer: { percentage: 100, daysAgo: 2 },
      feedback: { rating: 5.0, count: 2 },
      payments: { totalBalance: 228.31, currency: 'US$' },
      ads: { sales: 0, impressions: 0, currency: 'US$' },
      inventory: { performanceIndex: 400 }
    });
    message.info('已重置为默认值');
  };

  const computedTotalCount =
    (globalSnapshot.orders?.fbmUnshipped || 0) +
    (globalSnapshot.orders?.fbmPending || 0) +
    (globalSnapshot.orders?.fbaPending || 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2>Dashboard 页面配置</h2>
          <p style={{ color: '#666' }}>
            配置前端 Dashboard 页面显示的数据内容，修改后将实时更新到前端页面
          </p>
        </div>
        {selectedStore && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            当前店铺: <strong>{selectedStore.name}</strong> ({selectedStore.marketplace})
          </div>
        )}
      </div>

      {!selectedStoreId ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 0', 
          color: '#999',
          fontSize: '16px' 
        }}>
          请先在页面顶部选择一个店铺
        </div>
      ) : (
        <Tabs 
          defaultActiveKey="globalSnapshot"
          items={[
            {
              key: 'globalSnapshot',
              label: 'Global Snapshot',
              children: (
                <Card title="Global Snapshot 数据配置" extra={
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={resetToDefaults}>
                      重置默认值
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      loading={loading}
                      onClick={handleSaveGlobalSnapshot}
                    >
                      保存配置
                    </Button>
                  </Space>
                }>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Card size="small" title="Sales" style={{ marginBottom: 16 }}>
                        <Form.Item label="Today so far">
                          <InputNumber
                            value={globalSnapshot.sales.todaySoFar}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              sales: { ...prev.sales, todaySoFar: value || 0 }
                            }))}
                            precision={2}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="Currency">
                          <Select
                            value={globalSnapshot.sales.currency}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              sales: { ...prev.sales, currency: value }
                            }))}
                          >
                            <Select.Option value="US$">US$</Select.Option>
                            <Select.Option value="¥">¥</Select.Option>
                            <Select.Option value="£">£</Select.Option>
                            <Select.Option value="€">€</Select.Option>
                          </Select>
                        </Form.Item>
                      </Card>

                      <Card size="small" title="Open Orders" style={{ marginBottom: 16 }}>
                        <Form.Item label="Total Count">
                          <InputNumber
                            value={computedTotalCount}
                            disabled
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="FBM Unshipped">
                          <InputNumber
                            value={globalSnapshot.orders.fbmUnshipped}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              orders: { ...prev.orders, fbmUnshipped: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="FBM Pending">
                          <InputNumber
                            value={globalSnapshot.orders.fbmPending}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              orders: { ...prev.orders, fbmPending: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="FBA Pending">
                          <InputNumber
                            value={globalSnapshot.orders.fbaPending}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              orders: { ...prev.orders, fbaPending: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Card>

                      <Card size="small" title="Buyer Messages" style={{ marginBottom: 16 }}>
                        <Form.Item label="Cases requiring attention">
                          <InputNumber
                            value={globalSnapshot.messages.casesRequiringAttention}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              messages: { casesRequiringAttention: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>

                    <Col span={12}>
                      <Card size="small" title="Featured Offer %" style={{ marginBottom: 16 }}>
                        <Form.Item label="Percentage">
                          <InputNumber
                            value={globalSnapshot.featuredOffer.percentage}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              featuredOffer: { ...prev.featuredOffer, percentage: value || 0 }
                            }))}
                            min={0}
                            max={100}
                            formatter={value => `${value}%`}
                            parser={(value) => Number(value!.replace('%', ''))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="Days ago">
                          <InputNumber
                            value={globalSnapshot.featuredOffer.daysAgo}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              featuredOffer: { ...prev.featuredOffer, daysAgo: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Card>

                      <Card size="small" title="Seller Feedback" style={{ marginBottom: 16 }}>
                        <Form.Item label="Rating">
                          <InputNumber
                            value={globalSnapshot.feedback.rating}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              feedback: { ...prev.feedback, rating: value || 0 }
                            }))}
                            min={0}
                            max={5}
                            step={0.1}
                            precision={1}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="Count">
                          <InputNumber
                            value={globalSnapshot.feedback.count}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              feedback: { ...prev.feedback, count: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Card>

                      <Card size="small" title="Payments" style={{ marginBottom: 16 }}>
                        <Form.Item label="Total Balance">
                          <InputNumber
                            value={globalSnapshot.payments.totalBalance}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              payments: { ...prev.payments, totalBalance: value || 0 }
                            }))}
                            precision={2}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Card>

                      <Card size="small" title="Ads & Inventory">
                        <Form.Item label="Ad Sales">
                          <InputNumber
                            value={globalSnapshot.ads.sales}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              ads: { ...prev.ads, sales: value || 0 }
                            }))}
                            precision={2}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="Ad Impressions">
                          <InputNumber
                            value={globalSnapshot.ads.impressions}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              ads: { ...prev.ads, impressions: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Form.Item label="Inventory Performance Index">
                          <InputNumber
                            value={globalSnapshot.inventory.performanceIndex}
                            onChange={(value) => setGlobalSnapshot(prev => ({
                              ...prev,
                              inventory: { performanceIndex: value || 0 }
                            }))}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'welcomeBanner',
              label: '欢迎横幅',
              children: (
                <Card title="欢迎横幅配置" extra={
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    loading={loading}
                    onClick={handleSaveWelcomeBanner}
                  >
                    保存配置
                  </Button>
                }>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="问候语">
                        <Input
                          value={welcomeBanner.greeting}
                          onChange={(e) => setWelcomeBanner(prev => ({
                            ...prev,
                            greeting: e.target.value
                          }))}
                          placeholder="Good evening"
                        />
                      </Form.Item>
                      <Form.Item label="健康状态">
                        <Input
                          value={welcomeBanner.healthStatus}
                          onChange={(e) => setWelcomeBanner(prev => ({
                            ...prev,
                            healthStatus: e.target.value
                          }))}
                          placeholder="Healthy"
                        />
                      </Form.Item>
                      <Form.Item label="状态颜色">
                        <Input
                          value={welcomeBanner.healthColor}
                          onChange={(e) => setWelcomeBanner(prev => ({
                            ...prev,
                            healthColor: e.target.value
                          }))}
                          placeholder="#507F00"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="显示 Launch Tour 按钮">
                        <Switch
                          checked={welcomeBanner.showTour}
                          onChange={(checked) => setWelcomeBanner(prev => ({
                            ...prev,
                            showTour: checked
                          }))}
                        />
                      </Form.Item>
                      <Form.Item label="显示 Learn More 按钮">
                        <Switch
                          checked={welcomeBanner.showLearnMore}
                          onChange={(checked) => setWelcomeBanner(prev => ({
                            ...prev,
                            showLearnMore: checked
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            }
          ]}
        />
      )}
    </div>
  );
};

export default DashboardConfig;


