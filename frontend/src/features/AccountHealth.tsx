import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useStore } from '../store';
import { apiGet } from '../config/api';

const Panel: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  right,
  children,
}) => {
  return (
    <div className="bg-white border border-[#d5d9d9]">
      <div className="px-4 py-2.5 border-b border-[#e7e7e7] flex items-center justify-between">
        <div className="text-[13px] font-semibold text-[#0f1111]">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
};

interface AccountHealthData {
  order_defect_rate: {
    seller_fulfilled: number;
    fulfilled_by_amazon: number;
  };
  policy_violations: {
    negative_feedback: number;
    a_to_z_claims: number;
    chargeback_claims: number;
  };
  account_health_rating: number;
  shipping_performance: {
    late_shipment_rate: number;
    pre_fulfillment_cancel_rate: number;
    valid_tracking_rate: number;
    on_time_delivery_rate: number | null;
  };
  policy_compliance: {
    product_policy_violations: number;
    listing_policy_violations: number;
    intellectual_property_violations: number;
    customer_product_reviews: number;
    other_policy_violations: number;
  };
}

const AccountHealth: React.FC = () => {
  const { t } = useI18n();
  const { currentStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [accountHealthData, setAccountHealthData] = useState<AccountHealthData | null>(null);

  // Load account health data from backend
  useEffect(() => {
    const loadAccountHealthData = async () => {
      if (!currentStore?.id) return;

      try {
        setLoading(true);
        const response = await apiGet(`/api/account-health/${currentStore.id}`);
        if (response.success && response.data) {
          setAccountHealthData(response.data);
        }
      } catch (error) {
        console.error('Failed to load account health data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccountHealthData();
  }, [currentStore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#f6f7f8] min-h-screen" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="px-6 py-3">
        {/* 三列等宽布局：标题/说明只在左列（与真实页面一致），中/右列从顶部开始 */}
        <div className="overflow-x-auto">
          <div className="min-w-[1200px] grid grid-cols-3 gap-6 items-start">
            {/* LEFT */}
            <div>
              {/* Header + intro copy (left column only) */}
              <div className="max-w-[520px]">
                <div className="flex items-center gap-3">
                  <h1 className="text-[26px] font-bold text-[#0f1111]">{t('accountHealth')}</h1>
                  <a
                    href="#"
                    className="text-[13px] text-[#007185] hover:underline inline-flex items-center gap-1"
                  >
                    Leave Feedback <ExternalLink size={14} />
                  </a>
                </div>
                <div className="mt-1 text-[12px] text-[#0f1111] leading-4 space-y-1">
                  <div>To sell on Amazon, you must adhere to the below performance targets and policies.</div>
                  <div>
                    Help us reach you in the instance a critical event occurs that affects your ability to sell by
                    entering your emergency contact number{' '}
                    <a className="text-[#007185] hover:underline" href="#">
                      here
                    </a>
                    .
                  </div>
                  <div>Report abuse of Amazon policies.</div>
                </div>
              </div>

              <div className="mt-6">
                <Panel title={t('customerServicePerformance')}>
                  <div className="p-0 text-sm">
                    {/* Order Defect Rate section */}
                    <div className="px-4 py-3 border-b border-[#e7e7e7]">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <a href="#" className="text-[#007185] hover:underline font-semibold text-[13px]">
                            {t('orderDefectRate')}
                          </a>
                          <div className="text-xs text-[#565959] mt-1">{t('target')}: {t('underPercent', { percent: '1' })}</div>
                        </div>

                        <div className="flex gap-8 text-right flex-shrink-0">
                          <div className="min-w-[130px]">
                            <div className="text-xs text-[#565959] mb-1">{t('sellerFulfilled')}</div>
                            <div className="text-lg font-semibold text-[#0f1111]">{accountHealthData?.order_defect_rate?.seller_fulfilled || 3}%</div>
                            <div className="text-[11px] text-[#565959] mt-1">{t('ofOrders', { count: '317', total: '10570' })}</div>
                            <div className="text-[11px] text-[#565959]">60 {t('days')}</div>
                          </div>
                          <div className="min-w-[130px]">
                            <div className="text-xs text-[#565959] mb-1">{t('fulfilledByAmazon')}</div>
                            <div className="text-lg font-semibold text-[#0f1111]">{accountHealthData?.order_defect_rate?.fulfilled_by_amazon || 2}%</div>
                            <div className="text-[11px] text-[#565959] mt-1">{t('ofOrders', { count: '317', total: '15856' })}</div>
                            <div className="text-[11px] text-[#565959]">60 {t('days')}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics explanation */}
                    <div className="px-4 py-2 text-xs text-[#0f1111] border-b border-[#e7e7e7]">
                      {t('orderDefectRateDesc')}
                    </div>

                    {/* Metrics table */}
                    <div>
                      <div className="px-4 py-2 text-xs text-[#565959] flex justify-between border-b border-[#e7e7e7]">
                        <div className="flex-1"></div>
                        <div className="w-[110px] text-right">{t('sellerFulfilled')}</div>
                        <div className="w-[110px] text-right">{t('fulfilledByAmazon')}</div>
                      </div>

                      {[
                        { name: t('negativeFeedback'), value: accountHealthData?.policy_violations?.negative_feedback || 0 },
                        { name: t('aToZClaims'), value: accountHealthData?.policy_violations?.a_to_z_claims || 0 },
                        { name: t('chargebackClaims'), value: accountHealthData?.policy_violations?.chargeback_claims || 0 }
                      ].map((item) => (
                        <div key={item.name}>
                          <div className="px-4 py-3 flex justify-between items-center border-b border-[#e7e7e7]">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-[#565959]">•</span>
                              <a href="#" className="text-[#007185] hover:underline text-[13px]">
                                {item.name}
                              </a>
                            </div>
                            <div className="w-[110px] text-right text-[#0f1111] text-[13px]">{item.value}%</div>
                            <div className="w-[110px] text-right text-[#0f1111] text-[13px]">{item.value}%</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View details link */}
                    <div className="py-2 text-center">
                      <a href="#" className="text-[#007185] hover:underline text-[13px]">
                        {t('viewDetails')}
                      </a>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>

            {/* MIDDLE */}
            <div className="space-y-6">
              {/* Assurance banner */}
              <div className="bg-[#e8f3f7] border border-[#88c2d8] p-4 flex items-start gap-3 rounded-sm">
                <ShieldCheck size={20} className="text-[#007185] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#0f1111]">{t('accountHealthAssurance')}</div>
                  <div className="text-[13px] text-[#0f1111] mt-1 leading-tight">
                    {t('accountHealthAssuranceDesc')}
                  </div>
                  <a
                    href="#"
                    className="text-[13px] text-[#007185] hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    {t('seeWhatItTakes')}
                  </a>
                </div>
                <ChevronRight size={18} className="text-[#565959] mt-0.5" aria-hidden />
              </div>

              <Panel
                title={t('policyCompliance')}
                right={
                  <span className="bg-[#1d8102] text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    {t('healthy')}
                  </span>
                }
              >
                <div className="p-0">
                  {/* Account Health Rating section */}
                  <div className="px-4 py-3 border-b border-[#e7e7e7]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-[#0f1111]">{t('accountHealthRating')}</div>
                        <div className="text-[13px] text-[#565959] mt-1 leading-tight">
                          {t('accountHealthRatingDesc')}
                          <a href="#" className="text-[#007185] hover:underline ml-1">
                            {t('learnMore')}
                          </a>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 min-w-[180px]">
                        <div className="text-2xl font-semibold text-[#0f1111]">{accountHealthData?.account_health_rating || 982}</div>
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                            <div className="h-1.5 bg-[#1d8102]" style={{ width: `${((accountHealthData?.account_health_rating || 982) / 1000) * 100}%` }} />
                          </div>
                          <div className="flex justify-between text-[10px] text-[#565959] mt-1">
                            <span>0</span>
                            <span>100</span>
                            <span>200</span>
                            <span>1000</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* All Issues section */}
                  <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#e7e7e7]">
                    <div className="text-[13px] font-semibold text-[#0f1111]">{t('allIssues')}</div>
                    <button className="text-[#565959] hover:text-[#0f1111] p-1" aria-label="Collapse">
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  {/* Issues list */}
                  <div>
                    {[
                      { name: t('suspectedIPViolations'), value: accountHealthData?.policy_compliance?.intellectual_property_violations || 0 },
                      { name: t('receivedIPComplaints'), value: accountHealthData?.policy_compliance?.intellectual_property_violations || 0 },
                      { name: t('productAuthComplaints'), value: accountHealthData?.policy_compliance?.product_policy_violations || 0 },
                      { name: t('productConditionComplaints'), value: accountHealthData?.policy_compliance?.product_policy_violations || 0 },
                      { name: t('foodSafetyIssues'), value: 0 },
                      { name: t('listingPolicyViolations'), value: accountHealthData?.policy_compliance?.listing_policy_violations || 0 },
                      { name: t('restrictedProductViolations'), value: accountHealthData?.policy_compliance?.product_policy_violations || 0 },
                      { name: t('reviewPolicyViolations'), value: accountHealthData?.policy_compliance?.customer_product_reviews || 0 },
                      { name: t('otherPolicyViolations'), value: accountHealthData?.policy_compliance?.other_policy_violations || 0 },
                      { name: t('regulatoryCompliance'), value: 0 },
                    ].map((item, idx, arr) => (
                      <div
                        key={item.name}
                        className={[
                          'flex items-center justify-between px-4 py-2 text-[13px]',
                          idx !== arr.length - 1 ? 'border-b border-[#e7e7e7]' : '',
                        ].join(' ')}
                      >
                        <a href="#" className="text-[#007185] hover:underline flex-1">
                          {item.name}
                        </a>
                        <span className="text-[#0f1111] ml-2">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* View all link */}
                  <div className="py-2 text-center border-t border-[#e7e7e7]">
                    <a href="#" className="text-[#007185] hover:underline text-[13px]">
                      {t('viewAll')}(0)
                    </a>
                  </div>
                </div>
              </Panel>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Need Help Card */}
              <Panel title={t('needHelp')}>
                <div className="p-4 text-[13px] bg-[#f2f3f3]">
                  <div className="text-[#0f1111]">
                    <div>{t('speakToSpecialist')}</div>
                    <div className="mt-1">
                      {t('contactUsForHelp')}{' '}
                      <a className="text-[#007185] hover:underline" href="#">
                        {t('here')}
                      </a>
                    </div>
                  </div>
                  <button className="mt-3 bg-[#f0b429] hover:bg-[#e3a61c] text-[#0f1111] px-2.5 py-1.5 rounded-sm text-[13px] font-semibold inline-flex items-center gap-2 transition-colors">
                    <Phone size={14} />
                    {t('contactUs')}
                  </button>
                </div>
              </Panel>

              {/* Shipping Performance */}
              <Panel
                title={t('shippingPerformance')}
                right={
                  <button className="text-[13px] text-[#565959] hover:text-[#0f1111] inline-flex items-center gap-1 px-2 py-1">
                    {t('sellerFulfilled')} <ChevronDown size={14} />
                  </button>
                }
              >
                <div className="p-0">
                  {[
                    {
                      name: t('lateShipmentRate'),
                      target: `${t('target')}: ${t('underPercent', { percent: '4' })}`,
                      value: `${accountHealthData?.shipping_performance?.late_shipment_rate || 0}%`,
                      meta1: t('ofOrders', { count: '0', total: '5329' }),
                      meta2: `30 ${t('days')}`,
                    },
                    {
                      name: t('preFulfillmentCancelRate'),
                      target: `${t('target')}: ${t('underPercent', { percent: '2.5' })}`,
                      value: `${accountHealthData?.shipping_performance?.pre_fulfillment_cancel_rate || 0}%`,
                      meta1: t('ofOrders', { count: '0', total: '3265' }),
                      meta2: `7 ${t('days')}`,
                    },
                    {
                      name: t('validTrackingRate'),
                      target: `${t('target')}: ${t('overPercent', { percent: '95' })}`,
                      value: `${accountHealthData?.shipping_performance?.valid_tracking_rate || 99}%`,
                      meta1: t('ofOrders', { count: '7914', total: '7994' }),
                      meta2: `30 ${t('days')}`,
                    },
                    {
                      name: t('onTimeDeliveryRate'),
                      target: `${t('target')}: ${t('overPercent', { percent: '90' })}`,
                      value: accountHealthData?.shipping_performance?.on_time_delivery_rate ? `${accountHealthData.shipping_performance.on_time_delivery_rate}%` : 'N/A',
                      meta1: '',
                      meta2: '',
                    },
                  ].map((row) => (
                    <div key={row.name}>
                      <div className="px-4 py-2.5 flex items-start justify-between gap-3 border-b border-[#e7e7e7]">
                        <div className="flex-1">
                          <a href="#" className="text-[13px] text-[#007185] hover:underline font-semibold">
                            {row.name}
                          </a>
                          <div className="text-xs text-[#565959] mt-0.5">{row.target}</div>
                        </div>
                        <div className="text-right flex-shrink-0 min-w-[110px]">
                          <div className="text-lg font-semibold text-[#0f1111]">{row.value}</div>
                          {row.meta1 ? (
                            <>
                              <div className="text-[11px] text-[#565959] mt-0.5 leading-tight">{row.meta1}</div>
                              <div className="text-[11px] text-[#565959] leading-tight">{row.meta2}</div>
                            </>
                          ) : (
                            <div className="text-[11px] text-[#565959] mt-0.5">&nbsp;</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Bottom links */}
                  <div className="px-4 py-2.5 flex items-center justify-between text-[13px]">
                    <a href="#" className="text-[#007185] hover:underline">
                      {t('viewDetails')}
                    </a>
                    <a href="#" className="text-[#007185] hover:underline">
                      {t('viewShippingEligibilities')}
                    </a>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          {/* bottom panels */}
          <div className="min-w-[1200px] grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Panel title={t('paymentPolicy')}>
              <div className="p-4 text-[13px]">
                <div className="border border-[#e7e7e7] bg-[#fff9e6] p-3 rounded-sm">
                  <span className="font-semibold text-[#0f1111]">{t('feedback')}</span>
                  <span className="text-[#0f1111] ml-2">{t('accountInGoodStanding')}</span>
                </div>
              </div>
            </Panel>

            <Panel title={t('accountHealthNews')}>
              <div className="p-4 text-[13px] text-[#0f1111]">
                <div className="border border-[#e7e7e7] p-3 rounded-sm">{t('noRecentUpdates')}</div>
              </div>
            </Panel>

            <Panel title={t('manageCompliance')}>
              <div className="p-4 text-[13px] space-y-2">
                <a href="#" className="text-[#007185] hover:underline block">
                  {t('productComplianceRequests')}
                </a>
                <a href="#" className="text-[#007185] hover:underline block">
                  {t('complianceReferences')}
                </a>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHealth;
