import React, { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Search, Download, ChevronDown } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useStore } from '../store';
import { apiGet } from '../config/api';

/**
 * ✅ 说明：
 * - 不改 API：/api/voc/cx-health/:storeId、/api/voc/data/:storeId
 * - 重点做 1:1 结构：
 *   1) Learn More 独立下一行开头
 *   2) 左侧信息卡与右侧五卡高度一致（minHeight 对齐）
 *   3) Filter conditions + 3下拉整体靠右，贴近 Clear filters
 *   4) 表格表头竖分隔线、排序箭头、info 圆圈
 *   5) 星级：空心星（描边） + 尺寸与数字接近
 *   6) Satisfaction status：实心胶囊，颜色与顶部五卡一致（而不是灰色）
 */

// ===== Header icons =====
const SortIcon = () => (
  <span className="ml-1 inline-flex flex-col leading-[8px] text-[#565959] text-[10px]">
    <span>↑</span>
    <span>↓</span>
  </span>
);

const InfoIcon = () => (
  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[#879596] text-[#565959] text-[11px] ml-1">
    i
  </span>
);

// ===== Outline star (Seller Central look) =====
const OutlineStar: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2.7l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6-4.9-4.6 6.7-.9L12 2.7z"
      fill="transparent"
      stroke="#f0b400"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const AmazonStarRatingOutline: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <OutlineStar key={i} />
      ))}
    </div>
    <span className="text-[13px] text-[#0f1111]">{Number(rating || 0).toFixed(1)}</span>
  </div>
);

// ===== Top summary badge =====
const SummaryBadge: React.FC<{ status: string; t: any }> = ({ status, t }) => {
  const cls = (() => {
    if (status === t('veryPoor')) return 'bg-[#cc3a00] text-white';
    if (status === t('poor')) return 'bg-[#ff9900] text-white';
    if (status === t('fair')) return 'bg-[#f2c200] text-white';
    if (status === t('good') || status === t('veryGood')) return 'bg-[#9acd32] text-white';
    if (status === t('excellent')) return 'bg-[#3b7a1a] text-white';
    return 'bg-gray-500 text-white';
  })();

  return (
    <span className={`inline-flex items-center justify-center h-7 px-10 rounded-full text-[14px] font-bold ${cls}`}>
      {status}
    </span>
  );
};

// ===== Table satisfaction (solid + compact) =====
const SatisfactionSolidPill: React.FC<{ status: string; t: any }> = ({ status, t }) => {
  const cls = (() => {
    if (status === t('veryPoor')) return 'bg-[#cc3a00] text-white';
    if (status === t('poor')) return 'bg-[#ff9900] text-white';
    if (status === t('fair')) return 'bg-[#f2c200] text-white';
    if (status === t('good') || status === t('veryGood')) return 'bg-[#9acd32] text-white';
    if (status === t('excellent')) return 'bg-[#3b7a1a] text-white';
    return 'bg-[#9acd32] text-white';
  })();

  return (
    <span className={`inline-flex items-center justify-center h-6 px-6 rounded-full text-[12px] font-semibold ${cls}`}>
      {status}
    </span>
  );
};

