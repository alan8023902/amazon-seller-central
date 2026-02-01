import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Divider,
  Row,
  Col,
  message,
  Select,
  Tag,
  Table,
  Modal,
  DatePicker
} from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPost, adminApiPut } from '../config/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const { TextArea } = Input;

interface SellingApplication {
  id: string;
  store_id: string;
  type: string;
  brand: string;
  category: string;
  status: 'Approved' | 'Under Review' | 'Rejected' | 'Action Required' | 'Pending';
  submittedDate: string;
  lastUpdated: string;
  description: string;
  documents?: string[];
}

const SellingApplicationsConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingApplication, setEditingApplication] = useState<SellingApplication | null>(null);
  const queryClient = useQueryClient();

  // 获取所有店铺
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const data = await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.STORES.LIST);
      // adminApiGet 现在直接返回数据数组
      return Array.isArray(data) ? data : [];
    },
  });

  // 获取销售申请数据
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['selling-applications', selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return [];
      const data = await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.SELLING_APPLICATIONS.BY_STORE(selectedStoreId));
      // adminApiGet 现在直接返回数据
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedStoreId,
  });

  // 设置默认店铺
  React.useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const applicationData = {
        ...values,
        store_id: selectedStoreId,
        submittedDate: values.submittedDate.format('YYYY-MM-DD'),
        lastUpdated: dayjs().format('YYYY-MM-DD'),
        documents: values.documents ? values.documents.split(',').map((doc: string) => doc.trim()) : []
      };

      if (editingApplication) {
        // 更新现有申请
        const result = await adminApiPut(`/api/selling-applications/${editingApplication.id}`, applicationData);
        
        if (result.success) {
          message.success('销售申请更新成功！');
        } else {
          throw new Error('Failed to update application');
        }
      } else {
        // 创建新申请
        const result = await adminApiPost('/api/selling-applications', applicationData);
        
        if (result.success) {
          message.success('销售申请创建成功！');
        } else {
          throw new Error('Failed to create application');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['selling-applications', selectedStoreId] });
      setIsModalVisible(false);
      setEditingApplication(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (application: SellingApplication) => {
    setEditingApplication(application);
    form.setFieldsValue({
      ...application,
      submittedDate: dayjs(application.submittedDate),
      documents: application.documents?.join(', ') || ''
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingApplication(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'green';
      case 'Under Review': return 'blue';
      case 'Action Required': return 'orange';
      case 'Rejected': return 'red';
      case 'Pending': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '申请ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '提交日期',
      dataIndex: 'submittedDate',
      key: 'submittedDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: SellingApplication) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>销售申请配置</Title>
        <Select
          style={{ width: 200 }}
          placeholder="选择店铺"
          value={selectedStoreId}
          onChange={setSelectedStoreId}
        >
          {stores.map((store: any) => (
            <Select.Option key={store.id} value={store.id}>
              {store.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Text type="secondary">
        管理销售申请数据，包括品牌注册、类别审批和解除限制请求。
      </Text>

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>销售申请列表</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加申请
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          loading={applicationsLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingApplication ? '编辑销售申请' : '添加销售申请'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingApplication(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="申请类型"
                name="type"
                rules={[{ required: true, message: '请选择申请类型' }]}
              >
                <Select placeholder="选择申请类型">
                  <Select.Option value="Brand Registry">品牌注册</Select.Option>
                  <Select.Option value="Category Approval">类别审批</Select.Option>
                  <Select.Option value="Ungating Request">解除限制请求</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="品牌名称"
                name="brand"
                rules={[{ required: true, message: '请输入品牌名称' }]}
              >
                <Input placeholder="输入品牌名称" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="类别"
                name="category"
                rules={[{ required: true, message: '请输入类别' }]}
              >
                <Input placeholder="输入类别" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="选择状态">
                  <Select.Option value="Approved">已批准</Select.Option>
                  <Select.Option value="Under Review">审核中</Select.Option>
                  <Select.Option value="Action Required">需要操作</Select.Option>
                  <Select.Option value="Rejected">已拒绝</Select.Option>
                  <Select.Option value="Pending">待处理</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="提交日期"
                name="submittedDate"
                rules={[{ required: true, message: '请选择提交日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="文档列表"
                name="documents"
              >
                <Input placeholder="输入文档名称，用逗号分隔" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="描述"
                name="description"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <TextArea rows={3} placeholder="输入申请描述" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
              >
                {editingApplication ? '更新' : '创建'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingApplication(null);
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

export default SellingApplicationsConfig;


