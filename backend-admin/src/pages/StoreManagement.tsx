import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Modal, 
  Form, 
  message,
  Popconfirm,
  Typography,
  Tag,
  Card,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ShopOutlined,
  DollarOutlined,
  ProductOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPost, adminApiPut, adminApiDelete } from '../config/api';

const { Title } = Typography;


interface Store {
  id: string;
  name: string;
  country: string;
  currency_symbol: string;
  marketplace: string;
  is_active: boolean;
  description?: string;
  timezone: string;
  business_type: 'Individual' | 'Business';
  created_at: string;
  updated_at: string;
}

interface StoreSummary {
  store: Store;
  statistics: {
    product_count: number;
    active_products: number;
    total_sales: number;
    total_orders: number;
    avg_order_value: number;
    last_sale_date?: string;
  };
  health_metrics: {
    inventory_performance_index: number;
    order_defect_rate: number;
    late_shipment_rate: number;
  };
}

// API functions
const storeApi = {
  getStores: async (params?: { search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return await adminApiGet(`${ADMIN_API_CONFIG.ENDPOINTS.STORES.LIST}?${queryParams}`);
  },
  
  createStore: async (data: any) => {
    return await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.STORES.CREATE, data);
  },
  
  updateStore: async (id: string, data: any) => {
    return await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.STORES.UPDATE(id), data);
  },
  
  deleteStore: async (id: string) => {
    return await adminApiDelete(ADMIN_API_CONFIG.ENDPOINTS.STORES.DELETE(id));
  },
  
  getStoreSummary: async (id: string) => {
    return await adminApiGet(`/api/stores/${id}/summary`);
  },
};

