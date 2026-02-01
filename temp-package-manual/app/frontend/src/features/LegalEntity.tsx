
import React, { useEffect, useState } from 'react';
import { Card, Button } from '../components/UI';
import { CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useStore } from '../store';
import { API_CONFIG, apiGet } from '../config/api';

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
  created_at: string;
  updated_at: string;
}

const LegalEntity: React.FC = () => {
  const { t } = useI18n();
  const { currentStore } = useStore();
  const [legalEntityData, setLegalEntityData] = useState<LegalEntityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 获取法律实体信息
  const fetchLegalEntityInfo = async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(API_CONFIG.ENDPOINTS.LEGAL_ENTITY.BY_STORE(storeId));
      if (response.success) {
        setLegalEntityData(response.data);
      } else {
        setError(t('failedToLoadLegalEntity') || 'Failed to load legal entity information');
      }
    } catch (err) {
      console.error('Error fetching legal entity info:', err);
      setError(t('failedToLoadLegalEntity') || 'Failed to load legal entity information');
    } finally {
      setLoading(false);
    }
  };

  // 刷新法律实体数据
  const handleRefresh = async () => {
    if (!currentStore?.id) return;
    
    setRefreshing(true);
    try {
      await fetchLegalEntityInfo(currentStore.id);
    } catch (err) {
      console.error('Error refreshing legal entity data:', err);
      setError(t('failedToRefreshData') || 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // 当当前店铺变化时，获取法律实体信息
  useEffect(() => {
    if (currentStore?.id) {
      fetchLegalEntityInfo(currentStore.id);
    }
  }, [currentStore?.id]);

  if (loading) {
    return (
      <div className="max-w-3xl animate-in fade-in duration-300 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[13px] text-[#565959] mb-2">{t('accountInfo')}</div>
            <h1 className="text-[22px] font-bold text-[#0F1111]">{t('legalEntity')}</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-[13px] text-[#565959]">{t('loading') || 'Loading'}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl animate-in fade-in duration-300 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[13px] text-[#565959] mb-2">{t('accountInfo')}</div>
            <h1 className="text-[22px] font-bold text-[#0F1111]">{t('legalEntity')}</h1>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={handleRefresh}
            className="text-[13px] text-amazon-link font-bold hover:underline"
          >
            {t('tryAgain') || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  if (!legalEntityData) {
    return (
      <div className="max-w-3xl animate-in fade-in duration-300 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[13px] text-[#565959] mb-2">{t('accountInfo')}</div>
            <h1 className="text-[22px] font-bold text-[#0F1111]">{t('legalEntity')}</h1>
          </div>
        </div>
        <div className="text-center py-12 text-[#565959]">
          {t('noStoreSelected') || 'No store selected. Please select a store from the header.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-in fade-in duration-300 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[13px] text-[#565959] mb-2">{t('accountInfo')}</div>
          <h1 className="text-[22px] font-bold text-[#0F1111]">{t('legalEntity')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-[13px] text-amazon-link font-bold hover:underline disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? (t('refreshing') || 'Refreshing...') : (t('refreshData') || 'Refresh Data')}
          </button>
          <Button variant="yellow" className="w-auto px-6">
            {t('edit') || 'Edit'}
          </Button>
        </div>
      </div>

      {/* Tax Status Callout Card */}
      <div className="bg-white border-2 border-[#007600] rounded-[8px] p-6 flex gap-6 overflow-hidden relative">
        {/* Green Vertical Accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#007600]"></div>
        
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <div className="w-10 h-10 bg-[#F7FFF7] rounded-full flex items-center justify-center border border-[#007600]/20">
              <CheckCircle2 className="text-[#007600]" size={20} />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[16px] font-bold text-[#007600] mb-1">
                  {legalEntityData.taxInformation.status === 'Complete' 
                    ? (t('taxInformationComplete') || 'Tax information is complete')
                    : (t('taxInformationPending') || 'Tax information is pending')
                  }
                </h2>
                <p className="text-[13px] text-[#565959] mb-4">
                  {legalEntityData.taxInformation.status === 'Complete'
                    ? (t('taxInformationValidated') || 'Your tax information has been validated successfully.')
                    : (t('taxInformationNeedsUpdate') || 'Your tax information needs to be updated.')
                  }
                </p>
              </div>
              <a href="#" className="text-[13px] font-medium text-[#007185] hover:text-[#C45500]">
                {t('taxInterviewHelpGuide') || 'Tax interview help guide'}
              </a>
            </div>
            
            <Button variant="yellow" className="w-auto px-8">
              {t('updateTaxInformation') || 'Update Tax Information'}
            </Button>
          </div>
        </div>
      </div>

      {/* Instruction Paragraph */}
      <div className="bg-white p-6 rounded-[8px] border border-[#D5D9D9]">
        <p className="text-[13px] text-[#0F1111] leading-relaxed">
          {t('legalEntityUpdateInstructions') || 
            'To update your legal entity name or address, please retake the tax interview by clicking the "Update Tax Information" button above. This will ensure your information is properly verified and compliant with Amazon\'s requirements.'
          }
        </p>
      </div>

      {/* Read-only Info Blocks */}
      <div className="space-y-4">
        {/* Legal Business Name Block */}
        <div className="bg-[#F7FAFA] p-6 rounded-[8px] border border-[#D5D9D9]">
          <div className="text-[13px] font-medium text-[#565959] mb-2">
            {t('legalBusinessName') || 'Legal business name'}
          </div>
          <div className="text-[16px] font-bold text-[#0F1111]">
            {legalEntityData.legalBusinessName}
          </div>
        </div>

        {/* Place of Establishment Address Block */}
        <div className="bg-[#F7FAFA] p-6 rounded-[8px] border border-[#D5D9D9]">
          <div className="text-[13px] font-medium text-[#565959] mb-2">
            {t('placeOfEstablishmentAddress') || 'Place of establishment address'}
          </div>
          <div className="text-[16px] font-bold text-[#0F1111] leading-relaxed">
            {legalEntityData.businessAddress.street}
            {legalEntityData.businessAddress.suite && <><br />{legalEntityData.businessAddress.suite}</>}
            <br />
            {legalEntityData.businessAddress.city}, {legalEntityData.businessAddress.state} {legalEntityData.businessAddress.zipCode}
            <br />
            {legalEntityData.businessAddress.country}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F7FAFA] p-6 rounded-[8px] border border-[#D5D9D9]">
            <div className="text-[13px] font-medium text-[#565959] mb-2">
              {t('businessType') || 'Business Type'}
            </div>
            <div className="text-[16px] font-bold text-[#0F1111]">
              {legalEntityData.businessType}
            </div>
          </div>

          <div className="bg-[#F7FAFA] p-6 rounded-[8px] border border-[#D5D9D9]">
            <div className="text-[13px] font-medium text-[#565959] mb-2">
              {t('taxId') || 'Tax ID'}
            </div>
            <div className="text-[16px] font-bold text-[#0F1111]">
              {legalEntityData.taxInformation.taxId}
            </div>
          </div>

          <div className="bg-[#F7FAFA] p-6 rounded-[8px] border border-[#D5D9D9]">
            <div className="text-[13px] font-medium text-[#565959] mb-2">
              {t('taxClassification') || 'Tax Classification'}
            </div>
            <div className="text-[16px] font-bold text-[#0F1111]">
              {legalEntityData.taxInformation.taxClassification}
            </div>
          </div>

          <div className="bg-[#F7FAFA] p-6 rounded-[8px] border border-[#D5D9D9]">
            <div className="text-[13px] font-medium text-[#565959] mb-2">
              {t('registrationDate') || 'Registration Date'}
            </div>
            <div className="text-[16px] font-bold text-[#0F1111]">
              {new Date(legalEntityData.registrationDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 pb-8">
        <Button 
          variant="white" 
          className="w-auto px-6 flex items-center gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} />
          {t('back') || 'Back'}
        </Button>
      </div>
    </div>
  );
};

export default LegalEntity;
