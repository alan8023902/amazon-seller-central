import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { useI18n } from '../hooks/useI18n';
import { API_CONFIG, apiGet } from '../config/api';
import { Check } from 'lucide-react';

interface TaxInfo {
  id?: string;
  store_id: string;
  vat_registration_number?: string;
  rfc_id?: string;
  tax_interview_completed: boolean;
  tax_information_complete: boolean;
  legal_business_name?: string;
  place_of_establishment?: string;
  updated_at?: string;
}

const TaxInfo: React.FC = () => {
  const navigate = useNavigate();
  const { currentStore } = useStore();
  const { t } = useI18n();
  const [taxInfo, setTaxInfo] = useState<TaxInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentStore?.id) void loadTaxInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id]);

  const loadTaxInfo = async () => {
    if (!currentStore?.id) return;

    try {
      setLoading(true);
      const response = await apiGet(API_CONFIG.ENDPOINTS.TAX_INFO.BY_STORE(currentStore.id));

      if (response?.success && response?.data) {
        setTaxInfo(response.data);
      } else {
        setTaxInfo({
          store_id: currentStore.id,
          tax_interview_completed: false,
          tax_information_complete: true,
        });
      }
    } catch (error) {
      console.error('Failed to load tax info:', error);
      setTaxInfo({
        store_id: currentStore.id,
        tax_interview_completed: false,
        tax_information_complete: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* 外层留白：避免贴屏幕左边 */}
      <div className="px-6">
        {/* 内容宽度：真实页更宽一点，且不居中（贴左但有 padding） */}
        <div className="max-w-[760px]">
          {/* 顶部标题行：右侧 Account Info 是链接 */}
          <div className="pt-3 flex items-start justify-between">
            <h1 className="text-[22px] font-bold text-[#0f1111]">{t('legalEntity')}</h1>

            <a
              href="#"
              className="text-[12px] text-[#007185] hover:underline mt-1"
              onClick={(e) => {
                e.preventDefault();
                navigate('/app/settings/store-info');
              }}
            >
              {t('accountInfo')}
            </a>
          </div>

          {/* 分割线 */}
          <div className="mt-2 border-t border-[#e7e7e7]" />

          {/* 成功提示框：加大上下 padding / 内部间距 */}
          <div className="mt-5 relative bg-white border border-[#2E7D5B] rounded-sm">
            <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-[#2E7D5B] rounded-l-sm" />

            <div className="pl-6 pr-4 py-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 bg-[#2E7D5B] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>

                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-[#2E7D5B] leading-5">
                    {t('taxInformationComplete')}
                  </div>
                  <div className="text-[12px] text-[#0f1111] mt-1">
                    {t('taxInformationValidated')}
                  </div>

                  {/* 第二行：左按钮右链接 */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      className="text-[12px] px-3 py-1.5 bg-white border border-[#d5d9d9] rounded-sm text-[#0f1111] hover:bg-[#f7fafa]"
                      onClick={() => navigate('/app/settings/tax-info/update')}
                    >
                      {t('updateTaxInformation')}
                    </button>

                    <a
                      href="#"
                      className="text-[12px] text-[#007185] hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {t('taxInterviewHelpGuide')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 说明文字：与上面拉开一点距离 */}
          <div className="mt-4 text-[12px] text-[#0f1111]">
            {t('taxInfoUpdateInstructions')}
          </div>

          {/* 灰底信息卡：加大间距，让布局不紧促 */}
          <div className="mt-6 space-y-5">
            <div className="bg-[#f2f3f3] border border-[#e7e7e7] rounded-md px-5 py-4">
              <div className="text-[12px] font-bold text-[#0f1111]">{t('legalBusinessName')}</div>
              <div className="text-[12px] text-[#0f1111] mt-2 break-words">
                {taxInfo?.legal_business_name || 'TechNest LLC'}
              </div>
            </div>

            <div className="bg-[#f2f3f3] border border-[#e7e7e7] rounded-md px-5 py-4">
              <div className="text-[12px] font-bold text-[#0f1111]">{t('placeOfEstablishmentAddress')}</div>
              <div className="text-[12px] text-[#0f1111] mt-2 break-words">
                {taxInfo?.place_of_establishment ||
                  '1234 Business Ave, Suite 100, New York, NY 10001, United States'}
              </div>
            </div>
          </div>

          {/* Back：不要全宽，宽度更像真实页面 */}
          <div className="mt-5 pb-10">
            <button
              type="button"
              onClick={() => navigate('/app/settings/tax-info')}
              className="w-[320px] bg-white border border-[#d5d9d9] rounded-md py-2 text-[12px] text-[#0f1111] hover:bg-[#f7fafa]"
            >
              {t('back')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxInfo;
