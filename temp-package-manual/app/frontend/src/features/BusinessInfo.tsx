
import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { Card } from '../components/UI';
import { ChevronRight, ExternalLink, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessInfo: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const links = [
    { label: t('businessAddress'), desc: t('businessAddressDesc'), path: 'address' },
    { label: t('merchantToken'), desc: t('merchantTokenDesc'), path: 'token' },
    { label: t('businessInsurance'), desc: t('businessInsuranceDesc'), path: 'insurance' },
    { label: t('manageBrands'), desc: t('manageBrandsDesc'), path: 'brands' },
    { label: t('languageForFeed'), desc: t('languageForFeedDesc'), path: 'language' },
    { label: t('legalEntity'), desc: t('legalEntityUpdateInstructions'), path: 'legal' },
    { label: t('displayName'), desc: t('displayNameDesc'), path: 'display-name' },
  ];

  return (
    <div className="max-w-3xl pb-12 animate-in fade-in slide-in-from-right-2 duration-300">
      <div className="mb-4 flex items-center justify-between">
         <h1 className="text-2xl font-black text-amazon-text tracking-tight uppercase">{t('businessInfo')}</h1>
         <div className="flex items-center gap-1.5 text-xs-amz text-amazon-link font-bold cursor-pointer hover:underline">
            <ExternalLink size={14} /> {t('viewSellerProfile')}
         </div>
      </div>

      <Card className="shadow-md border-amazon-border">
        <div className="divide-y divide-gray-100">
          {links.map((link) => (
            <div 
              key={link.label} 
              onClick={() => navigate(link.path)}
              className="py-5 flex items-center justify-between group cursor-pointer hover:bg-blue-50/30 -mx-4 px-4 transition-all"
            >
              <div className="flex-1">
                <div className="text-sm-amz font-black text-amazon-link group-hover:underline">
                  {link.label}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">
                  {link.desc}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-amazon-teal group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </Card>
      
      <div className="mt-8 flex gap-4">
        <div className="flex-1 p-5 bg-white border border-amazon-border rounded-sm shadow-sm">
           <div className="flex items-center gap-2 mb-3 text-amazon-orange">
              <Info size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{t('verificationStatus')}</span>
           </div>
           <p className="text-[11px] text-gray-600 leading-relaxed font-bold">
              {t('verificationStatusDesc')}
           </p>
        </div>
        <div className="flex-1 p-5 bg-amazon-teal/5 border border-amazon-teal/20 rounded-sm shadow-sm group cursor-pointer hover:bg-amazon-teal/10 transition-colors">
           <h4 className="text-xs font-black text-amazon-teal uppercase tracking-widest mb-1.5">{t('marketplaceEnrollment')}</h4>
           <p className="text-[11px] text-amazon-teal/70 leading-relaxed font-medium">
              {t('marketplaceEnrollmentDesc')}
           </p>
           <button className="mt-4 text-[10px] font-black text-amazon-teal uppercase tracking-tighter flex items-center gap-1">{t('expandGlobalSelling')} <ChevronRight size={12}/></button>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;
