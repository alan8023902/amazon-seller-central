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
  DatePicker
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut } from '../config/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const { TextArea } = Input;

interface LegalEntityData {
  id: string;
  store_id: string;
  legalBusinessName: string;
  businessAddress: {
    street: string;
    suite: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxInformation: {
    status: string;
    taxId: string;
    taxClassification: string;
  };
  businessType: string;
  registrationDate: string;
}

const LegalEntityConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
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

  // 获取法律实体数据
  const { data: legalEntity, isLoading: legalEntityLoading } = useQuery({
    queryKey: ['legal-entity', selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return null;
      try {
        const data = await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.LEGAL_ENTITY.BY_STORE(selectedStoreId));
        // adminApiGet 现在直接返回数据
        return data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!selectedStoreId,
  });

  // 设置默认店铺
  React.useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  // 当法律实体数据加载完成时，填充表单
  React.useEffect(() => {
    if (legalEntity) {
      form.setFieldsValue({
        legalBusinessName: legalEntity.legalBusinessName,
        street: legalEntity.businessAddress.street,
        suite: legalEntity.businessAddress.suite,
        city: legalEntity.businessAddress.city,
        state: legalEntity.businessAddress.state,
        zipCode: legalEntity.businessAddress.zipCode,
        country: legalEntity.businessAddress.country,
        taxStatus: legalEntity.taxInformation.status,
        taxId: legalEntity.taxInformation.taxId,
        taxClassification: legalEntity.taxInformation.taxClassification,
        businessType: legalEntity.businessType,
        registrationDate: legalEntity.registrationDate ? dayjs(legalEntity.registrationDate) : null,
      });
    }
  }, [legalEntity, form]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const legalEntityData = {
        legalBusinessName: values.legalBusinessName,
        businessAddress: {
          street: values.street,
          suite: values.suite,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        },
        taxInformation: {
          status: values.taxStatus,
          taxId: values.taxId,
          taxClassification: values.taxClassification,
        },
        businessType: values.businessType,
        registrationDate: values.registrationDate ? values.registrationDate.format('YYYY-MM-DD') : null,
      };

      const result = await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.LEGAL_ENTITY.UPDATE(selectedStoreId), legalEntityData);
      
      if (result.success) {
        message.success('法律实体信息保存成功！');
        queryClient.invalidateQueries({ queryKey: ['legal-entity', selectedStoreId] });
      } else {
        throw new Error('Failed to save legal entity data');
      }
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleData = {
      legalBusinessName: 'Sample Technology Co., Ltd.',
      street: '123 Business Street',
      suite: 'Suite 456',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States',
      taxStatus: 'Complete',
      taxId: '12-3456789',
      taxClassification: 'LLC',
      businessType: 'Limited Liability Company',
      registrationDate: dayjs().subtract(1, 'year'),
    };
    
    form.setFieldsValue(sampleData);
    message.success('已生成示例数据');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>法律实体配置</Title>
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
        配置法律实体信息，包括公司名称、地址、税务信息等，这些数据将显示在前端的Legal Entity页面中。
      </Text>

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>法律实体信息</Title>
          <Button icon={<ReloadOutlined />} onClick={generateSampleData}>
            生成示例数据
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* 公司基本信息 */}
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
            <Title level={5}>公司基本信息</Title>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="法定企业名称"
                  name="legalBusinessName"
                  rules={[{ required: true, message: '请输入法定企业名称' }]}
                >
                  <Input placeholder="输入法定企业名称" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="企业类型"
                  name="businessType"
                  rules={[{ required: true, message: '请选择企业类型' }]}
                >
                  <Select placeholder="选择企业类型">
                    <Select.Option value="Limited Liability Company">有限责任公司</Select.Option>
                    <Select.Option value="Corporation">股份公司</Select.Option>
                    <Select.Option value="Partnership">合伙企业</Select.Option>
                    <Select.Option value="Sole Proprietorship">个人独资企业</Select.Option>
                    <Select.Option value="株式会社">株式会社</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="注册日期"
                  name="registrationDate"
                  rules={[{ required: true, message: '请选择注册日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* 企业地址 */}
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
            <Title level={5}>企业地址</Title>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="街道地址"
                  name="street"
                  rules={[{ required: true, message: '请输入街道地址' }]}
                >
                  <Input placeholder="输入街道地址" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="套房/楼层"
                  name="suite"
                >
                  <Input placeholder="输入套房或楼层信息" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="城市"
                  name="city"
                  rules={[{ required: true, message: '请输入城市' }]}
                >
                  <Input placeholder="输入城市" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="州/省"
                  name="state"
                  rules={[{ required: true, message: '请输入州或省' }]}
                >
                  <Input placeholder="输入州或省" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="邮政编码"
                  name="zipCode"
                  rules={[{ required: true, message: '请输入邮政编码' }]}
                >
                  <Input placeholder="输入邮政编码" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="国家"
                  name="country"
                  rules={[{ required: true, message: '请选择国家' }]}
                >
                  <Select placeholder="选择国家">
                    <Select.Option value="United States">美国</Select.Option>
                    <Select.Option value="China">中国</Select.Option>
                    <Select.Option value="Japan">日本</Select.Option>
                    <Select.Option value="United Kingdom">英国</Select.Option>
                    <Select.Option value="Germany">德国</Select.Option>
                    <Select.Option value="Canada">加拿大</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* 税务信息 */}
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
            <Title level={5}>税务信息</Title>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  label="税务状态"
                  name="taxStatus"
                  rules={[{ required: true, message: '请选择税务状态' }]}
                >
                  <Select placeholder="选择税务状态">
                    <Select.Option value="Complete">完成</Select.Option>
                    <Select.Option value="Pending">待处理</Select.Option>
                    <Select.Option value="Under Review">审核中</Select.Option>
                    <Select.Option value="Incomplete">未完成</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="税务ID"
                  name="taxId"
                  rules={[{ required: true, message: '请输入税务ID' }]}
                >
                  <Input placeholder="输入税务ID" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="税务分类"
                  name="taxClassification"
                  rules={[{ required: true, message: '请输入税务分类' }]}
                >
                  <Input placeholder="输入税务分类" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Divider />

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
              >
                保存配置
              </Button>
              <Button onClick={() => form.resetFields()}>
                重置表单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LegalEntityConfig;


