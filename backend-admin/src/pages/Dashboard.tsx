import React from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Alert } from 'antd';
import { ShopOutlined, ProductOutlined, BarChartOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi, dashboardApi, salesApi } from '../services/api';
import { ADMIN_API_CONFIG } from '../config/api';

const { Title } = Typography;

interface DashboardProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedStoreId, selectedStore }) => {
  const { t } = useTranslation();
  
  // 如果没有选择店铺，使用默认店铺
  const storeId = selectedStoreId || 'store-us-main';
  
  // 获取产品统计
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products-stats', storeId],
    queryFn: async () => {
      // 使用productApi获取产品数据
      const response = await productApi.getProducts({ store_id: storeId, limit: 100 });
      // productApi.getProducts已经处理了响应格式，直接返回数据数组
      return response;
    },
    enabled: !!storeId,
  });

  // 获取仪表板快照
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard-snapshot', storeId],
    queryFn: () => dashboardApi.getSnapshot(storeId),
    enabled: !!storeId,
  });

  // 获取销售快照
  const { data: salesData, isLoading: salesLoading, error: salesError } = useQuery({
    queryKey: ['sales-snapshot', storeId],
    queryFn: () => salesApi.getSalesSnapshot(storeId),
    enabled: !!storeId,
  });

  const isLoading = productsLoading || dashboardLoading || salesLoading;
  const hasError = productsError || dashboardError || salesError;

  // 添加详细的错误日志
  if (productsError) {
    console.error('Products API Error:', productsError);
  }
  if (dashboardError) {
    console.error('Dashboard API Error:', dashboardError);
  }
  if (salesError) {
    console.error('Sales API Error:', salesError);
  }

  if (hasError) {
    const errorDetails = [];
    if (productsError) errorDetails.push(`Products: ${productsError.message}`);
    if (dashboardError) errorDetails.push(`Dashboard: ${dashboardError.message}`);
    if (salesError) errorDetails.push(`Sales: ${salesError.message}`);

    return (
      <div>
        <Title level={2}>{t('adminDashboard')}</Title>
        <Alert
          message={t('apiConnectionError')}
          description={
            <div>
              <p>{t('backendRunningNormally')} ({ADMIN_API_CONFIG.BASE_URL})，{t('apiRequestFailed')}：</p>
              <ul>
                {errorDetails.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  const activeProducts = Array.isArray(productsData) ? productsData.filter((p: any) => p.status === 'Active').length : 0;
  const totalProducts = Array.isArray(productsData) ? productsData.length : 0;
  const totalSales = salesData?.total_order_items || 0;
  const totalOrders = dashboardData?.open_orders || 0;

  return (
    <div>
      <Title level={2}>管理后台概览</Title>
      {selectedStore && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 6 }}>
          <strong>当前店铺:</strong> {selectedStore.name} ({selectedStore.marketplace}) - {selectedStore.currency_symbol}
        </div>
      )}
      
      <Spin spinning={isLoading}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="当前店铺"
                value={selectedStore?.name || '未选择'}
                prefix={<ShopOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="产品数量"
                value={totalProducts}
                prefix={<ProductOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix={`(${activeProducts} 活跃)`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="销售订单项"
                value={totalSales}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待处理订单"
                value={totalOrders}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="快速操作" style={{ height: 300 }}>
              <p>• 管理产品信息和图片</p>
              <p>• 配置销售数据和图表</p>
              <p>• 设置店铺基本信息</p>
              <p>• 调整账户健康指标</p>
              <p>• 生成测试数据</p>
              <p>• 配置Communications数据</p>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="系统状态" style={{ height: 300 }}>
              <p>✅ 后端API服务正常 ({ADMIN_API_CONFIG.BASE_URL})</p>
              <p>✅ 数据库连接正常 ({totalProducts} 产品已加载)</p>
              <p>✅ 销售数据正常 ({totalSales} 订单项)</p>
              <p>✅ 前端应用正常 (http://localhost:3000)</p>
              <p>✅ 管理后台正常 (http://localhost:3002)</p>
              <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
                店铺ID: {storeId}<br/>
                最后更新: {new Date().toLocaleString()}
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;


