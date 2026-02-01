import React from 'react';
import { Card, Form, Input, Select, Button, message, Typography } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut } from '../config/api';

const { Title } = Typography;


interface StoreSettingsProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ selectedStoreId, selectedStore }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: storeData, isLoading } = useQuery({
    queryKey: ['store', selectedStoreId],
    queryFn: () => adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.STORES.DETAIL(selectedStoreId)),
    enabled: !!selectedStoreId,
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (values: any) => {
      return await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.STORES.UPDATE(selectedStoreId), values);
    },
    onSuccess: () => {
      message.success('店铺信息更新成功！');
      queryClient.invalidateQueries({ queryKey: ['store'] });
    },
    onError: () => {
      message.error('更新失败，请重试');
    },
  });

  const handleSubmit = (values: any) => {
    updateStoreMutation.mutate(values);
  };

  React.useEffect(() => {
    if (storeData) {
      form.setFieldsValue(storeData);
    } else if (selectedStore) {
      // 如果API没有返回数据，使用选中的店铺信息
      form.setFieldsValue(selectedStore);
    }
  }, [storeData, selectedStore, form]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>店铺设置</Title>
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
        <Card title="基本信息" loading={isLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              label="店铺名称"
              name="name"
              rules={[{ required: true, message: '请输入店铺名称' }]}
            >
              <Input placeholder="请输入店铺名称" />
            </Form.Item>

            <Form.Item
              label="市场"
              name="marketplace"
              rules={[{ required: true, message: '请选择市场' }]}
            >
              <Select placeholder="请选择市场">
                <Select.Option value="United States">United States</Select.Option>
                <Select.Option value="Japan">Japan</Select.Option>
                <Select.Option value="United Kingdom">United Kingdom</Select.Option>
                <Select.Option value="Germany">Germany</Select.Option>
                <Select.Option value="Europe">Europe</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="国家/地区"
              name="country"
              rules={[{ required: true, message: '请选择国家/地区' }]}
            >
              <Select placeholder="请选择国家/地区">
                <Select.Option value="United States">United States</Select.Option>
                <Select.Option value="Japan">Japan</Select.Option>
                <Select.Option value="United Kingdom">United Kingdom</Select.Option>
                <Select.Option value="Germany">Germany</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="货币符号"
              name="currency_symbol"
              rules={[{ required: true, message: '请选择货币符号' }]}
            >
              <Select placeholder="请选择货币符号">
                <Select.Option value="$">$ (美元)</Select.Option>
                <Select.Option value="¥">¥ (日元)</Select.Option>
                <Select.Option value="£">£ (英镑)</Select.Option>
                <Select.Option value="€">€ (欧元)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="时区"
              name="timezone"
              rules={[{ required: true, message: '请选择时区' }]}
            >
              <Select placeholder="请选择时区">
                <Select.Option value="America/New_York">America/New_York (UTC-5)</Select.Option>
                <Select.Option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</Select.Option>
                <Select.Option value="Europe/London">Europe/London (UTC+0)</Select.Option>
                <Select.Option value="Europe/Berlin">Europe/Berlin (UTC+1)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="业务类型"
              name="business_type"
              rules={[{ required: true, message: '请选择业务类型' }]}
            >
              <Select placeholder="请选择业务类型">
                <Select.Option value="Individual">Individual</Select.Option>
                <Select.Option value="Business">Business</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="联系邮箱"
              name="contact_email"
            >
              <Input placeholder="请输入联系邮箱" type="email" />
            </Form.Item>

            <Form.Item
              label="联系电话"
              name="contact_phone"
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>

            <Form.Item
              label="税务ID"
              name="tax_id"
            >
              <Input placeholder="请输入税务ID" />
            </Form.Item>

            <Form.Item
              label="VAT号码"
              name="vat_number"
            >
              <Input placeholder="请输入VAT号码" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={updateStoreMutation.isPending}
              >
                保存设置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default StoreSettings;


