import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Table, 
  Modal, 
  Space,
  Popconfirm,
  Typography,
  DatePicker,
  InputNumber,
  message,
  App
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPost, adminApiPut, adminApiDelete } from '../config/api';

const { Title } = Typography;

interface SalesData {
  id: string;
  store_id: string;
  date: string;
  units: number;
  sales: number;
  lastYearUnits: number;
  lastYearSales: number;
  created_at: string;
  updated_at: string;
}

interface SalesDataConfigProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const SalesDataConfig: React.FC<SalesDataConfigProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const { message } = App.useApp();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingData, setEditingData] = useState<SalesData | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedStoreId) {
      loadSalesData();
    }
  }, [selectedStoreId]);

  const loadSalesData = async () => {
    if (!selectedStoreId) return;
    
    setLoading(true);
    try {
      const result = await adminApiGet(`/api/sales/chart-data/${selectedStoreId}`);
      console.log('Load sales data result:', result);
      
      if (Array.isArray(result)) {
        // Convert backend format to admin format
        const formattedData = result.map((item: any, index: number) => ({
          id: item.id || `temp-${index}`,
          store_id: selectedStoreId,
          date: item.date,
          units: item.units || 0,
          sales: item.sales || 0,
          lastYearUnits: item.lastYearUnits || 0,
          lastYearSales: item.lastYearSales || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        setSalesData(formattedData);
      } else {
        message.error('销售数据格式错误');
      }
    } catch (error) {
      message.error('加载销售数据失败');
      console.error('Load sales data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    if (!selectedStoreId) {
      message.error('请先选择店铺');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...values,
        store_id: selectedStoreId,
        date: values.date.toISOString().split('T')[0],
      };

      let result;
      if (editingData) {
        result = await adminApiPut(`/api/sales/admin/sales-data/${editingData.id}`, submitData);
      } else {
        result = await adminApiPost('/api/sales/admin/sales-data', submitData);
      }
      
      console.log('Sales data save result:', result);
      
      if (result && result.success) {
        message.success(editingData ? '销售数据更新成功！' : '销售数据创建成功！');
        setModalVisible(false);
        setEditingData(null);
        form.resetFields();
        await loadSalesData();
      } else {
        message.error(result?.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败，请重试');
      console.error('Save sales data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const result = await adminApiDelete(`/api/sales/admin/sales-data/${id}`);
      
      if (result.success) {
        message.success('销售数据删除成功！');
        await loadSalesData();
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
      console.error('Delete sales data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data: SalesData) => {
    setEditingData(data);
    form.setFieldsValue({
      date: new Date(data.date),
      units: data.units,
      sales: data.sales,
      lastYearUnits: data.lastYearUnits,
      lastYearSales: data.lastYearSales,
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingData(null);
    form.resetFields();
    setModalVisible(true);
  };

  const generateSampleData = async () => {
    if (!selectedStoreId) {
      message.error('请先选择店铺');
      return;
    }

    setLoading(true);
    try {
      const result = await adminApiPost(`/api/sales/admin/sales-data/generate/${selectedStoreId}`);
      
      if (result.success) {
        message.success('样本数据生成成功！');
        await loadSalesData();
      } else {
        message.error(result.message || '生成失败');
      }
    } catch (error) {
      message.error('生成失败，请重试');
      console.error('Generate sample data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '销量 (Units)',
      dataIndex: 'units',
      key: 'units',
      render: (units: number) => units.toLocaleString(),
    },
    {
      title: '销售额 ($)',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => `$${sales.toLocaleString()}`,
    },
    {
      title: '去年销量',
      dataIndex: 'lastYearUnits',
      key: 'lastYearUnits',
      render: (units: number) => units.toLocaleString(),
    },
    {
      title: '去年销售额',
      dataIndex: 'lastYearSales',
      key: 'lastYearSales',
      render: (sales: number) => `$${sales.toLocaleString()}`,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: SalesData) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条销售数据吗？"
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
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>销售数据配置</Title>
        <p style={{ color: '#666' }}>
          管理前端Sales Dashboard显示的销售数据。可以添加、编辑、删除销售数据，这些数据将在前端图表中显示。
        </p>
        {selectedStore && (
          <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
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
        <Card 
          title="销售数据列表" 
          extra={
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={generateSampleData}
                loading={loading}
              >
                生成样本数据
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                添加销售数据
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={salesData}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ y: 400 }}
          />
        </Card>
      )}

      <Modal
        title={editingData ? '编辑销售数据' : '添加销售数据'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingData(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="销量 (Units)"
            name="units"
            rules={[
              { required: true, message: '请输入销量' },
              { type: 'number', min: 0, message: '销量必须为正数' }
            ]}
          >
            <InputNumber
              placeholder="请输入销量"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="销售额 ($)"
            name="sales"
            rules={[
              { required: true, message: '请输入销售额' },
              { type: 'number', min: 0, message: '销售额必须为正数' }
            ]}
          >
            <InputNumber
              placeholder="请输入销售额"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            label="去年同期销量"
            name="lastYearUnits"
            rules={[
              { required: true, message: '请输入去年同期销量' },
              { type: 'number', min: 0, message: '销量必须为正数' }
            ]}
          >
            <InputNumber
              placeholder="请输入去年同期销量"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="去年同期销售额 ($)"
            name="lastYearSales"
            rules={[
              { required: true, message: '请输入去年同期销售额' },
              { type: 'number', min: 0, message: '销售额必须为正数' }
            ]}
          >
            <InputNumber
              placeholder="请输入去年同期销售额"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                {editingData ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesDataConfig;
