
import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Card, Button } from '../components/UI';
import { CheckCircle2, Phone, MapPin, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const Verification: React.FC = () => {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: t('verificationFaq1'), a: t('verificationFaq1Ans') },
    { q: t('verificationFaq2'), a: t('verificationFaq2Ans') },
    { q: t('verificationFaq3'), a: t('verificationFaq3Ans') },
    { q: t('verificationFaq4'), a: t('verificationFaq4Ans') },
    { q: t('verificationFaq5'), a: t('verificationFaq5Ans') }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-8 px-1">
        <h1 className="text-2xl font-black text-amazon-text uppercase tracking-tight tracking-tighter">{t('verification')}</h1>
        <div className="flex items-center gap-1.5 text-xs-amz text-amazon-link font-black hover:underline cursor-pointer">
          <HelpCircle size={16} /> Help
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Phone Verification Section */}
          <section>
            <Card className="shadow-sm border-amazon-border">
              <div className="flex items-center gap-3 mb-6 bg-green-50 border border-green-100 p-3 rounded-sm">
                <CheckCircle2 size={20} className="text-amazon-success shrink-0" />
                <span className="text-sm font-bold text-green-800">{t('phoneVerified')}</span>
              </div>
              
              <div className="px-1">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Phone size={14} /> {t('phoneVerification')}
                </h3>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gray-50/50 border border-gray-100 rounded-sm">
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('currentBusinessPhone')}</div>
                    <div className="text-base font-black text-amazon-text">+86 182 **** 4117</div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="white" className="w-auto px-6 h-9 text-xs font-black uppercase tracking-tight shadow-sm">{t('addPhone')}</Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Address Verification Section */}
          <section>
            <Card className="shadow-sm border-amazon-border">
              <div className="flex items-center gap-3 mb-6 bg-green-50 border border-green-100 p-3 rounded-sm">
                <CheckCircle2 size={20} className="text-amazon-success shrink-0" />
                <span className="text-sm font-bold text-green-800">{t('addressVerified')}</span>
              </div>

              <div className="px-1">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin size={14} /> {t('addressVerification')}
                </h3>

                <div className="p-5 border border-amazon-teal bg-amazon-teal/5 rounded-sm relative overflow-hidden group">
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <div className="text-[10px] font-black text-amazon-teal uppercase tracking-widest mb-2">{t('currentBusinessAddress')}</div>
                      <div className="text-[14px] font-black text-amazon-text leading-tight">
                        {t('currentBusinessAddressSample')}<br />
                        {t('addressLine2Sample')}<br />
                        {t('addressLine3Sample')}<br />
                        {t('countrySample')}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                         <div className="px-2 py-0.5 bg-amazon-success text-white text-[9px] font-black uppercase rounded-sm">Verified</div>
                      </div>
                    </div>
                    <CheckCircle2 size={40} className="text-amazon-teal/20" />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-4">
                  <Button variant="white" className="w-auto px-8 h-9 text-xs font-black uppercase tracking-tight shadow-sm">{t('selectAddress')}</Button>
                  <Button variant="white" className="w-auto px-8 h-9 text-xs font-black uppercase tracking-tight shadow-sm">{t('addNewAddress')}</Button>
                </div>
              </div>
            </Card>
          </section>

        </div>

        {/* Sidebar Column: FAQ */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-28">
            <Card title={t('faqTitle')} className="shadow-md border-amazon-border overflow-hidden">
              <div className="divide-y divide-gray-100 -mx-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="group">
                    <button 
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className={cn(
                        "text-[13px] font-bold leading-tight transition-colors",
                        openFaq === idx ? "text-amazon-teal" : "text-gray-700 group-hover:text-amazon-link"
                      )}>
                        {faq.q}
                      </span>
                      {openFaq === idx ? <ChevronUp size={16} className="text-amazon-teal" /> : <ChevronDown size={16} className="text-gray-300" />}
                    </button>
                    {openFaq === idx && (
                      <div className="px-6 pb-5 text-[12px] text-amazon-secondaryText leading-relaxed animate-in slide-in-from-top-1 duration-200 font-medium">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-sm text-center">
              <p className="text-[11px] text-gray-500 font-bold mb-3 uppercase tracking-widest">Still have questions?</p>
              <button className="text-xs-amz font-black text-amazon-link hover:underline uppercase tracking-tight">Contact Seller Support ›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
