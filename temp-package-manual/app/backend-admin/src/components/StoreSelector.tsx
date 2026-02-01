import React, { useState, useEffect } from 'react';
import { Select, message, Button } from 'antd';
import { ShopOutlined, PlusOutlined } from '@ant-design/icons';
import AddStoreModal from './AddStoreModal';
import { ADMIN_API_CONFIG, adminApiGet } from '../config/api';

interface Store {
  id: string;
  name: string;
  marketplace: string;
  currency_symbol: string;
  is_active: boolean;
}

interface StoreSelectorProps {
  value?: string;
  onChange?: (storeId: string, store: Store) => void;
  style?: React.CSSProperties;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ value, onChange, style }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | undefined>(value);
  const [showAddModal, setShowAddModal] = useState(false);

  // 加载店铺列表
  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.STORES.LIST);
      
      // adminApiGet 现在直接返回数据数组，不再包装在 {success, data} 中
      if (Array.isArray(data)) {
        setStores(data);
        
        // 如果没有选中的店铺，默认选择第一个激活的店铺
        if (!selectedStore && data.length > 0) {
          const activeStore = data.find((store: Store) => store.is_active) || data[0];
          setSelectedStore(activeStore.id);
          onChange?.(activeStore.id, activeStore);
        }
      } else {
        message.error('店铺数据格式错误');
      }
    } catch (error) {
      console.error('加载店铺失败:', error);
      message.error('加载店铺列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    setSelectedStore(value);
  }, [value]);

  const handleStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setSelectedStore(storeId);
      onChange?.(storeId, store);
      
      // 保存到本地存储
      localStorage.setItem('selectedStoreId', storeId);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Select
        value={selectedStore}
        onChange={handleStoreChange}
        loading={loading}
        placeholder="选择店铺"
        style={{ minWidth: 200, ...style }}
        suffixIcon={<ShopOutlined />}
      >
        {stores.map(store => (
          <Select.Option key={store.id} value={store.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{store.name}</span>
              {!store.is_active && <span style={{ color: '#ff4d4f', fontSize: '12px' }}> (未激活)</span>}
            </div>
          </Select.Option>
        ))}
      </Select>
      
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setShowAddModal(true)}
        size="middle"
      >
        新增店铺
      </Button>

      <AddStoreModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={() => {
          loadStores(); // 重新加载店铺列表
        }}
      />
    </div>
  );
};

export default StoreSelector;
