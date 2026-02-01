import React from 'react';
import { 
  Card, 
  Button, 
  message, 
  Typography,
  Space,
  Form,
  InputNumber,
  Row,
  Col,
  Statistic,
  Progress,
  Divider
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPut } from '../config/api';

const { Title } = Typography;

interface AccountHealthConfigProps {
  selectedStoreId: string;
  selectedStore: any;
}

const AccountHealthConfig: React.FC<AccountHealthConfigProps> = ({ 
  selectedStoreId, 
  selectedStore 
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // 获取Account Health数据
  const { data: accountHealthData, isLoading } = useQuery({
    queryKey: ['accountHealthData', selectedStoreId],
    queryFn: async () => {
      if (!selectedStoreId) return null;
      const data = await adminApiGet(`/api/account-health/${selectedStoreId}`);
      // adminApiGet 现在直接返回数据
      return data || null;
    },
    enabled: !!selectedStoreId,
  });

  // 当数据加载完成时，更新表单
  React.useEffect(() => {
    if (accountHealthData) {
      form.setFieldsValue({
        ...accountHealthData,
        // Flatten nested objects for form
        seller_fulfilled_defect_rate: accountHealthData.order_defect_rate.seller_fulfilled,
        fulfilled_by_amazon_defect_rate: accountHealthData.order_defect_rate.fulfilled_by_amazon,
        negative_feedback: accountHealthData.policy_violations.negative_feedback,
        a_to_z_claims: accountHealthData.policy_violations.a_to_z_claims,
        chargeback_claims: accountHealthData.policy_violations.chargeback_claims,
        late_shipment_rate: accountHealthData.shipping_performance.late_shipment_rate,
        pre_fulfillment_cancel_rate: accountHealthData.shipping_performance.pre_fulfillment_cancel_rate,
        valid_tracking_rate: accountHealthData.shipping_performance.valid_tracking_rate,
        on_time_delivery_rate: accountHealthData.shipping_performance.on_time_delivery_rate,
        product_policy_violations: accountHealthData.policy_compliance.product_policy_violations,
        listing_policy_violations: accountHealthData.policy_compliance.listing_policy_violations,
        intellectual_property_violations: accountHealthData.policy_compliance.intellectual_property_violations,
        customer_product_reviews: accountHealthData.policy_compliance.customer_product_reviews,
        other_policy_violations: accountHealthData.policy_compliance.other_policy_violations
      });
    }
  }, [accountHealthData, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Restructure data to match API format
      const formattedValues = {
        order_defect_rate: {
          seller_fulfilled: values.seller_fulfilled_defect_rate,
          fulfilled_by_amazon: values.fulfilled_by_amazon_defect_rate
        },
        policy_violations: {
          negative_feedback: values.negative_feedback,
          a_to_z_claims: values.a_to_z_claims,
          chargeback_claims: values.chargeback_claims
        },
        account_health_rating: values.account_health_rating,
        shipping_performance: {
          late_shipment_rate: values.late_shipment_rate,
          pre_fulfillment_cancel_rate: values.pre_fulfillment_cancel_rate,
          valid_tracking_rate: values.valid_tracking_rate,
          on_time_delivery_rate: values.on_time_delivery_rate
        },
        policy_compliance: {
          product_policy_violations: values.product_policy_violations,
          listing_policy_violations: values.listing_policy_violations,
          intellectual_property_violations: values.intellectual_property_violations,
          customer_product_reviews: values.customer_product_reviews,
          other_policy_violations: values.other_policy_violations
        }
      };
      
      const data = await adminApiPut(`/api/account-health/${selectedStoreId}`, formattedValues);
      if (data.success) {
        message.success(t('operationSuccess'));
        queryClient.invalidateQueries({ queryKey: ['accountHealthData'] });
      } else {
        message.error(t('operationFailed'));
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      message.error(t('operationFailed'));
    }
  };

  const handleReset = () => {
    if (accountHealthData) {
      form.setFieldsValue({
        ...accountHealthData,
        seller_fulfilled_defect_rate: accountHealthData.order_defect_rate.seller_fulfilled,
        fulfilled_by_amazon_defect_rate: accountHealthData.order_defect_rate.fulfilled_by_amazon,
        negative_feedback: accountHealthData.policy_violations.negative_feedback,
        a_to_z_claims: accountHealthData.policy_violations.a_to_z_claims,
        chargeback_claims: accountHealthData.policy_violations.chargeback_claims,
        late_shipment_rate: accountHealthData.shipping_performance.late_shipment_rate,
        pre_fulfillment_cancel_rate: accountHealthData.shipping_performance.pre_fulfillment_cancel_rate,
        valid_tracking_rate: accountHealthData.shipping_performance.valid_tracking_rate,
        on_time_delivery_rate: accountHealthData.shipping_performance.on_time_delivery_rate,
        product_policy_violations: accountHealthData.policy_compliance.product_policy_violations,
        listing_policy_violations: accountHealthData.policy_compliance.listing_policy_violations,
        intellectual_property_violations: accountHealthData.policy_compliance.intellectual_property_violations,
        customer_product_reviews: accountHealthData.policy_compliance.customer_product_reviews,
        other_policy_violations: accountHealthData.policy_compliance.other_policy_violations
      });
      message.info(t('resetToOriginalData'));
    }
  };

  const getHealthRatingColor = (rating: number) => {
    if (rating >= 900) return '#52c41a'; // Green
    if (rating >= 700) return '#faad14'; // Orange
    return '#f5222d'; // Red
  };

  const getHealthRatingStatus = (rating: number) => {
    if (rating >= 900) return 'success';
    if (rating >= 700) return 'normal';
    return 'exception';
  };

  const currentStore = selectedStore;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>{t('accountHealthDataConfig')}</Title>
        {selectedStore && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            {t('currentStore')}: <strong>{selectedStore.name}</strong> ({selectedStore.marketplace})
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
            {t('pleaseSelectStore')}
          </div>
        </Card>
      ) : (
        <>
          {/* 当前数据概览 */}
          <Card title={`📊 ${t('currentAccountHealthOverview')}`} style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title={t('accountHealthRating')}
                  value={accountHealthData?.account_health_rating || 0}
                  suffix="/ 1000"
                  valueStyle={{ color: getHealthRatingColor(accountHealthData?.account_health_rating || 0) }}
                />
                <Progress 
                  percent={(accountHealthData?.account_health_rating || 0) / 10} 
                  status={getHealthRatingStatus(accountHealthData?.account_health_rating || 0)}
                  showInfo={false}
                  style={{ marginTop: 8 }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={`${t('sellerFulfilled')} Defect Rate`}
                  value={accountHealthData?.order_defect_rate?.seller_fulfilled || 0}
                  suffix="%"
                  precision={1}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={t('fulfilledByAmazon') + ' Defect Rate'}
                  value={accountHealthData?.order_defect_rate?.fulfilled_by_amazon || 0}
                  suffix="%"
                  precision={1}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title={t('validTrackingRate')}
                  value={accountHealthData?.shipping_performance?.valid_tracking_rate || 0}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>

          {/* 编辑表单 */}
          <Card 
            title={`✏️ ${t('editAccountHealthData')}`} 
            extra={
              <Space>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleReset}
                >
                  {t('reset')}
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSave}
                  loading={isLoading}
                >
                  {t('saveChanges')}
                </Button>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                account_health_rating: 982,
                seller_fulfilled_defect_rate: 3,
                fulfilled_by_amazon_defect_rate: 2,
                negative_feedback: 0,
                a_to_z_claims: 0,
                chargeback_claims: 0,
                late_shipment_rate: 0,
                pre_fulfillment_cancel_rate: 0,
                valid_tracking_rate: 99,
                on_time_delivery_rate: null,
                product_policy_violations: 0,
                listing_policy_violations: 0,
                intellectual_property_violations: 0,
                customer_product_reviews: 0,
                other_policy_violations: 0
              }}
            >
              {/* Account Health Rating */}
              <Divider orientation="left">{t('accountHealthRating')}</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={`${t('accountHealthRating')} (0-1000)`}
                    name="account_health_rating"
                    rules={[{ required: true, message: `${t('pleaseEnter')} ${t('accountHealthRating')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={1000}
                      placeholder="982"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Order Defect Rate */}
              <Divider orientation="left">{t('orderDefectRate')}</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={`${t('sellerFulfilled')} (%)`}
                    name="seller_fulfilled_defect_rate"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('sellerFulfilled')}${t('orderDefectRate')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="3.0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={`${t('fulfilledByAmazon')} (%)`}
                    name="fulfilled_by_amazon_defect_rate"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('fulfilledByAmazon')}${t('orderDefectRate')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="2.0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Policy Violations */}
              <Divider orientation="left">{t('policyViolations')}</Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={`${t('negativeFeedback')} (%)`}
                    name="negative_feedback"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('negativeFeedbackRateValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={`${t('aToZClaims')} (%)`}
                    name="a_to_z_claims"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('aToZClaimsRateValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={`${t('chargebackClaims')} (%)`}
                    name="chargeback_claims"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('chargebackClaimsRateValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Shipping Performance */}
              <Divider orientation="left">{t('shippingPerformance')}</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={`${t('lateShipmentRate')} (%)`}
                    name="late_shipment_rate"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('lateShipmentRateValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={`${t('preFulfillmentCancelRate')} (%)`}
                    name="pre_fulfillment_cancel_rate"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('preFulfillmentCancelRateValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={`${t('validTrackingRate')} (%)`}
                    name="valid_tracking_rate"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('validTrackingRateValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={0}
                      placeholder="99"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={`${t('onTimeDeliveryRate')} (%) - ${t('optional')}`}
                    name="on_time_delivery_rate"
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={1}
                      placeholder="N/A"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Policy Compliance */}
              <Divider orientation="left">{t('policyComplianceIssues')}</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('productPolicyViolations')}
                    name="product_policy_violations"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('productPolicyViolationsValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('listingPolicyViolations')}
                    name="listing_policy_violations"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('listingPolicyViolationsValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={t('intellectualPropertyViolations')}
                    name="intellectual_property_violations"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('intellectualPropertyViolationsValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={t('customerProductReviews')}
                    name="customer_product_reviews"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('customerProductReviewsValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={t('otherPolicyViolations')}
                    name="other_policy_violations"
                    rules={[{ required: true, message: `${t('pleaseEnter')}${t('otherPolicyViolationsValidation')}` }]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: '100%' }}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* 使用说明 */}
          <Card title={`💡 ${t('usageInstructions')}`} style={{ marginTop: 24 }}>
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Account Health</strong> {t('accountHealthUsageNote')}</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li><strong>{t('accountHealthRating')}</strong>: {t('accountHealthRatingDesc')}</li>
                <li><strong>{t('orderDefectRate')}</strong>: {t('orderDefectRateDesc')}</li>
                <li><strong>{t('policyViolations')}</strong>: {t('policyViolationsDesc')}</li>
                <li><strong>{t('shippingPerformance')}</strong>: {t('shippingPerformanceDesc')}</li>
                <li><strong>{t('policyComplianceIssues')}</strong>: {t('policyComplianceDesc')}</li>
              </ul>
              <p><strong>{t('modificationNote')}</strong></p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountHealthConfig;


