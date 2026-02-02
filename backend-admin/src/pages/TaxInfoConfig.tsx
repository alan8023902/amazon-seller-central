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
      message.error(t('loadTaxInfoFailed'));
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
        message.success(t('taxInfoSaveSuccess'));
        setTaxInfo(result.data);
      } else {
        message.error(result?.message || t('saveFailed'));
      }
    } catch (error) {
      message.error(t('saveFailedRetry'));
      console.error('Save tax info error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2>{t('taxInfoConfiguration')}</h2>
        <p style={{ color: '#666' }}>
          {t('taxInfoConfigDescription')}
        </p>
      </div>

      {selectedStore && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 6 }}>
          <strong>{t('currentStoreLabel')}:</strong> {selectedStore.name} ({selectedStore.marketplace}) - {selectedStore.currency_symbol}
        </div>
      )}

      <Card title={t('taxInfoSettings')} loading={loading}>
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
            label={t('legalBusinessNameLabel')}
            name="legal_business_name"
            rules={[{ required: true, message: t('legalBusinessNameRequired') }]}
          >
            <Input placeholder={t('legalBusinessNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('registrationAddressLabel')}
            name="place_of_establishment"
            rules={[{ required: true, message: t('registrationAddressRequired') }]}
          >
            <TextArea 
              rows={3}
              placeholder={t('registrationAddressPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            label={t('vatRegistrationNumberLabel')}
            name="vat_registration_number"
          >
            <Input placeholder={t('vatRegistrationNumberPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('rfcIdLabel')}
            name="rfc_id"
          >
            <Input placeholder={t('rfcIdPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('taxInterviewStatusLabel')}
            name="tax_interview_completed"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={t('taxInterviewCompleted')} 
              unCheckedChildren={t('taxInterviewNotCompleted')}
            />
          </Form.Item>

          <Form.Item
            label={t('taxInfoCompletenessLabel')}
            name="tax_information_complete"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={t('taxInfoComplete')} 
              unCheckedChildren={t('taxInfoIncomplete')}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => form.resetFields()}>
                {t('resetForm')}
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
                icon={<SaveOutlined />}
              >
                {t('saveConfiguration')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {taxInfo && (
        <Card title={t('currentConfigInfo')} style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Text strong>{t('legalBusinessNameDisplay')}</Text>
              <div>{taxInfo.legal_business_name || t('notSet')}</div>
            </div>
            <div>
              <Text strong>{t('vatRegistrationNumberDisplay')}</Text>
              <div>{taxInfo.vat_registration_number || t('notSet')}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Text strong>{t('registrationAddressDisplay')}</Text>
              <div>{taxInfo.place_of_establishment || t('notSet')}</div>
            </div>
            <div>
              <Text strong>{t('taxInterviewDisplay')}</Text>
              <div style={{ color: taxInfo.tax_interview_completed ? '#52c41a' : '#ff4d4f' }}>
                {taxInfo.tax_interview_completed ? t('taxInterviewCompleted') : t('taxInterviewNotCompleted')}
              </div>
            </div>
            <div>
              <Text strong>{t('infoCompletenessDisplay')}</Text>
              <div style={{ color: taxInfo.tax_information_complete ? '#52c41a' : '#ff4d4f' }}>
                {taxInfo.tax_information_complete ? t('taxInfoComplete') : t('taxInfoIncomplete')}
              </div>
            </div>
            <div>
              <Text strong>{t('createdTimeDisplay')}</Text>
              <div>{new Date(taxInfo.created_at).toLocaleString('zh-CN')}</div>
            </div>
            <div>
              <Text strong>{t('updatedTimeDisplay')}</Text>
              <div>{new Date(taxInfo.updated_at).toLocaleString('zh-CN')}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TaxInfoConfig;