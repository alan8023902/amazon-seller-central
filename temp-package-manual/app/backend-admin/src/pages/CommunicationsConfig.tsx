import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Modal, 
  Form, 
  InputNumber, 
  message,
  Tabs,
  Tag,
  Typography,
  Statistic,
  Row,
  Col,
  Popconfirm
} from 'antd';
import { 
  MessageOutlined, 
  LikeOutlined, 
  EyeOutlined, 
  CommentOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut, adminApiDelete } from '../config/api';

const { Title, Text } = Typography;

const { TextArea } = Input;

interface CommunicationsConfigProps {
  selectedStoreId: string;
  selectedStore: any;
}

const CommunicationsConfig: React.FC<CommunicationsConfigProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const [activeTab, setActiveTab] = useState('forums');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取Communications数据
  const { data: communicationsData, isLoading } = useQuery({
    queryKey: ['communications', selectedStoreId],
    queryFn: async () => {
      const result = await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.COMMUNICATIONS.BY_STORE(selectedStoreId));
      // adminApiGet 现在直接返回数据，不需要检查 success
      return result;
    },
    enabled: !!selectedStoreId,
  });

  // 更新数据的mutation
  const updateMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: string; data: any }) => {
      const endpoint = type === 'forums' 
        ? ADMIN_API_CONFIG.ENDPOINTS.COMMUNICATIONS.UPDATE_FORUM(selectedStoreId, id)
        : ADMIN_API_CONFIG.ENDPOINTS.COMMUNICATIONS.UPDATE_NEWS(selectedStoreId, id);
      
      const result = await adminApiPut(endpoint, data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      message.success('数据更新成功！');
      setEditModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
    onError: (error: any) => {
      message.error('更新失败: ' + error.message);
    }
  });

  // 删除数据的mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      const endpoint = type === 'forums' 
        ? `/api/communications/forums/${selectedStoreId}/${id}`
        : `/api/communications/news/${selectedStoreId}/${id}`;
      
      const result = await adminApiDelete(endpoint);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      message.success('数据删除成功！');
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
    onError: (error: any) => {
      message.error('删除失败: ' + error.message);
    }
  });

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    form.setFieldsValue(item);
    setEditModalVisible(true);
  };

  const handleDelete = (item: any, type: string) => {
    deleteMutation.mutate({ type, id: item.id });
  };

  const handleSubmit = (values: any) => {
    if (editingItem) {
      updateMutation.mutate({
        type: editingItem.type,
        id: editingItem.id,
        data: values
      });
    }
  };

  // Forums表格列
  const forumColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: '观看次数',
      dataIndex: 'views',
      key: 'views',
      width: 120,
      render: (views: number) => (
        <Space>
          <EyeOutlined />
          <Text strong>{views.toLocaleString()}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.views - b.views,
    },
    {
      title: '回复数',
      dataIndex: 'replies',
      key: 'replies',
      width: 100,
      render: (replies: number) => (
        <Space>
          <CommentOutlined />
          <Text>{replies.toLocaleString()}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.replies - b.replies,
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 100,
      render: (likes: number) => (
        <Space>
          <LikeOutlined />
          <Text>{likes.toLocaleString()}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.likes - b.likes,
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_: any, record: any) => (
        <Space>
          {record.is_pinned && <Tag color="red">置顶</Tag>}
          {record.is_solved && <Tag color="green">已解决</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, 'forums')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个论坛帖子吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record, 'forums')}
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

  // News表格列
  const newsColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => <Tag color="purple">{category}</Tag>
    },
    {
      title: '观看次数',
      dataIndex: 'views',
      key: 'views',
      width: 120,
      render: (views: number) => (
        <Space>
          <EyeOutlined />
          <Text strong>{views.toLocaleString()}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.views - b.views,
    },
    {
      title: '评论数',
      dataIndex: 'comments',
      key: 'comments',
      width: 100,
      render: (comments: number) => (
        <Space>
          <CommentOutlined />
          <Text>{comments.toLocaleString()}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.comments - b.comments,
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 100,
      render: (likes: number) => (
        <Space>
          <LikeOutlined />
          <Text>{likes.toLocaleString()}</Text>
        </Space>
      ),
      sorter: (a: any, b: any) => a.likes - b.likes,
    },
    {
      title: '阅读时间',
      dataIndex: 'read_time',
      key: 'read_time',
      width: 100,
      render: (time: number) => `${time}分钟`,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: any) => (
        record.is_featured ? <Tag color="gold">精选</Tag> : null
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record, 'news')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个新闻吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record, 'news')}
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

  const tabItems = [
    {
      key: 'forums',
      label: (
        <span>
          <MessageOutlined />
          Seller Forums
        </span>
      ),
      children: (
        <div>
          {/* 统计信息 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic 
                title="总帖子数" 
                value={communicationsData?.seller_forums?.length || 0} 
                prefix={<MessageOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="总观看次数" 
                value={communicationsData?.seller_forums?.reduce((sum: number, item: any) => sum + item.views, 0) || 0}
                prefix={<EyeOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="总回复数" 
                value={communicationsData?.seller_forums?.reduce((sum: number, item: any) => sum + item.replies, 0) || 0}
                prefix={<CommentOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="总点赞数" 
                value={communicationsData?.seller_forums?.reduce((sum: number, item: any) => sum + item.likes, 0) || 0}
                prefix={<LikeOutlined />}
              />
            </Col>
          </Row>
          
          <Table
            columns={forumColumns}
            dataSource={communicationsData?.seller_forums || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
    {
      key: 'news',
      label: (
        <span>
          <CommentOutlined />
          Seller News
        </span>
      ),
      children: (
        <div>
          {/* 统计信息 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic 
                title="总新闻数" 
                value={communicationsData?.seller_news?.length || 0} 
                prefix={<CommentOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="总观看次数" 
                value={communicationsData?.seller_news?.reduce((sum: number, item: any) => sum + item.views, 0) || 0}
                prefix={<EyeOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="总评论数" 
                value={communicationsData?.seller_news?.reduce((sum: number, item: any) => sum + item.comments, 0) || 0}
                prefix={<CommentOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="总点赞数" 
                value={communicationsData?.seller_news?.reduce((sum: number, item: any) => sum + item.likes, 0) || 0}
                prefix={<LikeOutlined />}
              />
            </Col>
          </Row>
          
          <Table
            columns={newsColumns}
            dataSource={communicationsData?.seller_news || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Communications 配置</Title>
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
        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>
      )}

      {/* 编辑模态框 */}
      <Modal
        title={`编辑 ${editingItem?.type === 'forums' ? 'Forum帖子' : '新闻'}`}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingItem(null);
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
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>

          {editingItem?.type === 'forums' && (
            <Form.Item
              label="作者"
              name="author"
              rules={[{ required: true, message: '请输入作者' }]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select>
              {editingItem?.type === 'forums' ? (
                <>
                  <Select.Option value="General">General</Select.Option>
                  <Select.Option value="FBA">FBA</Select.Option>
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Technical">Technical</Select.Option>
                </>
              ) : (
                <>
                  <Select.Option value="Policy">Policy</Select.Option>
                  <Select.Option value="Features">Features</Select.Option>
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Operations">Operations</Select.Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="观看次数"
                name="views"
                rules={[{ required: true, message: '请输入观看次数' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={editingItem?.type === 'forums' ? '回复数' : '评论数'}
                name={editingItem?.type === 'forums' ? 'replies' : 'comments'}
                rules={[{ required: true, message: '请输入数量' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="点赞数"
                name="likes"
                rules={[{ required: true, message: '请输入点赞数' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={updateMutation.isPending}
              >
                保存
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingItem(null);
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

export default CommunicationsConfig;


