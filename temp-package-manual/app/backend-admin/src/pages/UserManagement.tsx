import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Table, 
  Modal, 
  Space,
  Popconfirm,
  Switch,
  Tooltip,
  Typography,
  Select,
  App
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  CopyOutlined 
} from '@ant-design/icons';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPost, adminApiPut, adminApiDelete } from '../config/api';

const { Text } = Typography;

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  store_id?: string;
  is_active: boolean;
  last_login?: string;
  password: string;
  otp_secret: string;
  created_at: string;
  updated_at: string;
}

interface UserManagementProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ selectedStoreId, selectedStore }) => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // 请求所有用户数据，设置一个较大的limit值来获取所有用户
      const result = await adminApiGet(`${ADMIN_API_CONFIG.ENDPOINTS.USERS.LIST}?limit=1000`);
      console.log('Load users result:', result); // 添加调试日志
      
      // adminApiGet 现在直接返回数据数组
      if (Array.isArray(result)) {
        console.log('Setting users:', result.length, 'users'); // 添加调试日志
        setUsers(result);
      } else {
        console.error('Users data is not array:', result); // 添加调试日志
        message.error('用户数据格式错误');
      }
    } catch (error) {
      message.error('加载用户列表失败');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      let result;
      if (editingUser) {
        result = await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.USERS.UPDATE(editingUser.id), values);
      } else {
        result = await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.USERS.CREATE, values);
      }
      
      console.log('User save result:', result);
      
      if (result && result.success) {
        message.success(editingUser ? '用户更新成功！' : '用户创建成功！');
        setModalVisible(false);
        setEditingUser(null);
        form.resetFields();
        // 立即刷新用户列表
        await loadUsers();
      } else {
        message.error(result?.message || '操作失败');
        console.error('Save failed, result:', result);
      }
    } catch (error) {
      message.error('操作失败，请重试');
      console.error('Save user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOTP = async (userId: string) => {
    try {
      const result = await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.USERS.REFRESH_OTP(userId));
      
      if (result.success) {
        message.success('验证码已刷新！');
        await loadUsers(); // Ensure refresh after OTP update
      } else {
        message.error(result.message || '刷新失败');
      }
    } catch (error) {
      message.error('刷新失败，请重试');
      console.error('Refresh OTP error:', error);
    }
  };

  const refreshPassword = async (userId: string) => {
    try {
      const result = await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.USERS.REFRESH_PASSWORD(userId));
      
      if (result.success) {
        message.success('密码已刷新！');
        await loadUsers(); // Ensure refresh after password update
      } else {
        message.error(result.message || '刷新失败');
      }
    } catch (error) {
      message.error('刷新失败，请重试');
      console.error('Refresh password error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('验证码已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  const handleDelete = async (userId: string) => {
    setLoading(true);
    try {
      const result = await adminApiDelete(ADMIN_API_CONFIG.ENDPOINTS.USERS.DELETE(userId));
      
      if (result.success) {
        message.success('用户删除成功！');
        await loadUsers(); // Ensure refresh after delete
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
      console.error('Delete user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      store_id: user.store_id,
      is_active: user.is_active,
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ is_active: true, role: 'user' });
    setModalVisible(true);
  };

  const columns = [
    {
      title: '用户名 (邮箱)',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span style={{ 
          color: role === 'admin' ? '#f50' : role === 'manager' ? '#108ee9' : '#87d068' 
        }}>
          {role === 'admin' ? '管理员' : role === 'manager' ? '经理' : '用户'}
        </span>
      ),
    },
    {
      title: '密码',
      dataIndex: 'password',
      key: 'password',
      render: (password: string, record: User) => (
        <div className="flex items-center gap-2">
          <Text code copyable={{ text: password, onCopy: () => message.success('密码已复制') }}>
            {password}
          </Text>
          <Tooltip title="刷新密码">
            <Button 
              type="text" 
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => refreshPassword(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: '验证码',
      dataIndex: 'otp_secret',
      key: 'otp_secret',
      render: (otpSecret: string, record: User) => (
        <div className="flex items-center gap-2">
          <Text code copyable={{ text: otpSecret, onCopy: () => message.success('验证码已复制') }}>
            {otpSecret}
          </Text>
          <Tooltip title="刷新验证码">
            <Button 
              type="text" 
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => refreshOTP(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
          {isActive ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: User) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
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
        <h2>前端用户管理</h2>
        <p style={{ color: '#666' }}>
          管理前端登录用户的账号密码和验证码，用户可以使用这些账号登录前端系统。每个用户都有专属的密码（1个英文字母+6位数字）和6位数验证码，可以点击刷新按钮重新生成。
        </p>
      </div>

      <Card 
        title="用户列表" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加用户
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ is_active: true, role: 'user' }}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[
              { required: true, message: '请输入姓名' },
              { min: 2, message: '姓名至少2个字符' }
            ]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="manager">经理</Select.Option>
              <Select.Option value="user">用户</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="关联店铺"
            name="store_id"
          >
            <Input placeholder="店铺ID（可选）" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
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
                {editingUser ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;