// ===== Amazon-like select (button look but keeps native select) =====
const AmazonSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}> = ({ value, onChange, placeholder, options }) => {
  return (
    <div className="relative inline-flex items-center h-9 px-3 border border-[#d5d9d9] bg-white rounded-sm">
      <span className="text-[13px] font-semibold text-[#0f1111] whitespace-nowrap">
        {value ? value : placeholder}
      </span>
      <ChevronDown size={16} className="ml-2 text-[#565959]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
};

type VocRow = {
  id?: string | number;
  image?: string;
  productName?: string;
  product_name?: string;
  asin?: string;

  // 你后端可能字段不叫 sku，这里做容错：sku / skuId / sellerSku / sku_code 等都能显示
  sku?: string;
  skuId?: string;
  sellerSku?: string;
  sku_code?: string;

  skuStatus?: string;
  sku_status?: string;
  fulfillment?: string;
  dissatisfactionRate?: string;
  dissatisfaction_rate?: number;
  dissatisfactionOrders?: number | string;
  dissatisfaction_orders?: number;
  totalOrders?: number | string;
  total_orders?: number;
  rating?: number;
  returnRate?: string;
  return_rate?: number;
  mainNegativeReason?: string;
  main_negative_reason?: string;
  lastUpdated?: string;
  last_updated?: string;
  satisfactionStatus?: string;
  satisfaction_status?: string;
  isOutOfStock?: boolean;
  is_out_of_stock?: boolean;
};

const VoiceOfTheCustomer: React.FC = () => {
  const { t } = useI18n();
  const { currentStore } = useStore();

  const [cxHealthData, setCxHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');
  const [satisfactionFilter, setSatisfactionFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');

  const [vocData, setVocData] = useState<VocRow[]>([]);
  const [filteredVocData, setFilteredVocData] = useState<VocRow[]>([]);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // fallback mock (only if api fails)
  const mockOfferListings = useMemo<VocRow[]>(
    () => [
      {
        id: 1,
        image: 'https://via.placeholder.com/48',
        productName: 'Wireless Bluetooth Headphones',
        asin: 'B012345678',
        sku: 'X004TXT9NJ',
        skuStatus: 'New',
        fulfillment: 'Amazon',
        dissatisfactionRate: '8.7%',
        dissatisfactionOrders: 2,
        totalOrders: 23,
        rating: 4.5,
        returnRate: 'N/A',
        mainNegativeReason: '--',
        lastUpdated: '2026-01-07',
        satisfactionStatus: t('good'),
        isOutOfStock: false,
      },
    ],
    [t]
  );

  // ✅ keep API: cx-health
  useEffect(() => {
    const loadCxHealthData = async () => {
      if (!currentStore?.id) return;
      try {
        setLoading(true);
        const response = await apiGet(`/api/voc/cx-health/${currentStore.id}`);
        if (response.success) setCxHealthData(response.data);
      } catch (error) {
        console.error('Failed to load CX Health data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCxHealthData();
  }, [currentStore]);

  // ✅ keep API: voc data
  useEffect(() => {
    const loadVocData = async () => {
      if (!currentStore?.id) return;
      try {
        const response = await apiGet(`/api/voc/data/${currentStore.id}`);
        if (response.success && response.data) {
          setVocData(response.data);
          setFilteredVocData(response.data);
        }
      } catch (error) {
        console.error('Failed to load VOC data:', error);
        setVocData(mockOfferListings);
        setFilteredVocData(mockOfferListings);
      }
    };
    loadVocData();
  }, [currentStore]); // 移除 mockOfferListings 依赖

  const getSkuValue = (item: VocRow) =>
    item.sku || item.sellerSku || item.skuId || item.sku_code || '';

  const handleSearch = () => {
    let filtered = vocData;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.productName || item.product_name || '').toLowerCase().includes(q) ||
          (item.asin || '').toLowerCase().includes(q) ||
          (getSkuValue(item) || '').toLowerCase().includes(q)
      );
    }

    if (conditionFilter && conditionFilter !== t('filterConditions')) {
      filtered = filtered.filter((item) => item.skuStatus === conditionFilter);
    }

    if (fulfillmentFilter && fulfillmentFilter !== t('orderFulfillment')) {
      filtered = filtered.filter((item) => item.fulfillment === fulfillmentFilter);
    }

    if (satisfactionFilter && satisfactionFilter !== t('buyerSatisfactionStatus')) {
      filtered = filtered.filter((item) => item.satisfactionStatus === satisfactionFilter);
    }

    if (timeFilter && timeFilter !== t('lastUpdateTime')) {
      // keep simplified behavior
      console.log('Time filter applied:', timeFilter);
    }

    setFilteredVocData(filtered);
    setCurrentPage(1); // 重置到第一页
  };

  // 分页计算
  const totalPages = Math.ceil(filteredVocData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredVocData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setConditionFilter('');
    setFulfillmentFilter('');
    setSatisfactionFilter('');
    setTimeFilter('');
    setFilteredVocData(vocData);
  };

  const handleDownloadData = () => {
    const headers = [
      'Product Name',
      'ASIN',
      'SKU',
      'SKU Status',
      'Fulfillment',
      'Dissatisfaction Rate',
      'Dissatisfaction Orders',
      'Total Orders',
      'Rating',
      'Return Rate',
      'Satisfaction Status',
      'Last Updated',
      'Out of stock mark displayed',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredVocData.map((item) =>
        [
          `"${item.productName || item.product_name || ''}"`,
          item.asin ?? '',
          getSkuValue(item),
          (item.skuStatus || item.sku_status) ?? '',
          item.fulfillment ?? '',
          (item.dissatisfactionRate || (item.dissatisfaction_rate ? `${item.dissatisfaction_rate}%` : '') || ''),
          (item.dissatisfactionOrders ?? item.dissatisfaction_orders) ?? '',
          (item.totalOrders ?? item.total_orders) ?? '',
          item.rating ?? '',
          (item.returnRate || (item.return_rate ? `${item.return_rate}%` : '')) ?? '',
          (item.satisfactionStatus || item.satisfaction_status) ?? '',
          (item.lastUpdated || item.last_updated || ''),
          (item.isOutOfStock ?? item.is_out_of_stock) ? 'Yes' : 'No',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voc-data-${currentStore?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const satisfactionSummary = cxHealthData
    ? [
        { status: t('veryPoor'), count: cxHealthData.very_poor_listings ?? 0 },
        { status: t('poor'), count: cxHealthData.poor_listings ?? 0 },
        { status: t('fair'), count: cxHealthData.fair_listings ?? 0 },
        { status: t('good'), count: cxHealthData.good_listings ?? 0 },
        { status: t('excellent'), count: cxHealthData.excellent_listings ?? 0 },
      ]
    : [
        { status: t('veryPoor'), count: 0 },
        { status: t('poor'), count: 10 },
        { status: t('fair'), count: 3 },
        { status: t('good'), count: 67 },
        { status: t('excellent'), count: 6 },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="px-6 py-6">
        {/* ===== Title ===== */}
        <h1 className="text-[36px] font-bold text-[#0f1111] leading-tight">{t('voiceOfTheCustomerTitle')}</h1>

        {/* ✅ Learn More 独立下一行开头 */}
        <div className="mt-2 text-[13px] text-[#0f1111] leading-5 max-w-[980px]">
          <div>{t('voiceOfTheCustomerSubtitle')}</div>
          <a href="#" className="text-[#007185] hover:underline font-semibold" onClick={(e) => e.preventDefault()}>
            {t('learnMore')}
          </a>
        </div>

        {/* ===== Summary + Filters ===== */}
        <div className="mt-4 border border-[#d5d9d9] bg-white">
          {/* Top row */}
          <div className="p-4">
            <div className="grid grid-cols-12 gap-4 items-stretch">
              {/* ✅ 左侧信息卡：高度与右侧五卡一致 */}
              <div className="col-span-12 lg:col-span-3 bg-white pr-2">
                <div className="p-4 min-h-[140px] flex flex-col">
                  <div className="text-[14px] font-bold text-[#0f1111]">
                    {t('yourProductBuyerSatisfactionTitle')}
                  </div>

                  <div className="mt-auto">
                    <a
                      href="#"
                      className="inline-flex items-center text-[13px] text-[#007185] hover:underline font-semibold"
                      onClick={(e) => e.preventDefault()}
                    >
                      <HelpCircle size={16} className="mr-2 text-[#007185]" />
                      {t('howIsBuyerSatisfactionMeasured')}
                    </a>
                  </div>
                </div>
              </div>

              {/* five cards */}
              <div className="col-span-12 lg:col-span-9">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {satisfactionSummary.map((item, index) => (
                    <div key={index} className="border border-[#e7e7e7] bg-white">
                      <div className="p-4 min-h-[140px] flex flex-col items-center justify-center">
                        <SummaryBadge status={item.status} t={t} />
                        <div className="mt-3 text-[32px] font-bold text-[#0f1111] leading-none">{item.count}</div>
                        <a
                          href="#"
                          className="mt-3 text-[13px] text-[#007185] hover:underline font-semibold"
                          onClick={(e) => e.preventDefault()}
                        >
                          {t('viewProductInfo')}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#e7e7e7]" />

          {/* ✅ Filters：筛选组整体靠右靠近 Clear filters */}
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Left: search */}
              <div className="flex items-center gap-3">
                <div className="relative w-[280px]">
                  <input
                    type="text"
                    placeholder={t('searchProductNameAsin')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-10 pr-3 border border-[#7f8891] rounded-sm text-[13px] focus:outline-none"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565959]" />
                </div>

                <button
                  onClick={handleSearch}
                  className="h-9 px-5 bg-[#007185] text-white text-[13px] font-bold rounded-sm hover:bg-[#005f6a]"
                >
                  {t('searchButton')}
                </button>
              </div>

              {/* Right: Filter conditions group */}
              <div className="ml-auto flex items-center gap-3 flex-wrap">
                <span className="text-[13px] font-bold text-[#0f1111]">{t('filterConditionsLabel')}</span>

                <AmazonSelect
                  value={fulfillmentFilter}
                  onChange={setFulfillmentFilter}
                  placeholder={t('orderFulfillmentLabel')}
                  options={[t('amazonFulfillment'), t('sellerFulfillment')]}
                />

                <AmazonSelect
                  value={satisfactionFilter}
                  onChange={setSatisfactionFilter}
                  placeholder={t('buyerSatisfactionStatusLabel')}
                  options={[t('excellent'), t('good'), t('fair'), t('poor'), t('veryPoor')]}
                />

                <AmazonSelect
                  value={timeFilter}
                  onChange={setTimeFilter}
                  placeholder={t('lastUpdateTimeLabel')}
                  options={[t('past7Days'), t('past30Days'), t('past90Days')]}
                />

                <button
                  onClick={handleClearFilters}
                  className="h-9 px-5 border border-[#007185] bg-white text-[#007185] text-[13px] font-bold rounded-sm hover:bg-[#f0fbfc]"
                >
                  {t('clearFiltersButton')}
                </button>

                <button
                  onClick={handleDownloadData}
                  className="h-9 px-5 bg-[#007185] text-white text-[13px] font-bold rounded-sm hover:bg-[#005f6a] inline-flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  {t('downloadDataButton')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="mt-6 border border-[#d5d9d9] bg-white">
          <div className="px-4 py-3 border-b border-[#e7e7e7] bg-[#f7f8fa]">
            <div className="text-[16px] font-bold text-[#0f1111]">
              {t('offerListingsCount', { count: filteredVocData.length })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f7f8fa]">
                <tr className="border-b border-[#e7e7e7] text-[#0f1111]">
                  <th className="px-4 py-3 text-left font-bold whitespace-nowrap">{t('imageColumn')}</th>

                  <th className="px-4 py-3 text-left font-bold">
                    <div className="leading-4">
                      <div>{t('productNameAsinColumn').split('/')[0]}</div>
                      <div>{t('productNameAsinColumn').split('/')[1]}</div>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('skuStatusColumn').split(' ')[0]}</div>
                      <div>{t('skuStatusColumn').split(' ')[1]}</div>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('orderFulfillmentColumn').split(' ')[0]}</div>
                      <div>{t('orderFulfillmentColumn').split(' ')[1] || ''}</div>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('dissatisfactionRateColumn').split(' ')[0]}</div>
                      <div>{t('dissatisfactionRateColumn').split(' ')[1] || ''}</div>
                    </div>
                    <SortIcon />
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('dissatisfactionOrdersColumn').split(' ')[0]}</div>
                      <div>{t('dissatisfactionOrdersColumn').split(' ')[1] || ''}</div>
                    </div>
                    <SortIcon />
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('totalOrdersColumn').split(' ')[0]}</div>
                      <div>{t('totalOrdersColumn').split(' ')[1] || ''}</div>
                    </div>
                    <SortIcon />
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7] whitespace-nowrap">
                    {t('starRatingColumn')}
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('returnRateColumn').split(' ')[0]}</div>
                      <div>{t('returnRateColumn').split(' ')[1] || ''}</div>
                    </div>
                    <InfoIcon />
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('mainNegativeReasonColumn').split(' ')[0]} {t('mainNegativeReasonColumn').split(' ')[1]}</div>
                      <div>{t('mainNegativeReasonColumn').split(' ')[2] || ''}</div>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('lastUpdatedColumn').split(' ')[0]}</div>
                      <div>{t('lastUpdatedColumn').split(' ')[1] || ''}</div>
                    </div>
                    <SortIcon />
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('satisfactionStatusColumn').split(' ')[0]}</div>
                      <div>{t('satisfactionStatusColumn').split(' ')[1] || ''}</div>
                    </div>
                    <SortIcon />
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7]">
                    <div className="leading-4">
                      <div>{t('outOfStockMarkColumn').split(' ')[0]} {t('outOfStockMarkColumn').split(' ')[1]} {t('outOfStockMarkColumn').split(' ')[2]} {t('outOfStockMarkColumn').split(' ')[3]}</div>
                      <div>{t('outOfStockMarkColumn').split(' ')[4] || ''}</div>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left font-bold border-l border-[#e7e7e7] whitespace-nowrap">
                    {t('actionsColumnVoc')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentPageData.map((item, idx) => (
                  <tr key={String(item.id ?? idx)} className="border-b border-[#f0f2f2] hover:bg-[#f7fafa]">
                    <td className="px-4 py-4">
                      <img
                        src={item.image || 'https://via.placeholder.com/48'}
                        alt={item.productName || ''}
                        className="w-12 h-12 object-cover border border-[#e7e7e7]"
                      />
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="max-w-[560px]">
                        <a href="#" className="text-[#007185] hover:underline font-semibold" onClick={(e) => e.preventDefault()}>
                          {item.productName || item.product_name || ''}
                        </a>
                        <div className="text-[12px] text-[#565959] mt-1">{item.asin || ''}</div>
                      </div>
                    </td>

                    {/* SKU two lines: SKU + status */}
                    <td className="px-4 py-4 border-l border-[#f0f2f2]">
                      <div className="font-semibold text-[#0f1111]">{getSkuValue(item)}</div>
                      <div className="text-[#565959] mt-1">{item.skuStatus || item.sku_status || ''}</div>
                    </td>

                    <td className="px-4 py-4 border-l border-[#f0f2f2] font-semibold text-[#0f1111]">
                      {item.fulfillment || ''}
                    </td>

                    <td className="px-4 py-4 border-l border-[#f0f2f2] text-[#0f1111]">
                      {(item.dissatisfactionRate || (item.dissatisfaction_rate ? `${item.dissatisfaction_rate}%` : '')) || ''}
                    </td>
                    <td className="px-4 py-4 border-l border-[#f0f2f2] text-[#0f1111]">
                      {(item.dissatisfactionOrders ?? item.dissatisfaction_orders) ?? ''}
                    </td>
                    <td className="px-4 py-4 border-l border-[#f0f2f2] text-[#0f1111]">
                      {(item.totalOrders ?? item.total_orders) ?? ''}
                    </td>

                    <td className="px-4 py-4 border-l border-[#f0f2f2]">
                      <AmazonStarRatingOutline rating={Number(item.rating || 0)} />
                    </td>

                    <td className="px-4 py-4 border-l border-[#f0f2f2] text-[#0f1111]">
                      {(item.returnRate || (item.return_rate ? `${item.return_rate}%` : '')) || ''}
                    </td>
                    <td className="px-4 py-4 border-l border-[#f0f2f2] text-[#0f1111]">
                      {(item.mainNegativeReason || item.main_negative_reason) || ''}
                    </td>

                    {/* 真实页日期常换行显示，这里让它在窄列自动换行 */}
                    <td className="px-4 py-4 border-l border-[#f0f2f2] text-[#0f1111] whitespace-normal">
                      {(item.lastUpdated || item.last_updated) || ''}
                    </td>

                    <td className="px-4 py-4 border-l border-[#f0f2f2]">
                      <SatisfactionSolidPill status={(item.satisfactionStatus || item.satisfaction_status) || ''} t={t} />
                    </td>

                    <td className="px-4 py-4 border-l border-[#f0f2f2] font-semibold text-[#0f1111]">
                      {item.isOutOfStock ? t('yes') : t('no')}
                    </td>

                    <td className="px-4 py-4 border-l border-[#f0f2f2]">
                      <button className="h-8 px-5 bg-[#007185] text-white text-[13px] font-semibold rounded-sm hover:bg-[#005f6a]">
                        {t('viewDetailsButton')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-4">
              <div className="text-sm text-[#565959]">
                {t('paginationShowingRecords', { 
                  start: startIndex + 1, 
                  end: Math.min(endIndex, filteredVocData.length), 
                  total: filteredVocData.length 
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-[#d5d9d9] rounded bg-white hover:bg-[#f7fafa] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('previousPage')}
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded ${
                      page === currentPage
                        ? 'bg-[#007185] text-white border-[#007185]'
                        : 'bg-white border-[#d5d9d9] hover:bg-[#f7fafa]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-[#d5d9d9] rounded bg-white hover:bg-[#f7fafa] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('nextPage')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
};

export default VoiceOfTheCustomer;
