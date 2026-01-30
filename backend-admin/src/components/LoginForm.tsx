import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface LoginFormProps {
  onLogin: (credentials: { username: string; password: string; captcha: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState('');

  // 生成随机验证码
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  React.useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (values.captcha.toUpperCase() !== captcha.toUpperCase()) {
        message.error('验证码错误');
        setCaptcha(generateCaptcha());
        form.setFieldsValue({ captcha: '' });
        setLoading(false);
        return;
      }
      
      await onLogin(values);
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    form.setFieldsValue({ captcha: '' });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>管理后台登录</Title>
          <p style={{ color: '#666' }}>Amazon Seller Central Admin</p>
        </div>
        
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item
            name="captcha"
            rules={[{ required: true, message: '请输入验证码!' }]}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="验证码"
                style={{ flex: 1 }}
              />
              <div 
                onClick={refreshCaptcha}
                style={{
                  width: 100,
                  height: 40,
                  background: '#f0f0f0',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 16,
                  letterSpacing: 2,
                  userSelect: 'none'
                }}
              >
                {captcha}
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: 40 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          <p>默认账号: admin / 密码: admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
