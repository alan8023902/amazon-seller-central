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
  Switch,
  Typography,
  Select
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  SaveOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut } from '../config/api';

const { Text } = Typography;
const { TextArea } = Input;

interface TaxInfo {
  id: string;
  store_id: string;
  legal_business_name?: string;
  place_of_establishment?: string;
  vat_registration_number?: string;
  rfc_id?: string;
  tax_interview_completed: boolean;
  tax_information_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface TaxInfoConfigProps {
  selectedStoreId: string;
  selectedStore: any;
  onStoreChange: (storeId: string, store: any) => void;
}

const TaxInfoConfig: React.FC<TaxInfoConfigProps> = ({ selectedStoreId, selectedStore }) => {
  const { t } = useTranslation();
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  // 如果没有选择店铺，使用默认店铺
  const storeId = selectedStoreId || 'store-us-main';

  useEffect(() => {
    if (storeId) {
      loadTaxInfo();
    }
  }, [storeId]);

  const loadTaxInfo = async () => {
    setLoading(true);
    try {
      const result = await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.TAX_INFO.BY_STORE(storeId));
      console.log('Load tax info result:', result);
      
      if (result) {
        setTaxInfo(result);
        form.setFieldsValue(result);
      }
    } catch (error) {
      console.error('Load tax info error:', error);
      message.error('加载税务信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const result = await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.TAX_INFO.UPDATE(storeId), values);
      console.log('Save tax info result:', result);
      
      if (result && result.success) {
        message.success('税务信息保存成功！');
        setTaxInfo(result.data);
      } else {
        message.error(result?.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败，请重试');
      console.error('Save tax info error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2>税务信息配置</h2>
        <p style={{ color: '#666' }}>
          管理店铺的税务注册信息和合规设置，这些信息将在前端Tax Information页面中显示。
        </p>
      </div>

      {selectedStore && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 6 }}>
          <strong>当前店铺:</strong> {selectedStore.name} ({selectedStore.marketplace}) - {selectedStore.currency_symbol}
        </div>
      )}

      <Card title="税务信息设置" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            tax_interview_completed: false,
            tax_information_complete: false,
          }}
        >
          <Form.Item
            label="法定企业名称"
            name="legal_business_name"
            rules={[{ required: true, message: '请输入法定企业名称' }]}
          >
            <Input placeholder="请输入法定企业名称" />
          </Form.Item>

          <Form.Item
            label="注册地址"
            name="place_of_establishment"
            rules={[{ required: true, message: '请输入注册地址' }]}
          >
            <TextArea 
              rows={3}
              placeholder="请输入完整的注册地址"
            />
          </Form.Item>

          <Form.Item
            label="VAT注册号"
            name="vat_registration_number"
          >
            <Input placeholder="请输入VAT注册号（如适用）" />
          </Form.Item>

          <Form.Item
            label="RFC ID"
            name="rfc_id"
          >
            <Input placeholder="请输入RFC ID（如适用）" />
          </Form.Item>

          <Form.Item
            label="税务访谈状态"
            name="tax_interview_completed"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="已完成" 
              unCheckedChildren="未完成"
            />
          </Form.Item>

          <Form.Item
            label="税务信息完整性"
            name="tax_information_complete"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="完整" 
              unCheckedChildren="不完整"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
                icon={<SaveOutlined />}
              >
                保存配置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {taxInfo && (
        <Card title="当前配置信息" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Text strong>法定企业名称:</Text>
              <div>{taxInfo.legal_business_name || '未设置'}</div>
            </div>
            <div>
              <Text strong>VAT注册号:</Text>
              <div>{taxInfo.vat_registration_number || '未设置'}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Text strong>注册地址:</Text>
              <div>{taxInfo.place_of_establishment || '未设置'}</div>
            </div>
            <div>
              <Text strong>税务访谈:</Text>
              <div style={{ color: taxInfo.tax_interview_completed ? '#52c41a' : '#ff4d4f' }}>
                {taxInfo.tax_interview_completed ? '已完成' : '未完成'}
              </div>
            </div>
            <div>
              <Text strong>信息完整性:</Text>
              <div style={{ color: taxInfo.tax_information_complete ? '#52c41a' : '#ff4d4f' }}>
                {taxInfo.tax_information_complete ? '完整' : '不完整'}
              </div>
            </div>
            <div>
              <Text strong>创建时间:</Text>
              <div>{new Date(taxInfo.created_at).toLocaleString('zh-CN')}</div>
            </div>
            <div>
              <Text strong>更新时间:</Text>
              <div>{new Date(taxInfo.updated_at).toLocaleString('zh-CN')}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TaxInfoConfig;