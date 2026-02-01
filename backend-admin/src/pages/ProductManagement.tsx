import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Modal, 
  Form, 
  InputNumber, 
  Popconfirm,
  Typography,
  Tag,
  App
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { productApi } from '../services/api';
import ImageUpload from '../components/ImageUpload';

const { Title } = Typography;


interface Product {
  id: string;
  store_id: string;
  title: string;
  sku: string;
  asin: string;
  price: number;
  inventory: number;
  status: 'Active' | 'Inactive';
  image_url?: string;
  revenue: number;
  units_sold: number;
}

interface ProductManagementProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取产品列表 - 根据选中的店铺过滤
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['products', selectedStoreId, pagination.current, pagination.pageSize, searchText, statusFilter],
    queryFn: async () => {
      if (!selectedStoreId) return null;
      
      console.log('Fetching products for store:', selectedStoreId);
      
      // Clean parameters to avoid sending undefined values
      const params: any = {
        store_id: selectedStoreId,
        page: pagination.current,
        limit: pagination.pageSize
      };
      
      // Only add search and status if they have meaningful values
      if (searchText && searchText.trim() !== '') {
        params.search = searchText.trim();
      }
      
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }
      
      const result = await productApi.getProducts(params);
      console.log('Products API result:', result);
      return result;
    },
    enabled: !!selectedStoreId, // 只有选择了店铺才执行查询
  });

  // Debug: 打印数据到控制台
  React.useEffect(() => {
    console.log('ProductManagement Debug:', {
      selectedStoreId,
      productsResponse,
      isLoading,
      error: error || 'No error',
      searchText,
      statusFilter,
      pagination
    });
  }, [selectedStoreId, productsResponse, isLoading, error, searchText, statusFilter, pagination]);

  // 更新分页信息
  React.useEffect(() => {
    if (productsResponse?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: productsResponse.pagination.total
      }));
    }
  }, [productsResponse]);

  // 创建产品
  const createProductMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      message.success(t('productCreatedSuccess'));
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      message.error(t('createFailed'));
    },
  });

  // 更新产品
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      productApi.updateProduct(id, data),
    onSuccess: () => {
      message.success(t('productUpdatedSuccess'));
      setIsModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      message.error(t('updateFailed'));
    },
  });

  // 删除产品
  const deleteProductMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      message.success(t('productDeletedSuccess'));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      message.error(t('deleteFailed'));
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  const handleSubmit = (values: any) => {
    if (!selectedStoreId) {
      message.error(t('pleaseSelectStoreFirst'));
      return;
    }

    const submitData = {
      ...values,
      store_id: selectedStoreId, // 使用选中的店铺ID
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: submitData });
    } else {
      createProductMutation.mutate(submitData);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    // Update form with image URL
    form.setFieldsValue({ image_url: imageUrl });
    message.success(t('imageUploadSuccess'));
  };

  const handleImageRemoved = () => {
    form.setFieldsValue({ image_url: undefined });
  };

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 })); // 搜索时重置到第一页
  };

  // 处理状态筛选
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 })); // 筛选时重置到第一页
  };

  const columns = [
    {
      title: t('image'),
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (url: string) => (
        url ? (
          <img 
            src={url} 
            alt="Product" 
            style={{ width: 50, height: 50, objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: 50, 
            height: 50, 
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {t('noImage')}
          </div>
        )
      ),
    },
    {
      title: t('productName'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price != null ? `$${(price || 0).toFixed(2)}` : '-',
    },
    {
      title: t('inventory'),
      dataIndex: 'inventory',
      key: 'inventory',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status === 'Active' ? t('active') : t('inactive')}
        </Tag>
      ),
    },
    {
      title: t('revenue'),
      dataIndex: 'revenue',
      key: 'revenue',
      render: (amount: number) => amount != null ? `$${(amount || 0).toFixed(2)}` : '-',
    },
    {
      title: t('actions'),
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('edit')}
          </Button>
          <Popconfirm
            title={t('productDeleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('confirm')}
            cancelText={t('cancel')}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              {t('delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>{t('productManagement')}</Title>
        {selectedStore && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            {t('currentStore')}: <strong>{selectedStore.name}</strong> ({selectedStore.marketplace})
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
          {t('pleaseSelectStoreFirst')}
        </div>
      ) : (
        <>
          {/* 搜索和筛选 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <Input.Search
              placeholder={t('searchProductSkuAsin')}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 300 }}
              enterButton
            />
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: 120 }}
            >
              <Select.Option value="All">{t('allStatus')}</Select.Option>
              <Select.Option value="Active">{t('active')}</Select.Option>
              <Select.Option value="Inactive">{t('inactive')}</Select.Option>
            </Select>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingProduct(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              {t('addProduct')}
            </Button>
          </div>

          {/* 产品表格 */}
          <Table
            columns={columns}
            dataSource={productsResponse?.data || []}
            loading={isLoading}
            rowKey="id"
            locale={{
              emptyText: productsResponse ? t('noDataAvailable') : t('pleaseSelectStoreFirst')
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize, total: pagination.total });
              },
              onShowSizeChange: (page, size) => {
                setPagination({ current: 1, pageSize: size, total: pagination.total });
              }
            }}
          />
        </>
      )}

      {/* 新增/编辑产品模态框 */}
      <Modal
        title={editingProduct ? t('editProduct') : t('addProduct')}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
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
            label={t('productName')}
            name="title"
            rules={[{ required: true, message: t('pleaseEnterProductName') }]}
          >
            <Input placeholder={t('pleaseEnterProductName')} />
          </Form.Item>

          <Form.Item
            label={t('sku')}
            name="sku"
            rules={[{ required: true, message: t('pleaseEnterSku') }]}
          >
            <Input placeholder={t('pleaseEnterSku')} />
          </Form.Item>

          <Form.Item
            label={t('asin')}
            name="asin"
            rules={[{ required: true, message: t('pleaseEnterAsin') }]}
          >
            <Input placeholder={t('pleaseEnterAsin')} />
          </Form.Item>

          <Form.Item
            label={t('price')}
            name="price"
            rules={[{ required: true, message: t('pleaseEnterPrice') }]}
          >
            <InputNumber
              placeholder={t('pleaseEnterPrice')}
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('inventory')}
            name="inventory"
            rules={[{ required: true, message: t('pleaseEnterInventory') }]}
          >
            <InputNumber
              placeholder={t('pleaseEnterInventory')}
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('revenue')}
            name="revenue"
            rules={[
              { required: false, message: t('pleaseEnterRevenue') },
              { type: 'number', min: 0, message: t('revenueMustBePositive') }
            ]}
          >
            <InputNumber
              placeholder={t('pleaseEnterRevenue')}
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            label={t('productImage')}
            name="image_url"
          >
            <ImageUpload
              productId={editingProduct?.id}
              currentImage={form.getFieldValue('image_url')}
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleImageRemoved}
              disabled={!editingProduct && createProductMutation.isPending}
            />
          </Form.Item>

          <Form.Item
            label={t('status')}
            name="status"
            rules={[{ required: true, message: t('pleaseSelectStatus') }]}
          >
            <Select placeholder={t('pleaseSelectStatus')}>
              <Select.Option value="Active">{t('active')}</Select.Option>
              <Select.Option value="Inactive">{t('inactive')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {editingProduct ? t('update') : t('create')}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingProduct(null);
                form.resetFields();
              }}>
                {t('cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;


