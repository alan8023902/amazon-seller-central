import React from 'react';
import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { ADMIN_API_CONFIG, adminApiPost } from '../config/api';

interface AddStoreModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddStoreModal: React.FC<AddStoreModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.STORES.CREATE, {
        ...values,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (data.success) {
        message.success('店铺创建成功！');
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        message.error(data.message || '创建失败');
      }
    } catch (error) {
      message.error('创建失败，请重试');
      console.error('Create store error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新增店铺"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          business_type: 'Business',
          is_active: true,
          vacation_mode: false,
          auto_pricing: false,
          inventory_alerts: true,
          order_notifications: true,
        }}
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
          label="国家"
          name="country"
          rules={[{ required: true, message: '请选择国家' }]}
        >
          <Select placeholder="请选择国家">
            <Select.Option value="United States">United States</Select.Option>
            <Select.Option value="Japan">Japan</Select.Option>
            <Select.Option value="United Kingdom">United Kingdom</Select.Option>
            <Select.Option value="Germany">Germany</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="时区"
          name="timezone"
          rules={[{ required: true, message: '请选择时区' }]}
        >
          <Select placeholder="请选择时区">
            <Select.Option value="America/New_York">America/New_York</Select.Option>
            <Select.Option value="Asia/Tokyo">Asia/Tokyo</Select.Option>
            <Select.Option value="Europe/London">Europe/London</Select.Option>
            <Select.Option value="Europe/Berlin">Europe/Berlin</Select.Option>
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

        <Form.Item
          label="店铺状态"
          name="is_active"
          valuePropName="checked"
        >
          <Switch checkedChildren="激活" unCheckedChildren="未激活" />
        </Form.Item>

        <Form.Item
          label="假期模式"
          name="vacation_mode"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item
          label="自动定价"
          name="auto_pricing"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item
          label="库存提醒"
          name="inventory_alerts"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item
          label="订单通知"
          name="order_notifications"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStoreModal;
