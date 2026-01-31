import React, { useState, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';
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

interface StoreManagementProps {
  selectedStoreId?: string;
  selectedStore?: any;
  onStoreChange?: (storeId: string, store: any) => void;
}

const StoreManagement: React.FC<StoreManagementProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [viewingStore, setViewingStore] = useState<Store | null>(null);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取店铺列表 - 显示所有店铺，不进行搜索过滤
  const { data: storesResponse, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storeApi.getStores(),
  });

  // 过滤店铺列表用于显示
  const filteredStores = useMemo(() => {
    if (!storesResponse) return [];
    
    // storesResponse 直接是数组，不需要 .data
    let filtered = Array.isArray(storesResponse) ? storesResponse : [];
    
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(q) || 
        store.country.toLowerCase().includes(q) ||
        store.marketplace.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [storesResponse, searchText]);

  // 获取店铺摘要
  const { data: summaryResponse, isLoading: summaryLoading } = useQuery({
    queryKey: ['store-summary', viewingStore?.id],
    queryFn: () => viewingStore ? storeApi.getStoreSummary(viewingStore.id) : null,
    enabled: !!viewingStore,
  });

  // 创建店铺
  const createStoreMutation = useMutation({
    mutationFn: storeApi.createStore,
    onSuccess: () => {
      message.success(t('storeCreatedSuccess'));
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      message.error(error.message || t('createFailed'));
    },
  });

  // 更新店铺
  const updateStoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      storeApi.updateStore(id, data),
    onSuccess: () => {
      message.success(t('storeUpdatedSuccess'));
      setIsModalVisible(false);
      setEditingStore(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      message.error(error.message || t('updateFailed'));
    },
  });

  // 删除店铺
  const deleteStoreMutation = useMutation({
    mutationFn: storeApi.deleteStore,
    onSuccess: () => {
      message.success(t('storeDeletedSuccess'));
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (error: Error) => {
      message.error(error.message || t('deleteFailed'));
    },
  });

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    form.setFieldsValue(store);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    // Check if trying to delete current store
    if (selectedStoreId && id === selectedStoreId) {
      message.error(t('currentStoreDeleteWarning'));
      return;
    }
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
    setViewingStore(store);
    setSummaryModalVisible(true);
  };

  const columns = [
    {
      title: t('storeName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Store) => (
        <Space>
          <ShopOutlined />
          <span style={{ fontWeight: 'bold' }}>{name}</span>
          {!record.is_active && <Tag color="red">{t('deactivated')}</Tag>}
        </Space>
      ),
    },
    {
      title: t('marketplace'),
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
      title: t('businessType'),
      dataIndex: 'business_type',
      key: 'business_type',
      render: (type: string) => (
        <Tag color={type === 'Business' ? 'green' : 'orange'}>
          {type === 'Business' ? t('business') : t('individual')}
        </Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('activated') : t('deactivated')}
        </Tag>
      ),
    },
    {
      title: t('createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: t('actions'),
      key: 'action',
      render: (_: any, record: Store) => {
        const isCurrentStore = selectedStoreId && record.id === selectedStoreId;
        
        return (
          <Space size="middle">
            <Button 
              type="link" 
              icon={<ProductOutlined />}
              onClick={() => handleViewSummary(record)}
            >
              {t('details')}
            </Button>
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              {t('edit')}
            </Button>
            {isCurrentStore ? (
              <Button 
                type="link" 
                disabled
                icon={<DeleteOutlined />}
                title={t('currentStoreCannotDelete')}
              >
                {t('delete')}
              </Button>
            ) : (
              <Popconfirm
                title={t('storeDeleteConfirm')}
                description={t('storeDeleteWarning')}
                onConfirm={() => handleDelete(record.id)}
                okText={t('confirm')}
                cancelText={t('cancel')}
                okType="danger"
              >
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                >
                  {t('delete')}
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={2}>{t('storeManagement')}</Title>
      
      {/* 搜索和操作 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, justifyContent: 'space-between' }}>
        <Input
          placeholder={t('searchStoreNameCountry')}
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
          {t('addStore')}
        </Button>
      </div>

      {/* 店铺表格 */}
      <Table
        columns={columns}
        dataSource={filteredStores}
        loading={isLoading}
        rowKey="id"
        pagination={{
          total: filteredStores.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
      />

      {/* 新增/编辑店铺模态框 */}
      <Modal
        title={editingStore ? t('editStore') : t('addStore')}
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
            label={t('storeName')}
            name="name"
            rules={[
              { required: true, message: t('pleaseEnterStoreName') },
              { min: 1, max: 100, message: t('storeNameLength') }
            ]}
          >
            <Input placeholder={t('pleaseEnterStoreName')} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('marketplace')}
                name="marketplace"
                rules={[{ required: true, message: t('pleaseSelectMarketplace') }]}
              >
                <Select placeholder={t('pleaseSelectMarketplace')}>
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
                label={t('currencySymbol')}
                name="currency_symbol"
                rules={[{ required: true, message: t('pleaseSelectCurrency') }]}
              >
                <Select placeholder={t('pleaseSelectCurrency')}>
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
                label={t('countryRegion')}
                name="country"
                rules={[{ required: true, message: t('pleaseSelectCountry') }]}
              >
                <Select placeholder={t('pleaseSelectCountry')}>
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
                label={t('businessType')}
                name="business_type"
                initialValue="Business"
              >
                <Select>
                  <Select.Option value="Business">{t('business')}</Select.Option>
                  <Select.Option value="Individual">{t('individual')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t('timezone')}
            name="timezone"
            initialValue="UTC"
          >
            <Select placeholder={t('pleaseSelect') + t('timezone')}>
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
            label={t('storeDescription')}
            name="description"
          >
            <Input.TextArea 
              placeholder={t('storeDescriptionOptional')} 
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
              <span>{t('activateStore')}</span>
            </Space>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createStoreMutation.isPending || updateStoreMutation.isPending}
              >
                {editingStore ? t('update') : t('create')}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingStore(null);
                form.resetFields();
              }}>
                {t('cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 店铺详情模态框 */}
      <Modal
        title={`${t('storeDetails')} - ${viewingStore?.name}`}
        open={summaryModalVisible}
        onCancel={() => {
          setSummaryModalVisible(false);
          setViewingStore(null);
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
                    title={t('totalProducts')}
                    value={summaryResponse.data.statistics.product_count}
                    prefix={<ProductOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={t('activeProducts')}
                    value={summaryResponse.data.statistics.active_products}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={t('totalSales')}
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
                    title={t('totalOrders')}
                    value={summaryResponse.data.statistics.total_orders}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={t('avgOrderValue')}
                    value={summaryResponse.data.statistics.avg_order_value}
                    precision={2}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={t('inventoryPerformanceIndex')}
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