const StoreManagement: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取店铺列表
  const { data: storesResponse, isLoading } = useQuery({
    queryKey: ['stores', { search: searchText }],
    queryFn: () => storeApi.getStores({ 
      search: searchText || undefined,
    }),
  });

  // 获取店铺摘要
  const { data: summaryResponse, isLoading: summaryLoading } = useQuery({
    queryKey: ['store-summary', selectedStore?.id],
    queryFn: () => selectedStore ? storeApi.getStoreSummary(selectedStore.id) : null,
    enabled: !!selectedStore,
  });

  // 创建店铺
  const createStoreMutation = useMutation({
    mutationFn: storeApi.createStore,
    onSuccess: () => {
      message.success('店铺创建成功！');
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '创建失败，请重试');
    },
  });

  // 更新店铺
  const updateStoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      storeApi.updateStore(id, data),
    onSuccess: () => {
      message.success('店铺更新成功！');
      setIsModalVisible(false);
      setEditingStore(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '更新失败，请重试');
    },
  });

  // 删除店铺
  const deleteStoreMutation = useMutation({
    mutationFn: storeApi.deleteStore,
    onSuccess: () => {
      message.success('店铺删除成功！');
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      message.error(error.message || '删除失败，请重试');
    },
  });

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    form.setFieldsValue(store);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteStoreMutation.mutate(id);
  };

  const handleSubmit = (values: any) => {
    if (editingStore) {
      updateStoreMutation.mutate({ id: editingStore.id, data: values });
    } else {
      createStoreMutation.mutate(values);
    }
  };

  const handleViewSummary = (store: Store) => {
    setSelectedStore(store);
    setSummaryModalVisible(true);
  };

  const columns = [
    {
      title: '店铺名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Store) => (
        <Space>
          <ShopOutlined />
          <span style={{ fontWeight: 'bold' }}>{name}</span>
          {!record.is_active && <Tag color="red">未激活</Tag>}
        </Space>
      ),
    },
    {
      title: '市场',
      dataIndex: 'marketplace',
      key: 'marketplace',
      render: (marketplace: string, record: Store) => (
        <Space>
          <span>{marketplace}</span>
          <Tag color="blue">{record.currency_symbol}</Tag>
        </Space>
      ),
    },
    {
      title: '业务类型',
      dataIndex: 'business_type',
      key: 'business_type',
      render: (type: string) => (
        <Tag color={type === 'Business' ? 'green' : 'orange'}>
          {type === 'Business' ? '企业' : '个人'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '活跃' : '未激活'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Store) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<ProductOutlined />}
            onClick={() => handleViewSummary(record)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个店铺吗？"
            description="删除店铺将同时删除所有相关数据（产品、销售记录等），此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
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
      <Title level={2}>店铺管理</Title>
      
      {/* 搜索和操作 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, justifyContent: 'space-between' }}>
        <Input
          placeholder="搜索店铺名称或国家"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingStore(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          新增店铺
        </Button>
      </div>

      {/* 店铺表格 */}
      <Table
        columns={columns}
        dataSource={storesResponse?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total: storesResponse?.pagination?.total || 0,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
      />

      {/* 新增/编辑店铺模态框 */}
      <Modal
        title={editingStore ? '编辑店铺' : '新增店铺'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingStore(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="店铺名称"
            name="name"
            rules={[
              { required: true, message: '请输入店铺名称' },
              { min: 1, max: 100, message: '店铺名称长度应在1-100字符之间' }
            ]}
          >
            <Input placeholder="请输入店铺名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="市场"
                name="marketplace"
                rules={[{ required: true, message: '请选择市场' }]}
              >
                <Select placeholder="请选择市场">
                  <Select.Option value="United States">United States</Select.Option>
                  <Select.Option value="Japan">Japan</Select.Option>
                  <Select.Option value="United Kingdom">United Kingdom</Select.Option>
                  <Select.Option value="Germany">Germany</Select.Option>
                  <Select.Option value="Europe">Europe</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="货币符号"
                name="currency_symbol"
                rules={[{ required: true, message: '请选择货币符号' }]}
              >
                <Select placeholder="请选择货币符号">
                  <Select.Option value="US$">US$ (美元)</Select.Option>
                  <Select.Option value="¥">¥ (日元/人民币)</Select.Option>
                  <Select.Option value="£">£ (英镑)</Select.Option>
                  <Select.Option value="€">€ (欧元)</Select.Option>
                  <Select.Option value="C$">C$ (加元)</Select.Option>
                  <Select.Option value="A$">A$ (澳元)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="国家/地区"
                name="country"
                rules={[{ required: true, message: '请选择国家/地区' }]}
              >
                <Select placeholder="请选择国家/地区">
                  <Select.Option value="United States">United States</Select.Option>
                  <Select.Option value="Japan">Japan</Select.Option>
                  <Select.Option value="United Kingdom">United Kingdom</Select.Option>
                  <Select.Option value="Germany">Germany</Select.Option>
                  <Select.Option value="France">France</Select.Option>
                  <Select.Option value="Italy">Italy</Select.Option>
                  <Select.Option value="Spain">Spain</Select.Option>
                  <Select.Option value="Canada">Canada</Select.Option>
                  <Select.Option value="Australia">Australia</Select.Option>
                  <Select.Option value="美国/阿拉斯加">美国/阿拉斯加</Select.Option>
                  <Select.Option value="中国">中国</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="业务类型"
                name="business_type"
                initialValue="Business"
              >
                <Select>
                  <Select.Option value="Business">企业</Select.Option>
                  <Select.Option value="Individual">个人</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="时区"
            name="timezone"
            initialValue="UTC"
          >
            <Select placeholder="请选择时区">
              <Select.Option value="UTC">UTC (协调世界时)</Select.Option>
              <Select.Option value="America/New_York">America/New_York (EST/EDT)</Select.Option>
              <Select.Option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</Select.Option>
              <Select.Option value="America/Chicago">America/Chicago (CST/CDT)</Select.Option>
              <Select.Option value="Europe/London">Europe/London (GMT/BST)</Select.Option>
              <Select.Option value="Europe/Berlin">Europe/Berlin (CET/CEST)</Select.Option>
              <Select.Option value="Asia/Tokyo">Asia/Tokyo (JST)</Select.Option>
              <Select.Option value="Asia/Shanghai">Asia/Shanghai (CST)</Select.Option>
              <Select.Option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea 
              placeholder="店铺描述（可选）" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Space>
              <input type="checkbox" />
              <span>激活店铺</span>
            </Space>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createStoreMutation.isPending || updateStoreMutation.isPending}
              >
                {editingStore ? '更新' : '创建'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingStore(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 店铺详情模态框 */}
      <Modal
        title={`店铺详情 - ${selectedStore?.name}`}
        open={summaryModalVisible}
        onCancel={() => {
          setSummaryModalVisible(false);
          setSelectedStore(null);
        }}
        footer={null}
        width={800}
      >
        {summaryResponse?.data && (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="产品总数"
                    value={summaryResponse.data.statistics.product_count}
                    prefix={<ProductOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="活跃产品"
                    value={summaryResponse.data.statistics.active_products}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="总销售额"
                    value={summaryResponse.data.statistics.total_sales}
                    prefix={<DollarOutlined />}
                    precision={2}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="总订单数"
                    value={summaryResponse.data.statistics.total_orders}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="平均订单价值"
                    value={summaryResponse.data.statistics.avg_order_value}
                    precision={2}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="库存绩效指数"
                    value={summaryResponse.data.health_metrics.inventory_performance_index}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoreManagement;


