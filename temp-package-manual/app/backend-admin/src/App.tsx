import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Space, App as AntApp } from 'antd';
import { 
  DashboardOutlined, 
  ShopOutlined, 
  ProductOutlined, 
  BarChartOutlined,
  HeartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LoginForm from './components/LoginForm';
import StoreSelector from './components/StoreSelector';
import LanguageSwitcher from './components/LanguageSwitcher';
import Dashboard from './pages/Dashboard';
import StoreSettings from './pages/StoreSettings';
import StoreManagement from './pages/StoreManagement';
import ProductManagement from './pages/ProductManagement';
import SalesDataConfig from './pages/SalesDataConfig';
import CXHealthConfig from './pages/CXHealthConfig';
import BusinessReportsConfig from './pages/BusinessReportsConfig';
import AccountHealthConfig from './pages/AccountHealthConfig';
import DashboardConfig from './pages/DashboardConfig';
import CommunicationsConfig from './pages/CommunicationsConfig';
import UserManagement from './pages/UserManagement';
import TaxInfoConfig from './pages/TaxInfoConfig';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <AntApp>
      <AppContent />
    </AntApp>
  );
}

function AppContent() {
  const { message } = AntApp.useApp();
  const { t, i18n } = useTranslation();
  const [selectedKey, setSelectedKey] = React.useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<any>(null);

  // Initialize language and login state from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('admin-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
    
    // Check for saved login state
    const savedLoginState = localStorage.getItem('admin-logged-in');
    const savedUser = localStorage.getItem('admin-current-user');
    if (savedLoginState === 'true' && savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
    }
  }, [i18n]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard'),
    },
    {
      key: 'dashboard-config',
      icon: <SettingOutlined />,
      label: t('dashboardConfig'),
    },
    {
      key: 'user-management',
      icon: <UserOutlined />,
      label: t('userManagement'),
    },
    {
      key: 'communications',
      icon: <BarChartOutlined />,
      label: t('communicationsConfig'),
    },
    {
      key: 'store',
      icon: <ShopOutlined />,
      label: t('storeManagement'),
    },
    {
      key: 'products',
      icon: <ProductOutlined />,
      label: t('productManagement'),
    },
    {
      key: 'sales',
      icon: <BarChartOutlined />,
      label: t('salesDataConfig'),
    },
    {
      key: 'business-reports',
      icon: <BarChartOutlined />,
      label: t('businessReportsConfig'),
    },
    {
      key: 'cx-health',
      icon: <HeartOutlined />,
      label: t('vocDataManagement'),
    },
    {
      key: 'account-health',
      icon: <SettingOutlined />,
      label: t('accountHealthConfig'),
    },
    {
      key: 'tax-info',
      icon: <SettingOutlined />,
      label: '税务信息配置',
    },
  ];

  // 默认账号密码
  const defaultCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  const handleLogin = async (credentials: { username: string; password: string; captcha: string }) => {
    // 简单的账号密码验证
    if (credentials.username === defaultCredentials.username && 
        credentials.password === defaultCredentials.password) {
      setIsLoggedIn(true);
      setCurrentUser(credentials.username);
      // Save login state to localStorage
      localStorage.setItem('admin-logged-in', 'true');
      localStorage.setItem('admin-current-user', credentials.username);
      message.success(t('operationSuccess'));
    } else {
      message.error('用户名或密码错误！');
      throw new Error('Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setSelectedKey('dashboard');
    // Clear login state from localStorage
    localStorage.removeItem('admin-logged-in');
    localStorage.removeItem('admin-current-user');
    message.success('已退出登录');
  };

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const handleStoreChange = (storeId: string, store: any) => {
    setSelectedStoreId(storeId);
    setSelectedStore(store);
    message.success(`已切换到店铺: ${store.name}`);
  };

  const handleMenuClick = (e: any) => {
    setSelectedKey(e.key);
  };

  const renderContent = () => {
    // 传递选中的店铺信息给所有页面组件
    const commonProps = {
      selectedStoreId,
      selectedStore,
      onStoreChange: handleStoreChange
    };

    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'dashboard-config':
        return <DashboardConfig {...commonProps} />;
      case 'user-management':
        return <UserManagement {...commonProps} />;
      case 'communications':
        return <CommunicationsConfig {...commonProps} />;
      case 'store':
        return <StoreManagement {...commonProps} />;
      case 'products':
        return <ProductManagement {...commonProps} />;
      case 'sales':
        return <SalesDataConfig {...commonProps} />;
      case 'business-reports':
        return <BusinessReportsConfig {...commonProps} />;
      case 'cx-health':
        return <CXHealthConfig {...commonProps} />;
      case 'account-health':
        return <AccountHealthConfig {...commonProps} />;
      case 'tax-info':
        return <TaxInfoConfig {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#232F3E', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Amazon Seller Central - 数据管理后台
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSwitcher />
          <StoreSelector
            value={selectedStoreId}
            onChange={handleStoreChange}
            style={{ minWidth: 250 }}
          />
          <span style={{ color: 'white' }}>
            <UserOutlined /> {currentUser}
          </span>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            style={{ color: 'white' }}
          >
            退出
          </Button>
        </div>
      </Header>
      
      <Layout>
        <Sider width={250} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
              borderRadius: 8,
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
