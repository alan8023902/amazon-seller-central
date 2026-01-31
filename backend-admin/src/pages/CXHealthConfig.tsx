import React, { useState } from 'react';
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
  Table,
  Modal,
  Input,
  Select,
  Switch,
  Popconfirm,
  Tag
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut, adminApiPost, adminApiDelete } from '../config/api';

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
  const [vocForm] = Form.useForm();
  const [isVocModalVisible, setIsVocModalVisible] = useState(false);
  const [editingVocItem, setEditingVocItem] = useState<any>(null);
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

  // 获取VOC产品数据
  const { data: vocData = [], isLoading: vocLoading } = useQuery({
    queryKey: ['vocData', selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return [];
      const data = await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.VOC.BY_STORE(selectedStoreId));
      return Array.isArray(data) ? data : [];
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

  // VOC产品数据处理函数
  const handleEditVoc = (record: any) => {
    setEditingVocItem(record);
    vocForm.setFieldsValue(record);
    setIsVocModalVisible(true);
  };

  const handleAddVoc = () => {
    setEditingVocItem(null);
    vocForm.resetFields();
    vocForm.setFieldsValue({
      store_id: selectedStoreId,
      sku_status: 'Active',
      fulfillment: 'Amazon Fulfillment',
      satisfaction_status: 'Good',
      is_out_of_stock: false,
      last_updated: new Date().toISOString().split('T')[0],
    });
    setIsVocModalVisible(true);
  };

  const handleVocModalOk = async () => {
    try {
      const values = await vocForm.validateFields();
      
      if (editingVocItem) {
        // Update existing item
        const data = await adminApiPut(`/api/voc/data/${selectedStoreId}/${editingVocItem.id}`, values);
        if (data.success) {
          message.success('VOC数据更新成功！');
        } else {
          message.error('更新失败');
        }
      } else {
        // Create new item
        const data = await adminApiPost(`/api/voc/data/${selectedStoreId}`, values);
        if (data.success) {
          message.success('VOC数据创建成功！');
        } else {
          message.error('创建失败');
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['vocData'] });
      queryClient.invalidateQueries({ queryKey: ['cxHealthData'] });
      setIsVocModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
      message.error('操作失败');
    }
  };

  const handleDeleteVoc = async (id: string) => {
    try {
      const data = await adminApiDelete(`/api/voc/data/${selectedStoreId}/${id}`);
      if (data.success) {
        message.success('VOC数据删除成功！');
        queryClient.invalidateQueries({ queryKey: ['vocData'] });
        queryClient.invalidateQueries({ queryKey: ['cxHealthData'] });
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
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

  const getSatisfactionColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'green';
      case 'Good': return 'blue';
      case 'Average': return 'orange';
      case 'Poor': return 'red';
      case 'Very Poor': return 'red';
      default: return 'default';
    }
  };

  const vocColumns = [
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      width: 120,
    },
    {
      title: 'SKU状态',
      dataIndex: 'sku_status',
      key: 'sku_status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: '配送方式',
      dataIndex: 'fulfillment',
      key: 'fulfillment',
      width: 150,
      ellipsis: true,
    },
    {
      title: '不满意率',
      dataIndex: 'dissatisfaction_rate',
      key: 'dissatisfaction_rate',
      width: 100,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating: number) => rating.toFixed(1),
    },
    {
      title: '满意度状态',
      dataIndex: 'satisfaction_status',
      key: 'satisfaction_status',
      width: 120,
      render: (status: string) => (
        <Tag color={getSatisfactionColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '缺货',
      dataIndex: 'is_out_of_stock',
      key: 'is_out_of_stock',
      width: 80,
      render: (isOutOfStock: boolean) => (
        <Tag color={isOutOfStock ? 'red' : 'green'}>
          {isOutOfStock ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditVoc(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个VOC数据吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDeleteVoc(record.id)}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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

          {/* VOC产品数据管理 */}
          <Card 
            title="🗣️ 买家之声产品数据管理" 
            style={{ marginTop: 24 }}
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddVoc}
              >
                添加产品数据
              </Button>
            }
          >
            <Table
              columns={vocColumns}
              dataSource={vocData}
              rowKey="id"
              loading={vocLoading}
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
            />
          </Card>
        </>
      )}

      {/* VOC产品数据编辑/添加模态框 */}
      <Modal
        title={editingVocItem ? '编辑VOC产品数据' : '添加VOC产品数据'}
        open={isVocModalVisible}
        onOk={handleVocModalOk}
        onCancel={() => setIsVocModalVisible(false)}
        width={800}
        destroyOnClose
      >
        <Form
          form={vocForm}
          layout="vertical"
          initialValues={{
            sku_status: 'Active',
            fulfillment: 'Amazon Fulfillment',
            satisfaction_status: 'Good',
            is_out_of_stock: false,
          }}
        >
          <Form.Item name="store_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="产品名称"
            name="product_name"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          <Form.Item
            label="ASIN"
            name="asin"
            rules={[{ required: true, message: '请输入ASIN' }]}
          >
            <Input placeholder="请输入ASIN" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="SKU状态"
              name="sku_status"
              style={{ flex: 1 }}
            >
              <Select>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="配送方式"
              name="fulfillment"
              style={{ flex: 1 }}
            >
              <Select>
                <Select.Option value="Amazon Fulfillment">Amazon Fulfillment</Select.Option>
                <Select.Option value="Seller Fulfillment">Seller Fulfillment</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="不满意率 (%)"
              name="dissatisfaction_rate"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请输入不满意率' }]}
            >
              <InputNumber
                min={0}
                max={100}
                step={0.1}
                placeholder="0.0"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="不满意订单数"
              name="dissatisfaction_orders"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请输入不满意订单数' }]}
            >
              <InputNumber
                min={0}
                placeholder="0"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="总订单数"
              name="total_orders"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请输入总订单数' }]}
            >
              <InputNumber
                min={0}
                placeholder="0"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="评分"
              name="rating"
              style={{ flex: 1 }}
              rules={[{ required: true, message: '请输入评分' }]}
            >
              <InputNumber
                min={0}
                max={5}
                step={0.1}
                placeholder="0.0"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="退货率 (%)"
            name="return_rate"
            rules={[{ required: true, message: '请输入退货率' }]}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              placeholder="0.0"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="主要负面原因"
            name="main_negative_reason"
          >
            <Input placeholder="请输入主要负面原因" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              label="满意度状态"
              name="satisfaction_status"
              style={{ flex: 1 }}
            >
              <Select>
                <Select.Option value="Excellent">Excellent</Select.Option>
                <Select.Option value="Good">Good</Select.Option>
                <Select.Option value="Average">Average</Select.Option>
                <Select.Option value="Poor">Poor</Select.Option>
                <Select.Option value="Very Poor">Very Poor</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="是否缺货"
              name="is_out_of_stock"
              valuePropName="checked"
              style={{ flex: 1 }}
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            label="图片URL"
            name="image"
          >
            <Input placeholder="请输入图片URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CXHealthConfig;


