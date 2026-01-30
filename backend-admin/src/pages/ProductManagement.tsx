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
      message.success('产品创建成功！');
      setIsModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      message.error('创建失败，请重试');
    },
  });

  // 更新产品
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      productApi.updateProduct(id, data),
    onSuccess: () => {
      message.success('产品更新成功！');
      setIsModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      message.error('更新失败，请重试');
    },
  });

  // 删除产品
  const deleteProductMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      message.success('产品删除成功！');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      message.error('删除失败，请重试');
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
      message.error('请先选择店铺');
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
    message.success('图片上传成功！');
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
      title: '图片',
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
            无图
          </div>
        )
      ),
    },
    {
      title: '产品名称',
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
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price != null ? `$${(price || 0).toFixed(2)}` : '-',
    },
    {
      title: '库存',
      dataIndex: 'inventory',
      key: 'inventory',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '销售额',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (amount: number) => amount != null ? `$${(amount || 0).toFixed(2)}` : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个产品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
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
        <Title level={2}>产品管理</Title>
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
        <>
          {/* 搜索和筛选 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <Input.Search
              placeholder="搜索产品名称、SKU或ASIN"
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
              <Select.Option value="All">全部状态</Select.Option>
              <Select.Option value="Active">活跃</Select.Option>
              <Select.Option value="Inactive">非活跃</Select.Option>
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
              新增产品
            </Button>
          </div>

          {/* 产品表格 */}
          <Table
            columns={columns}
            dataSource={productsResponse?.data || []}
            loading={isLoading}
            rowKey="id"
            locale={{
              emptyText: productsResponse ? '暂无数据' : '请选择店铺查看产品'
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
        title={editingProduct ? '编辑产品' : '新增产品'}
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
            label="产品名称"
            name="title"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          <Form.Item
            label="SKU"
            name="sku"
            rules={[{ required: true, message: '请输入SKU' }]}
          >
            <Input placeholder="请输入SKU" />
          </Form.Item>

          <Form.Item
            label="ASIN"
            name="asin"
            rules={[{ required: true, message: '请输入ASIN' }]}
          >
            <Input placeholder="请输入ASIN" />
          </Form.Item>

          <Form.Item
            label="价格"
            name="price"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              placeholder="请输入价格"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="库存"
            name="inventory"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber
              placeholder="请输入库存数量"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="销售额"
            name="revenue"
            rules={[
              { required: false, message: '请输入销售额' },
              { type: 'number', min: 0, message: '销售额必须为正数' }
            ]}
          >
            <InputNumber
              placeholder="请输入销售额"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="产品图片"
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
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="Active">活跃</Select.Option>
              <Select.Option value="Inactive">非活跃</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {editingProduct ? '更新' : '创建'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingProduct(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;


