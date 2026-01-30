import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI';
import { Info, Globe, CheckCircle2, RefreshCw } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useStore } from '../store';
import { API_CONFIG, apiGet } from '../config/api';

interface StoreInfoData {
  id: string;
  name: string;
  marketplace: string;
  country: string;
  currency_symbol: string;
  is_active: boolean;
  business_type: string;
  contact_email?: string;
  contact_phone?: string;
  tax_id?: string;
  vat_number?: string;
  created_at: string;
  updated_at: string;
}

const StoreInfo: React.FC = () => {
  const { t } = useI18n();
  const { currentStore, refreshStoreData } = useStore();
  const [storeData, setStoreData] = useState<StoreInfoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 获取店铺详细信息
  const fetchStoreInfo = async (storeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet(API_CONFIG.ENDPOINTS.STORES.DETAIL(storeId));
      if (response.success) {
        setStoreData(response.data);
      } else {
        setError(t('failedToLoadStoreInfo') || 'Failed to load store information');
      }
    } catch (err) {
      console.error('Error fetching store info:', err);
      setError(t('failedToLoadStoreInfo') || 'Failed to load store information');
    } finally {
      setLoading(false);
    }
  };

  // 刷新店铺数据
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // 刷新全局店铺列表
      await refreshStoreData();
      
      // 如果有当前店铺，重新获取其详细信息
      if (currentStore?.id) {
        await fetchStoreInfo(currentStore.id);
      }
    } catch (err) {
      console.error('Error refreshing store data:', err);
      setError(t('failedToRefreshStoreData') || 'Failed to refresh store data');
    } finally {
      setRefreshing(false);
    }
  };

  // 当当前店铺变化时，获取店铺信息
  useEffect(() => {
    if (currentStore?.id) {
      fetchStoreInfo(currentStore.id);
    }
  }, [currentStore?.id]);

  // 生成店铺URL
  const generateStoreUrl = (storeName: string) => {
    return storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  if (loading) {
    return (
      <div className="max-w-4xl animate-in fade-in duration-300">
        <h1 className="text-[22px] font-bold text-[#0F1111] mb-6 uppercase tracking-tight">{t('storeInfo')}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-[13px] text-[#565959]">{t('loadingStoreInfo') || 'Loading store information...'}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl animate-in fade-in duration-300">
        <h1 className="text-[22px] font-bold text-[#0F1111] mb-6 uppercase tracking-tight">{t('storeInfo')}</h1>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={handleRefresh}
            className="text-[13px] text-amazon-link font-bold hover:underline"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="max-w-4xl animate-in fade-in duration-300">
        <h1 className="text-[22px] font-bold text-[#0F1111] mb-6 uppercase tracking-tight">{t('storeInfo')}</h1>
        <div className="text-center py-12 text-[#565959]">
          {t('noStoreSelected')}
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold text-[#0F1111] uppercase tracking-tight">{t('storeInfo')}</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-[13px] text-amazon-link font-bold hover:underline disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? t('refreshing') : t('refreshData')}
        </button>
      </div>

      <div className="space-y-6">
        {/* Store Information Card */}
        <Card title={t('storeInformation')} headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">{t('editStoreInfo')}</button>}>
          <div className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-bold text-[14px] mb-2">{t('storeName')}</div>
                <div className="text-[13px] text-[#565959]">{storeData.name}</div>
              </div>
              <div>
                <div className="font-bold text-[14px] mb-2">{t('sellerId')}</div>
                <div className="text-[13px] text-[#565959]">{storeData.id}</div>
              </div>
              <div>
                <div className="font-bold text-[14px] mb-2">{t('marketplace')}</div>
                <div className="flex items-center gap-2 text-[13px] text-[#565959]">
                  <Globe size={16} />
                  <span>{storeData.marketplace} (Amazon.{storeData.country === 'United States' ? 'com' : storeData.country.toLowerCase()})</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-[14px] mb-2">{t('storeStatus')}</div>
                <div className="flex items-center gap-2 text-[13px]">
                  <CheckCircle2 size={16} className={storeData.is_active ? 'text-[#007600]' : 'text-[#B12704]'} />
                  <span className={storeData.is_active ? 'text-[#007600]' : 'text-[#B12704]'}>
                    {storeData.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
              </div>
              {storeData.business_type && (
                <div>
                  <div className="font-bold text-[14px] mb-2">{t('businessType')}</div>
                  <div className="text-[13px] text-[#565959]">{storeData.business_type}</div>
                </div>
              )}
              <div>
                <div className="font-bold text-[14px] mb-2">{t('currency')}</div>
                <div className="text-[13px] text-[#565959]">{storeData.currency_symbol}</div>
              </div>
            </div>
            
            {/* Additional Information */}
            {(storeData.contact_email || storeData.contact_phone || storeData.tax_id || storeData.vat_number) && (
              <div className="mt-6 pt-6 border-t border-[#D5D9D9]">
                <div className="font-bold text-[14px] mb-4">{t('contactTaxInformation')}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {storeData.contact_email && (
                    <div>
                      <div className="font-bold text-[14px] mb-2">{t('contactEmail')}</div>
                      <div className="text-[13px] text-[#565959]">{storeData.contact_email}</div>
                    </div>
                  )}
                  {storeData.contact_phone && (
                    <div>
                      <div className="font-bold text-[14px] mb-2">{t('contactPhone')}</div>
                      <div className="text-[13px] text-[#565959]">{storeData.contact_phone}</div>
                    </div>
                  )}
                  {storeData.tax_id && (
                    <div>
                      <div className="font-bold text-[14px] mb-2">{t('taxId')}</div>
                      <div className="text-[13px] text-[#565959]">{storeData.tax_id}</div>
                    </div>
                  )}
                  {storeData.vat_number && (
                    <div>
                      <div className="font-bold text-[14px] mb-2">{t('vatNumber')}</div>
                      <div className="text-[13px] text-[#565959]">{storeData.vat_number}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Store URL Card */}
        <Card title={t('storeUrl')} headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">{t('manageStoreUrl')}</button>}>
          <div className="p-1">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#565959]">https://www.amazon.{storeData.country === 'United States' ? 'com' : storeData.country.toLowerCase()}/shops/</span>
              <span className="font-bold text-[13px]">{generateStoreUrl(storeData.name)}</span>
            </div>
            <div className="mt-4 text-[13px] text-[#565959]">
              {t('storeUrlDescription')}
            </div>
          </div>
        </Card>

        {/* Store Design Card */}
        <Card title={t('storeDesign')} headerAction={<button className="text-[13px] text-amazon-link font-bold hover:underline">{t('designYourStore')}</button>}>
          <div className="p-1">
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 bg-[#F0F2F2] rounded-[4px] flex items-center justify-center">
                <Globe size={32} className="text-[#565959]" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[14px] mb-1">{t('currentStoreDesign')}</div>
                <div className="text-[13px] text-[#565959] mb-3">{t('basicAmazonStoreDesign')}</div>
                <div className="text-[13px] text-[#565959] leading-relaxed">
                  {t('customizeStoreDesign')}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Store Timestamps */}
        <Card title={t('storeInformation')}>
          <div className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#565959]">
              <div>
                <div className="font-bold text-[14px] mb-2">{t('created')}</div>
                <div>{new Date(storeData.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="font-bold text-[14px] mb-2">{t('lastUpdated')}</div>
                <div>{new Date(storeData.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StoreInfo;
