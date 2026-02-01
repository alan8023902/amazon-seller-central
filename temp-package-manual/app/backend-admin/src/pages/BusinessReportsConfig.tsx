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
  Statistic,
  DatePicker
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut } from '../config/api';
import dayjs from 'dayjs';

const { Title } = Typography;

interface BusinessReportsConfigProps {
  selectedStoreId: string;
  selectedStore: any;
}

const BusinessReportsConfig: React.FC<BusinessReportsConfigProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取Sales Snapshot数据
  const { data: salesSnapshotData, isLoading } = useQuery({
    queryKey: ['salesSnapshotData', selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return null;
      const data = await adminApiGet(`/api/sales/snapshot/${selectedStoreId}`);
      // adminApiGet 现在直接返回数据
      return data || null;
    },
    enabled: !!selectedStoreId,
  });

  // 当数据加载完成时，更新表单
  React.useEffect(() => {
    if (salesSnapshotData) {
      form.setFieldsValue({
        ...salesSnapshotData,
        snapshot_time: salesSnapshotData.snapshot_time ? dayjs(salesSnapshotData.snapshot_time) : dayjs()
      });
    }
  }, [salesSnapshotData, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 转换日期格式
      const formattedValues = {
        ...values,
        snapshot_time: values.snapshot_time ? values.snapshot_time.toISOString() : new Date().toISOString()
      };
      
      const data = await adminApiPut(`/api/sales/snapshot/${selectedStoreId}`, formattedValues);
      if (data.success) {
        message.success('Business Reports数据更新成功！');
        queryClient.invalidateQueries({ queryKey: ['salesSnapshotData'] });
      } else {
        message.error('更新失败');
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      message.error('操作失败');
    }
  };

  const handleReset = () => {
    if (salesSnapshotData) {
      form.setFieldsValue({
        ...salesSnapshotData,
        snapshot_time: salesSnapshotData.snapshot_time ? dayjs(salesSnapshotData.snapshot_time) : dayjs()
      });
      message.info('已重置为原始数据');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Business Reports 数据配置</Title>
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
          <Card title="📊 当前Sales Snapshot概览" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={4}>
                <Statistic
                  title="Total Order Items"
                  value={salesSnapshotData?.total_order_items || 0}
                  formatter={(value) => formatNumber(Number(value))}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Units Ordered"
                  value={salesSnapshotData?.units_ordered || 0}
                  formatter={(value) => formatNumber(Number(value))}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Ordered Product Sales"
                  value={salesSnapshotData?.ordered_product_sales || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Avg Units/Order Item"
                  value={salesSnapshotData?.avg_units_per_order_item || 0}
                  precision={2}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Avg Sales/Order Item"
                  value={salesSnapshotData?.avg_sales_per_order_item || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Last Updated"
                  value={salesSnapshotData?.snapshot_time ? dayjs(salesSnapshotData.snapshot_time).format('MM/DD HH:mm') : 'N/A'}
                />
              </Col>
            </Row>
          </Card>

          {/* 编辑表单 */}
          <Card 
            title="✏️ 编辑Sales Snapshot数据" 
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
                total_order_items: 154066,
                units_ordered: 174714,
                ordered_product_sales: 19701989.13,
                avg_units_per_order_item: 1.13,
                avg_sales_per_order_item: 127.88,
                snapshot_time: dayjs()
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Total Order Items"
                    name="total_order_items"
                    rules={[{ required: true, message: '请输入Total Order Items' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="154066"
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Units Ordered"
                    name="units_ordered"
                    rules={[{ required: true, message: '请输入Units Ordered' }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="174714"
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ordered Product Sales ($)"
                    name="ordered_product_sales"
                    rules={[{ required: true, message: '请输入Ordered Product Sales' }]}
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      placeholder="19701989.13"
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Avg. Units/Order Item"
                    name="avg_units_per_order_item"
                    rules={[{ required: true, message: '请输入Avg Units per Order Item' }]}
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      placeholder="1.13"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Avg. Sales/Order Item ($)"
                    name="avg_sales_per_order_item"
                    rules={[{ required: true, message: '请输入Avg Sales per Order Item' }]}
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      placeholder="127.88"
                      style={{ width: '100%' }}
                      size="large"
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Snapshot Time"
                    name="snapshot_time"
                    rules={[{ required: true, message: '请选择快照时间' }]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
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
              <p><strong>Sales Snapshot</strong> 显示在Business Reports页面的销售快照部分：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>Total Order Items</strong>: 订单项目总数</li>
                <li><strong>Units Ordered</strong>: 订购单位数</li>
                <li><strong>Ordered Product Sales</strong>: 订购商品销售额</li>
                <li><strong>Avg. Units/Order Item</strong>: 平均单位数/订单项目</li>
                <li><strong>Avg. Sales/Order Item</strong>: 平均销售额/订单项目</li>
              </ul>
              <p><strong>注意：</strong>修改这些数值后，前端Business Reports页面的Sales Snapshot部分会实时更新。</p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default BusinessReportsConfig;


