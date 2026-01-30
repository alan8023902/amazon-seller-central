import React, { useState } from 'react';
import { Phone, ShieldCheck, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

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

const AccountHealth: React.FC = () => {
  const { t } = useI18n();
  const [loading] = useState(false);

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
                            Order Defect Rate
                          </a>
                          <div className="text-xs text-[#565959] mt-1">Target: under 1%</div>
                        </div>

                        <div className="flex gap-8 text-right flex-shrink-0">
                          <div className="min-w-[130px]">
                            <div className="text-xs text-[#565959] mb-1">Seller Fulfilled</div>
                            <div className="text-lg font-semibold text-[#0f1111]">3%</div>
                            <div className="text-[11px] text-[#565959] mt-1">317 of 10570 orders</div>
                            <div className="text-[11px] text-[#565959]">60 days</div>
                          </div>
                          <div className="min-w-[130px]">
                            <div className="text-xs text-[#565959] mb-1">Fulfilled by Amazon</div>
                            <div className="text-lg font-semibold text-[#0f1111]">2%</div>
                            <div className="text-[11px] text-[#565959] mt-1">317 of 15856 orders</div>
                            <div className="text-[11px] text-[#565959]">60 days</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics explanation */}
                    <div className="px-4 py-2 text-xs text-[#0f1111] border-b border-[#e7e7e7]">
                      Order Defect Rate consists of three different metrics:
                    </div>

                    {/* Metrics table */}
                    <div>
                      <div className="px-4 py-2 text-xs text-[#565959] flex justify-between border-b border-[#e7e7e7]">
                        <div className="flex-1"></div>
                        <div className="w-[110px] text-right">Seller Fulfilled</div>
                        <div className="w-[110px] text-right">Fulfilled by Amazon</div>
                      </div>

                      {['Negative feedback', 'A-to-z Guarantee claims', 'Chargeback claims'].map((name) => (
                        <div key={name}>
                          <div className="px-4 py-3 flex justify-between items-center border-b border-[#e7e7e7]">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-[#565959]">•</span>
                              <a href="#" className="text-[#007185] hover:underline text-[13px]">
                                {name}
                              </a>
                            </div>
                            <div className="w-[110px] text-right text-[#0f1111] text-[13px]">0%</div>
                            <div className="w-[110px] text-right text-[#0f1111] text-[13px]">0%</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* View details link */}
                    <div className="py-2 text-center">
                      <a href="#" className="text-[#007185] hover:underline text-[13px]">
                        View details
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
                  <div className="text-[13px] font-semibold text-[#0f1111]">Account Health Assurance</div>
                  <div className="text-[13px] text-[#0f1111] mt-1 leading-tight">
                    A new benefit to all ANC partners who consistently achieve a high Account Health Rating.
                  </div>
                  <a
                    href="#"
                    className="text-[13px] text-[#007185] hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    See what it takes to qualify
                  </a>
                </div>
                <ChevronRight size={18} className="text-[#565959] mt-0.5" aria-hidden />
              </div>

              <Panel
                title="Policy Compliance"
                right={
                  <span className="bg-[#1d8102] text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    Healthy
                  </span>
                }
              >
                <div className="p-0">
                  {/* Account Health Rating section */}
                  <div className="px-4 py-3 border-b border-[#e7e7e7]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-[#0f1111]">Account Health Rating</div>
                        <div className="text-[13px] text-[#565959] mt-1 leading-tight">
                          This rating reflects your adherence to Amazon&apos;s selling policies.
                          <a href="#" className="text-[#007185] hover:underline ml-1">
                            Learn more.
                          </a>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 min-w-[180px]">
                        <div className="text-2xl font-semibold text-[#0f1111]">982</div>
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-sm overflow-hidden">
                            <div className="h-1.5 bg-[#1d8102]" style={{ width: '82%' }} />
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
                    <div className="text-[13px] font-semibold text-[#0f1111]">All Issues</div>
                    <button className="text-[#565959] hover:text-[#0f1111] p-1" aria-label="Collapse">
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  {/* Issues list */}
                  <div>
                    {[
                      'Suspected Intellectual Property Violations',
                      'Received Intellectual Property Complaints',
                      'Product Authenticity Customer Complaints',
                      'Product Condition Customer Complaints',
                      'Food and Product Safety Issues',
                      'Listing Policy Violations',
                      'Restricted Product Policy Violations',
                      'Customer Product Reviews Policy Violations',
                      'Other Policy Violations',
                      'Regulatory Compliance',
                    ].map((item, idx, arr) => (
                      <div
                        key={item}
                        className={[
                          'flex items-center justify-between px-4 py-2 text-[13px]',
                          idx !== arr.length - 1 ? 'border-b border-[#e7e7e7]' : '',
                        ].join(' ')}
                      >
                        <a href="#" className="text-[#007185] hover:underline flex-1">
                          {item}
                        </a>
                        <span className="text-[#0f1111] ml-2">0</span>
                      </div>
                    ))}
                  </div>

                  {/* View all link */}
                  <div className="py-2 text-center border-t border-[#e7e7e7]">
                    <a href="#" className="text-[#007185] hover:underline text-[13px]">
                      View all(0)
                    </a>
                  </div>
                </div>
              </Panel>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Need Help Card */}
              <Panel title="Need help?">
                <div className="p-4 text-[13px] bg-[#f2f3f3]">
                  <div className="text-[#0f1111]">
                    <div>Speak to an Account Health Specialist.</div>
                    <div className="mt-1">
                      To learn more about the Account Health Support Team, click{' '}
                      <a className="text-[#007185] hover:underline" href="#">
                        here
                      </a>
                    </div>
                  </div>
                  <button className="mt-3 bg-[#f0b429] hover:bg-[#e3a61c] text-[#0f1111] px-2.5 py-1.5 rounded-sm text-[13px] font-semibold inline-flex items-center gap-2 transition-colors">
                    <Phone size={14} />
                    Contact Us
                  </button>
                </div>
              </Panel>

              {/* Shipping Performance */}
              <Panel
                title="Shipping Performance"
                right={
                  <button className="text-[13px] text-[#565959] hover:text-[#0f1111] inline-flex items-center gap-1 px-2 py-1">
                    Seller Fulfilled <ChevronDown size={14} />
                  </button>
                }
              >
                <div className="p-0">
                  {[
                    {
                      name: 'Late Shipment Rate',
                      target: 'Target: under 4%',
                      value: '0%',
                      meta1: '0 of 5329 orders',
                      meta2: '30 days',
                    },
                    {
                      name: 'Pre-fulfillment Cancel Rate',
                      target: 'Target: under 2.5%',
                      value: '0%',
                      meta1: '0 of 3265 orders',
                      meta2: '7 days',
                    },
                    {
                      name: 'Valid Tracking Rate',
                      target: 'Target: over 95%',
                      value: '99%',
                      meta1: '7914 of 7994 orders',
                      meta2: '30 days',
                    },
                    {
                      name: 'On-Time Delivery Rate',
                      target: 'Target: over 90%',
                      value: 'N/A',
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
                      View details
                    </a>
                    <a href="#" className="text-[#007185] hover:underline">
                      View shipping eligibilities here
                    </a>
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          {/* bottom panels */}
          <div className="min-w-[1200px] grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Panel title="Payment Policy">
              <div className="p-4 text-[13px]">
                <div className="border border-[#e7e7e7] bg-[#fff9e6] p-3 rounded-sm">
                  <span className="font-semibold text-[#0f1111]">FEEDBACK</span>
                  <span className="text-[#0f1111] ml-2">Your account is in good standing. (Placeholder)</span>
                </div>
              </div>
            </Panel>

            <Panel title="Account Health News">
              <div className="p-4 text-[13px] text-[#0f1111]">
                <div className="border border-[#e7e7e7] p-3 rounded-sm">No recent updates. (Placeholder)</div>
              </div>
            </Panel>

            <Panel title="Manage your compliance">
              <div className="p-4 text-[13px] space-y-2">
                <a href="#" className="text-[#007185] hover:underline block">
                  Product Compliance Requests
                </a>
                <a href="#" className="text-[#007185] hover:underline block">
                  Compliance References
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
