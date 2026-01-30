
import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, Download } from 'lucide-react';
import { Card } from '../components/UI';
import { useI18n } from '../hooks/useI18n';
import { useStore } from '../store';
import { apiGet, API_CONFIG } from '../config/api';

// Star Rating Component
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-medium text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

// Colored Pill Component
const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useI18n();
  
  const getStatusColor = () => {
    switch (status) {
      case t('veryPoor'):
        return 'bg-red-100 text-red-700';
      case t('poor'):
        return 'bg-orange-100 text-orange-700';
      case t('fair'):
        return 'bg-yellow-100 text-yellow-700';
      case t('good'):
        return 'bg-green-100 text-green-700';
      case t('excellent'):
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
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
  const [vocData, setVocData] = useState<any[]>([]);
  const [filteredVocData, setFilteredVocData] = useState<any[]>([]);

  // Load CX Health data from backend
  useEffect(() => {
    const loadCxHealthData = async () => {
      if (!currentStore?.id) return;
      
      try {
        setLoading(true);
        const response = await apiGet(`/api/voc/cx-health/${currentStore.id}`);
        if (response.success) {
          setCxHealthData(response.data);
        }
      } catch (error) {
        console.error('Failed to load CX Health data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCxHealthData();
  }, [currentStore]);

  // Load VOC data from backend
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
        // Fallback to mock data if API fails
        setVocData(offerListings);
        setFilteredVocData(offerListings);
      }
    };

    loadVocData();
  }, [currentStore]);

  // Handle search functionality
  const handleSearch = () => {
    let filtered = vocData;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.asin?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply condition filter
    if (conditionFilter && conditionFilter !== t('filterConditions')) {
      filtered = filtered.filter(item => item.skuStatus === conditionFilter);
    }

    // Apply fulfillment filter
    if (fulfillmentFilter && fulfillmentFilter !== t('orderFulfillment')) {
      filtered = filtered.filter(item => item.fulfillment === fulfillmentFilter);
    }

    // Apply satisfaction filter
    if (satisfactionFilter && satisfactionFilter !== t('buyerSatisfactionStatus')) {
      filtered = filtered.filter(item => item.satisfactionStatus === satisfactionFilter);
    }

    // Apply time filter (simplified - in real implementation would filter by lastUpdated date)
    if (timeFilter && timeFilter !== t('lastUpdateTime')) {
      // This would need proper date filtering logic
      console.log('Time filter applied:', timeFilter);
    }

    setFilteredVocData(filtered);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setConditionFilter('');
    setFulfillmentFilter('');
    setSatisfactionFilter('');
    setTimeFilter('');
    setFilteredVocData(vocData);
  };

  // Handle download data
  const handleDownloadData = () => {
    // Convert filtered data to CSV format
    const headers = ['Product Name', 'ASIN', 'SKU Status', 'Fulfillment', 'Dissatisfaction Rate', 'Total Orders', 'Rating', 'Return Rate', 'Satisfaction Status'];
    const csvContent = [
      headers.join(','),
      ...filteredVocData.map(item => [
        `"${item.productName}"`,
        item.asin,
        item.skuStatus,
        item.fulfillment,
        item.dissatisfactionRate,
        item.totalOrders,
        item.rating,
        item.returnRate,
        item.satisfactionStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voc-data-${currentStore?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Dynamic satisfaction summary based on backend data
  const satisfactionSummary = cxHealthData ? [
    { status: t('poor'), count: cxHealthData.poor_listings, color: 'bg-red-100 text-red-700' },
    { status: t('fair'), count: cxHealthData.fair_listings, color: 'bg-orange-100 text-orange-700' },
    { status: t('good'), count: cxHealthData.good_listings, color: 'bg-yellow-100 text-yellow-700' },
    { status: t('veryGood'), count: cxHealthData.very_good_listings, color: 'bg-green-100 text-green-700' },
    { status: t('excellent'), count: cxHealthData.excellent_listings, color: 'bg-green-200 text-green-800' },
  ] : [
    { status: t('poor'), count: 6, color: 'bg-red-100 text-red-700' },
    { status: t('fair'), count: 0, color: 'bg-orange-100 text-orange-700' },
    { status: t('good'), count: 0, color: 'bg-yellow-100 text-yellow-700' },
    { status: t('veryGood'), count: 1, color: 'bg-green-100 text-green-700' },
    { status: t('excellent'), count: 6, color: 'bg-green-200 text-green-800' },
  ];

  // Mock data for offer listings (13 rows)
  const offerListings = [
    {
      id: 1,
      image: 'https://via.placeholder.com/50',
      productName: 'Wireless Bluetooth Headphones',
      asin: 'B012345678',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '1.2%',
      dissatisfactionOrders: 15,
      totalOrders: 1250,
      rating: 4.5,
      returnRate: '2.3%',
      mainNegativeReason: t('batteryLifeInsufficient'),
      lastUpdated: '2026-01-12',
      satisfactionStatus: t('good'),
      isOutOfStock: false
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/50',
      productName: 'Smart Home Security Camera',
      asin: 'B087654321',
      skuStatus: t('onSale'),
      fulfillment: t('sellerFulfillment'),
      dissatisfactionRate: '5.8%',
      dissatisfactionOrders: 42,
      totalOrders: 724,
      rating: 3.8,
      returnRate: '4.1%',
      mainNegativeReason: t('connectionUnstable'),
      lastUpdated: '2026-01-13',
      satisfactionStatus: t('fair'),
      isOutOfStock: false
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/50',
      productName: 'Portable External SSD 1TB',
      asin: 'B098765432',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '0.5%',
      dissatisfactionOrders: 8,
      totalOrders: 1600,
      rating: 4.9,
      returnRate: '1.2%',
      mainNegativeReason: t('none'),
      lastUpdated: '2026-01-11',
      satisfactionStatus: t('excellent'),
      isOutOfStock: false
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/50',
      productName: 'Electric Toothbrush with UV Sanitizer',
      asin: 'B076543210',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '8.9%',
      dissatisfactionOrders: 67,
      totalOrders: 753,
      rating: 3.2,
      returnRate: '6.5%',
      mainNegativeReason: t('productQualityIssues'),
      lastUpdated: '2026-01-13',
      satisfactionStatus: t('veryPoor'),
      isOutOfStock: false
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/50',
      productName: 'Wireless Charging Pad',
      asin: 'B065432109',
      skuStatus: t('onSale'),
      fulfillment: t('sellerFulfillment'),
      dissatisfactionRate: '3.4%',
      dissatisfactionOrders: 23,
      totalOrders: 676,
      rating: 4.1,
      returnRate: '3.0%',
      mainNegativeReason: t('chargingSpeedSlow'),
      lastUpdated: '2026-01-12',
      satisfactionStatus: t('qualified'),
      isOutOfStock: true
    },
    {
      id: 6,
      image: 'https://via.placeholder.com/50',
      productName: 'Fitness Tracker Watch',
      asin: 'B054321098',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '2.1%',
      dissatisfactionOrders: 34,
      totalOrders: 1619,
      rating: 4.4,
      returnRate: '2.8%',
      mainNegativeReason: t('screenEasilyScratched'),
      lastUpdated: '2026-01-11',
      satisfactionStatus: t('good'),
      isOutOfStock: false
    },
    {
      id: 7,
      image: 'https://via.placeholder.com/50',
      productName: 'Smart WiFi Router',
      asin: 'B043210987',
      skuStatus: t('onSale'),
      fulfillment: t('sellerFulfillment'),
      dissatisfactionRate: '6.7%',
      dissatisfactionOrders: 52,
      totalOrders: 776,
      rating: 3.5,
      returnRate: '5.2%',
      mainNegativeReason: t('complexSetup'),
      lastUpdated: '2026-01-13',
      satisfactionStatus: t('poor'),
      isOutOfStock: false
    },
    {
      id: 8,
      image: 'https://via.placeholder.com/50',
      productName: 'Waterproof Bluetooth Speaker',
      asin: 'B032109876',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '1.8%',
      dissatisfactionOrders: 27,
      totalOrders: 1498,
      rating: 4.6,
      returnRate: '2.1%',
      mainNegativeReason: t('averageSound'),
      lastUpdated: '2026-01-12',
      satisfactionStatus: t('good'),
      isOutOfStock: false
    },
    {
      id: 9,
      image: 'https://via.placeholder.com/50',
      productName: 'USB-C Hub Multiport Adapter',
      asin: 'B021098765',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '0.9%',
      dissatisfactionOrders: 12,
      totalOrders: 1333,
      rating: 4.8,
      returnRate: '1.5%',
      mainNegativeReason: t('none'),
      lastUpdated: '2026-01-11',
      satisfactionStatus: t('excellent'),
      isOutOfStock: false
    },
    {
      id: 10,
      image: 'https://via.placeholder.com/50',
      productName: 'Gaming Mouse with RGB Lighting',
      asin: 'B010987654',
      skuStatus: t('onSale'),
      fulfillment: t('sellerFulfillment'),
      dissatisfactionRate: '4.3%',
      dissatisfactionOrders: 31,
      totalOrders: 721,
      rating: 4.0,
      returnRate: '3.8%',
      mainNegativeReason: t('buttonNotResponsive'),
      lastUpdated: '2026-01-13',
      satisfactionStatus: t('fair'),
      isOutOfStock: false
    },
    {
      id: 11,
      image: 'https://via.placeholder.com/50',
      productName: 'Reusable Silicone Food Storage Bags',
      asin: 'B009876543',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '1.5%',
      dissatisfactionOrders: 21,
      totalOrders: 1400,
      rating: 4.5,
      returnRate: '2.0%',
      mainNegativeReason: t('poorSealing'),
      lastUpdated: '2026-01-12',
      satisfactionStatus: t('good'),
      isOutOfStock: false
    },
    {
      id: 12,
      image: 'https://via.placeholder.com/50',
      productName: 'LED Desk Lamp with USB Charging',
      asin: 'B097654321',
      skuStatus: t('onSale'),
      fulfillment: t('sellerFulfillment'),
      dissatisfactionRate: '2.7%',
      dissatisfactionOrders: 19,
      totalOrders: 704,
      rating: 4.2,
      returnRate: '2.9%',
      mainNegativeReason: t('harshLight'),
      lastUpdated: '2026-01-11',
      satisfactionStatus: t('qualified'),
      isOutOfStock: false
    },
    {
      id: 13,
      image: 'https://via.placeholder.com/50',
      productName: 'Portable Power Bank 20000mAh',
      asin: 'B086543210',
      skuStatus: t('onSale'),
      fulfillment: t('amazonFulfillment'),
      dissatisfactionRate: '0.7%',
      dissatisfactionOrders: 10,
      totalOrders: 1428,
      rating: 4.7,
      returnRate: '1.3%',
      mainNegativeReason: t('none'),
      lastUpdated: '2026-01-13',
      satisfactionStatus: t('excellent'),
      isOutOfStock: false
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('voiceOfCustomer')}</h1>
        <div className="flex items-center text-sm text-gray-600">
          <p>{t('voiceOfCustomerDesc')}</p>
          <a href="#" className="ml-2 text-amazon-link font-medium hover:underline">
            {t('learnMoreInfo')}
          </a>
        </div>
      </div>

      {/* Satisfaction Summary Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('satisfactionSummaryTitle')}</h2>
          <a href="#" className="flex items-center text-sm text-amazon-link font-medium hover:underline">
            <HelpCircle size={14} className="mr-1" />
            {t('howMeasureSatisfaction')}
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {satisfactionSummary.map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-sm p-4">
              <div className="flex justify-between items-center mb-2">
                <StatusPill status={item.status} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{item.count}</div>
              <a href="#" className="text-sm text-amazon-link font-medium hover:underline">
                {t('viewProductInfo')}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Filter/Search Bar */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder={t('searchProductAsin')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-amazon-orange text-white text-sm font-medium rounded-sm hover:bg-amazon-orange-dark"
          >
            {t('searchButton')}
          </button>
          
          {/* Dropdown Filters */}
          <div className="flex gap-3 flex-wrap">
            <select 
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            >
              <option value="">{t('filterConditions')}</option>
              <option value={t('onSale')}>{t('onSale')}</option>
              <option value="Inactive">Inactive</option>
            </select>
            
            <select 
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            >
              <option value="">{t('orderFulfillment')}</option>
              <option value={t('amazonFulfillment')}>{t('amazonFulfillment')}</option>
              <option value={t('sellerFulfillment')}>{t('sellerFulfillment')}</option>
            </select>
            
            <select 
              value={satisfactionFilter}
              onChange={(e) => setSatisfactionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            >
              <option value="">{t('buyerSatisfactionStatus')}</option>
              <option value={t('excellent')}>{t('excellent')}</option>
              <option value={t('good')}>{t('good')}</option>
              <option value={t('fair')}>{t('fair')}</option>
              <option value={t('poor')}>{t('poor')}</option>
              <option value={t('veryPoor')}>{t('veryPoor')}</option>
            </select>
            
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            >
              <option value="">{t('lastUpdateTime')}</option>
              <option value={t('past7Days')}>{t('past7Days')}</option>
              <option value={t('past30Days')}>{t('past30Days')}</option>
              <option value={t('past90Days')}>{t('past90Days')}</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="ml-auto flex gap-3">
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-sm hover:bg-gray-50"
            >
              {t('clearFilters')}
            </button>
            <button 
              onClick={handleDownloadData}
              className="px-4 py-2 bg-amazon-orange text-white text-sm font-medium rounded-sm hover:bg-amazon-orange-dark flex items-center"
            >
              <Download size={14} className="mr-1" />
              {t('downloadData')}
            </button>
          </div>
        </div>
      </div>

      {/* Offer Listings Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">{filteredVocData.length} {t('offerListings')}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('image')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('productNameAsin')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('skuStatus')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderFulfillment')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dissatisfactionRate')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dissatisfactionOrders')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('totalOrders')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('starRating')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('returnRate')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('mainNegativeReason')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lastUpdated')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('satisfactionStatus')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('outOfStockMark')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredVocData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* Image */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-sm border border-gray-200" />
                  </td>
                  
                  {/* Product Name/ASIN */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <a href="#" className="text-amazon-link font-medium hover:underline">
                        {item.productName}
                      </a>
                    </div>
                    <div className="text-xs text-gray-500">{item.asin}</div>
                  </td>
                  
                  {/* SKU Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{item.skuStatus}</span>
                  </td>
                  
                  {/* Fulfillment */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{item.fulfillment}</span>
                  </td>
                  
                  {/* Dissatisfaction Rate */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{item.dissatisfactionRate}</span>
                  </td>
                  
                  {/* Dissatisfaction Orders */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{item.dissatisfactionOrders}</span>
                  </td>
                  
                  {/* Total Orders */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{item.totalOrders}</span>
                  </td>
                  
                  {/* Rating */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StarRating rating={item.rating} />
                  </td>
                  
                  {/* Return Rate */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{item.returnRate}</span>
                  </td>
                  
                  {/* Main Negative Reason */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{item.mainNegativeReason}</span>
                  </td>
                  
                  {/* Last Updated */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{item.lastUpdated}</span>
                  </td>
                  
                  {/* Satisfaction Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusPill status={item.satisfactionStatus} />
                  </td>
                  
                  {/* Out of Stock */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{item.isOutOfStock ? t('yes') : t('no')}</span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button className="text-amazon-link font-medium hover:underline text-sm">
                      {t('viewDetailsVoc')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VoiceOfTheCustomer;
