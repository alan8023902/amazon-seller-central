import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Star,
  ChevronLeft,
  Settings,
  Info
} from 'lucide-react';
import { useStore } from '../store';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../utils/cn';
import { ActionsCard, CommunicationsCard } from './LeftColumnComponents';
import { storeApi, type StoreData, type DashboardData } from '../services/storeApi';
import { API_CONFIG, apiGet } from '../config/api';

// ==================== Mock Data ====================
const ACTIONS = [
  { id: "shipmentPerformance", count: null },
  { id: "shipOrders", count: 10 },
  { id: "reviewReturns", count: 2 },
  { id: "fixStrandedInventory", count: null },
];

type ProductRow = {
  id: number;
  title: string;
  sku: string;
  asin: string;
  listingStatus: 'Active' | 'Inactive';
  sales: string;
  unitsSold: number;
  pageViews: number;
  inventory: string;
  price: string;
  img: string;
};

const MOCK_PRODUCTS: ProductRow[] = [
  {
    id: 1,
    title: "Lace Things for Women Bralette",
    sku: "SKU: TYNBO-LACE-001",
    asin: "ASIN: B08F765432",
    listingStatus: "Active",
    sales: "$822",
    unitsSold: 21,
    pageViews: 298,
    inventory: "66", // Remove hardcoded Chinese, will be handled by translation
    price: "$39.99",
    img: "https://m.media-amazon.com/images/I/71tJkM8vDVL._AC_UY218_.jpg",
  },
  {
    id: 2,
    title: "Easy Soft Stretch Womens Underwear",
    sku: "SKU: TYNBO-UNDER-002",
    asin: "ASIN: B08G876543",
    listingStatus: "Active",
    sales: "$160",
    unitsSold: 16,
    pageViews: 0,
    inventory: "102", // Remove hardcoded Chinese, will be handled by translation
    price: "$5.99",
    img: "https://m.media-amazon.com/images/I/51p+sM-iXRL._AC_UY218_.jpg",
  },
  {
    id: 3,
    title: "Easy Soft Stretch Womens Underwear",
    sku: "SKU: TYNBO-UNDER-003",
    asin: "ASIN: B08H987654",
    listingStatus: "Active",
    sales: "$146",
    unitsSold: 18,
    pageViews: 0,
    inventory: "106", // Remove hardcoded Chinese, will be handled by translation
    price: "$5.99",
    img: "https://m.media-amazon.com/images/I/61f8g9h0iJL._AC_UY218_.jpg",
  },
  {
    id: 4,
    title: "Underwear for Women Cotton High",
    sku: "SKU: TYNBO-UNDER-004",
    asin: "ASIN: B08I098765",
    listingStatus: "Active",
    sales: "$107",
    unitsSold: 12,
    pageViews: 0,
    inventory: "83", // Remove hardcoded Chinese, will be handled by translation
    price: "$5.99",
    img: "https://m.media-amazon.com/images/I/61s+N9rK-xL._AC_UY218_.jpg",
  },
  {
    id: 5,
    title: "Lace Things for Women Bralette",
    sku: "SKU: TYNBO-LACE-002",
    asin: "ASIN: B08J109876",
    listingStatus: "Active",
    sales: "$101",
    unitsSold: 10,
    pageViews: 0,
    inventory: "126", // Remove hardcoded Chinese, will be handled by translation
    price: "$19.99",
    img: "https://m.media-amazon.com/images/I/81M51+d85EL._AC_UY218_.jpg",
  },
];

// ==================== Star Rating Component ====================
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "fill-[#FFA41C] text-[#FFA41C]" : "text-[#D5D9D9]"}
        />
      ))}
      <span className="ml-1 text-[16px] font-semibold text-amazon-headerTeal">{(rating || 0).toFixed(2)}</span>
    </div>
  );
}

// ==================== Sparkline Component ====================
function TinySparkline({ strokeWidth = 2 }: { strokeWidth?: number }) {
  return (
    <div className="mt-2 ml-4">
      <div className="h-[44px] w-full relative">
        <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
          {/* Y-axis ticks */}
          <g className="text-[9px] text-[#565959]">
            <text x="-5" y="10" textAnchor="end">100</text>
            <text x="-5" y="30" textAnchor="end">50</text>
            <text x="-5" y="50" textAnchor="end">0</text>
          </g>

          {/* Grid lines */}
          <line x1="0" y1="10" x2="300" y2="10" stroke="#E7EAEA" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="30" x2="300" y2="30" stroke="#E7EAEA" strokeWidth="1" opacity="0.5" />
          <line x1="0" y1="50" x2="300" y2="50" stroke="#E7EAEA" strokeWidth="1" opacity="0.5" />

          {/* Left border */}
          <line x1="0" y1="0" x2="0" y2="60" stroke="#E7EAEA" strokeWidth="1" />

          {/* Main line */}
          <path
            d="M0,50 L50,40 L100,20 L150,35 L200,10 L250,25 L300,18"
            fill="none"
            stroke="#007185"
            strokeWidth={strokeWidth}
          />
          <circle cx="300" cy="18" r="2" fill="#007185" />
        </svg>
      </div>
      <div className="flex justify-between text-[11px] text-[#565959] mt-1">
        <span>Jan 1</span>
        <span>4</span>
        <span>7</span>
      </div>
    </div>
  );
}

// ==================== Dashboard ====================
export default function Dashboard() {
  const { session } = useStore();
  const { t, formatCurrency, formatNumber, getCurrencySymbol } = useI18n();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(t('active'));
  const [interactionFilter, setInteractionFilter] = useState('Frequently interacted');
  const [query, setQuery] = useState("");
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

  const toggleStar = (id: number) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // State for API data
  const [currentStore, setCurrentStore] = useState<StoreData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load store and dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current store from Zustand store
        const { session, stores, refreshStoreData, currentStore: zustandCurrentStore } = useStore.getState();

        // If no stores are loaded, load them first
        if (stores.length === 0) {
          console.log('No stores loaded, refreshing store data...');
          await refreshStoreData();
        }

        // Get updated state after refreshing stores
        const updatedState = useStore.getState();
        let currentStore = updatedState.currentStore;

        // If no current store is set, try to find one based on session
        if (!currentStore && updatedState.stores.length > 0) {
          console.log('No current store set, finding appropriate store...');
          console.log('Available stores:', updatedState.stores.map(s => ({ id: s.id, name: s.name })));
          console.log('Session selectedStoreId:', session.selectedStoreId);
          console.log('Session store name:', session.store?.name);

          // Try to find store by ID first, then by name as fallback
          currentStore = updatedState.stores.find(s => s.id === session.selectedStoreId) ||
            updatedState.stores.find(s => s.name === session.store?.name) ||
            updatedState.stores.find(s => s.is_active) ||
            updatedState.stores[0];

          if (currentStore) {
            console.log('Selected store:', { id: currentStore.id, name: currentStore.name });
            // Don't update Zustand store here to avoid infinite loop
            // useStore.getState().setCurrentStore(currentStore);
          }
        }

        if (!currentStore?.id) {
          console.error('No valid store found');
          setError('No store selected. Please select a store to view dashboard data.');
          setLoading(false);
          return;
        }

        console.log('Using store for API calls:', { id: currentStore.id, name: currentStore.name });
        // Convert Store to StoreData format
        const storeData: StoreData = {
          id: currentStore.id,
          name: currentStore.name,
          marketplace: currentStore.marketplace,
          currency: currentStore.currency_symbol,
          timezone: currentStore.timezone,
          business_type: currentStore.business_type,
          is_active: currentStore.is_active,
          settings: {
            default_language: 'en-US',
            tax_settings: {},
            shipping_settings: {}
          },
          created_at: currentStore.created_at,
          updated_at: currentStore.updated_at
        };
        setCurrentStore(storeData);

        // Load dashboard data from backend API using unified API config
        const [snapshotResponse, productsResponse, actionsResponse, communicationsResponse] = await Promise.all([
          apiGet(API_CONFIG.ENDPOINTS.DASHBOARD.SNAPSHOT(currentStore.id)),
          apiGet(API_CONFIG.ENDPOINTS.PRODUCTS.BY_STORE(currentStore.id) + '&limit=10'),
          apiGet(API_CONFIG.ENDPOINTS.DASHBOARD.ACTIONS(currentStore.id)),
          apiGet(API_CONFIG.ENDPOINTS.COMMUNICATIONS.BY_STORE(currentStore.id))
        ]);

        // Extract data from API responses
        const snapshot = snapshotResponse.data;
        const products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
        const actions = Array.isArray(actionsResponse.data) ? actionsResponse.data : [];
        const communications = Array.isArray(communicationsResponse.data) ? communicationsResponse.data : [];

        // Transform data to match expected format
        const dashboardData: DashboardData = {
          salesToday: snapshot?.sales_amount || 0,
          openOrders: snapshot?.open_orders || 0,
          messages: snapshot?.buyer_messages || 0,
          featuredOfferPercent: snapshot?.featured_offer_percent || 100,
          sellerFeedbackRating: snapshot?.seller_feedback_rating || 5.0,
          sellerFeedbackCount: snapshot?.seller_feedback_count || 0,
          paymentsBalance: snapshot?.payments_balance || 0,
          fbmUnshipped: snapshot?.fbm_unshipped || 0,
          fbmPending: snapshot?.fbm_pending || 0,
          fbaPending: snapshot?.fba_pending || 0,
          inventoryPerformanceIndex: snapshot?.inventory_performance_index || 400,
          adSales: snapshot?.ad_sales || 0,
          adImpressions: snapshot?.ad_impressions || 0,
          salesHistory: [], // Will be populated from sales API if needed
          inventory: products,
          actions: actions,
          communications: communications,
          orders: [],
          salesSnapshot: {
            totalOrderItems: snapshot?.open_orders || 0,
            unitsOrdered: 0,
            orderedProductSales: snapshot?.sales_amount || 0,
            avgUnitsOrderItem: 0,
            avgSalesOrderItem: 0
          }
        };

        setDashboardData(dashboardData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please check if the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [session.marketplace, session.selectedStoreId]); // Re-load when store changes

  // Get currency symbol from current store or fallback to marketplace configs
  const marketplaceConfigs = {
    'United States': '$',
    'Japan': '¥',
    'United Kingdom': '£',
    'Germany': '€',
    'Europe': '€'
  };

  const currencySymbol = currentStore?.currency || getCurrencySymbol() || marketplaceConfigs[session.marketplace] || '$';

  // Use dashboard data from API or fallback to mock data
  const products = dashboardData?.inventory?.length > 0
    ? dashboardData.inventory.map(p => ({
      id: parseInt(p.id) || Math.random(),
      title: p.title || 'Unknown Product',
      sku: `SKU: ${p.sku || 'N/A'}`,
      asin: `ASIN: ${p.asin || 'N/A'}`,
      listingStatus: p.status as 'Active' | 'Inactive' || 'Active',
      sales: `${currencySymbol}${p.sales_amount || 0}`,
      unitsSold: p.units_sold || 0,
      pageViews: Math.floor(Math.random() * 500), // Generate random page views since it's not in Product interface
      inventory: `${p.inventory || 0} ${t('availableQuantity')}`,
      price: `${currencySymbol}${p.price || 0}`,
      img: p.image_url || "https://m.media-amazon.com/images/I/71tJkM8vDVL._AC_UY218_.jpg",
    }))
    : MOCK_PRODUCTS.map(p => ({
      ...p,
      sales: p.sales.replace('$', currencySymbol),
      price: p.price.replace('$', currencySymbol),
      inventory: `${p.inventory} ${t('availableQuantity')}`
    }));

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const statusOk = statusFilter === t('all') ? true : p.listingStatus === statusFilter || p.status === statusFilter;
      const q = query.trim().toLowerCase();
      const queryOk = !q ? true : (
        (p.title || p.name || '').toLowerCase().includes(q) ||
        (p.asin || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      );
      return statusOk && queryOk;
    });
  }, [products, statusFilter, query, t]);

  // Current page products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amazon-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white border rounded-sm shadow-sm min-h-[400px]">
        <h1 className="text-2xl font-black text-amazon-text mb-4">{t('dashboardError')}</h1>
        <p className="text-amazon-error">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-amazon-teal text-white rounded hover:bg-amazon-headerTeal"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen pb-8">
      {/* Top Welcome Row */}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="text-[16px] font-normal text-[#0F1111] leading-[24px]">{t('goodEvening')}</span>
            <span className="ml-2 bg-[#E6F0CE] text-[#507F00] px-2 py-0.5 rounded-full text-[12px] font-semibold">{t('healthy')}</span>
            <ChevronRight size={12} className="ml-1 text-[#507F00] align-baseline" />
          </div>
          <div className="inline-flex gap-2">
            <button className="h-7 px-3 text-[12px] font-medium text-[#007185] bg-white border border-[#D5DBDB] rounded-[3px] hover:bg-[#F7F8F8] transition-colors">
              {t('launchTour')}
            </button>
            <button className="h-7 px-3 text-[12px] font-medium text-[#007185] bg-white border border-[#D5DBDB] rounded-[3px] hover:bg-[#F7F8F8] transition-colors">
              {t('learnMore')}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== Main (2 columns) ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[264px_1fr] gap-4">
        {/* ========== LEFT COLUMN (264px) ========== */}
        <div className="flex flex-col gap-4">
          {/* Actions Card */}
          <ActionsCard actions={dashboardData?.actions} />

          {/* Communications Card */}
          <CommunicationsCard communications={dashboardData?.communications} />
        </div>

        {/* ========== RIGHT COLUMN (Remaining Width) ========== */}
        <div className="flex flex-col gap-4">
          {/* ==================== Global Snapshot ==================== */}
          <div className="bg-white border border-[#E3E6E6] rounded-md shadow-none overflow-hidden">
            {/* Title Bar */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-[#E3E6E6]">
              <h3 className="text-[16px] font-semibold text-amazon-headerTeal">{t('globalSnapshotTitle')}</h3>
              <div className="flex items-center gap-1">
                {/* Maximize Icon (Custom to match image 3) */}
                <button className="w-[28px] h-[28px] flex items-center justify-center text-[#565959] hover:bg-[#F0F2F2] transition-colors rounded-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M8 8l2 2m0 0l2-2m-2 2V6m0 4h4" className="hidden" />
                    <path d="M15 15l-2-2m0 0l-2 2m2-2v4m0-4h-4" className="hidden" />
                    {/* Inward corner marks */}
                    <path d="M7 7l3 3M7 17l3-3M17 7l-3 3M17 17l-3-3" />
                  </svg>
                </button>
                {/* Sliders Icon */}
                <button className="w-[28px] h-[28px] flex items-center justify-center text-[#565959] hover:bg-[#F0F2F2] transition-colors rounded-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="2" y1="14" x2="6" y2="14" />
                    <line x1="10" y1="8" x2="14" y2="8" />
                    <line x1="18" y1="16" x2="22" y2="16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 6-Column Grid System */}
            <div className="grid grid-cols-1 lg:grid-cols-6">
              {/* --- Column 1: Sales --- */}
              <div className="lg:border-r border-[#E3E6E6] flex flex-col h-[180px]">
                <div className="px-3 py-1.5 text-[12px] font-semibold text-amazon-headerTeal flex justify-between items-center whitespace-nowrap">
                  {t('salesColumn')} <ChevronDown size={11} className="text-[#888C8C]" />
                </div>
                <div className="px-3 pt-1 pb-4 flex-grow">
                  <div className="text-[16px] font-semibold text-amazon-headerTeal mb-0.5">{formatCurrency(dashboardData?.salesToday || 0)}</div>
                  <div className="text-[11px] text-[#565959]">{t('todaySoFar')}</div>
                  <div className="mt-2">
                    <TinySparkline strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* --- Column 2: Open Orders --- */}
              <div className="lg:border-r border-[#E3E6E6] flex flex-col h-[180px]">
                <div className="px-3 py-1.5 text-[12px] font-semibold text-amazon-headerTeal flex justify-between items-center whitespace-nowrap">
                  {t('openOrdersColumn')} <ChevronDown size={11} className="text-[#888C8C]" />
                </div>
                <div className="px-3 pt-1 h-[60px]">
                  <div className="text-[16px] font-semibold text-amazon-headerTeal mb-0.5">{dashboardData?.openOrders || 0}</div>
                  <div className="text-[11px] text-[#565959]">{t('totalCount')}</div>
                </div>

                <div className="mt-auto flex flex-col h-[95px]">
                  <div className="border-t border-[#E3E6E6] w-full" />
                  <div className="flex-grow flex flex-col justify-center px-3 pb-1">
                    <div className="group space-y-1 text-[12px]">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[#565959]">{t('fbmUnshipped')}</span>
                        <span className="text-amazon-headerTeal font-medium">{dashboardData?.fbmUnshipped || 0}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[#565959]">{t('fbmPending')}</span>
                        <span className="text-amazon-headerTeal font-medium">{dashboardData?.fbmPending || 0}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[#565959]">{t('fbaPending')}</span>
                        <span className="text-amazon-headerTeal font-medium">{dashboardData?.fbaPending || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Column 3: Buyer Messages --- */}
              <div className="lg:border-r border-[#E3E6E6] flex flex-col h-[180px]">
                <div className="px-3 py-1.5 text-[12px] font-semibold text-amazon-headerTeal flex justify-between items-center whitespace-nowrap">
                  {t('buyerMessagesColumn')} <ChevronDown size={11} className="text-[#888C8C]" />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="px-3 pt-1 h-[60px]">
                    <div className="text-[16px] font-semibold text-amazon-headerTeal mb-0.5">{dashboardData?.messages || 0}</div>
                    <div className="text-[11px] text-[#565959]">{t('casesRequiringAttention')}</div>
                  </div>
                  <div className="mt-auto flex flex-col h-[95px]">
                    <div className="border-t border-[#E3E6E6] w-full" />
                    <div className="flex-grow flex flex-col justify-center px-3 pb-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[12px] text-amazon-headerTeal">{t('inventoryPerformanceIndex')}</div>
                        <ChevronDown size={11} className="text-[#888C8C]" />
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-bold text-amazon-headerTeal">{dashboardData?.inventoryPerformanceIndex || 400}</div>
                        <div className="text-[11px] text-[#565959]">{t('current')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Column 4: Featured Offer % --- */}
              <div className="lg:border-r border-[#E3E6E6] flex flex-col h-[180px]">
                <div className="px-3 py-1.5 text-[12px] font-semibold text-amazon-headerTeal flex justify-between items-center whitespace-nowrap">
                  {t('featuredOfferColumn')} <ChevronDown size={11} className="text-[#888C8C]" />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="px-3 pt-1 h-[60px]">
                    <div className="text-[16px] font-semibold text-amazon-headerTeal mb-0.5">{dashboardData?.featuredOfferPercent || 100}%</div>
                    <div className="text-[11px] text-[#565959]">2 {t('daysAgo')}</div>
                  </div>
                  <div className="mt-auto flex flex-col h-[95px]">
                    <div className="border-t border-[#E3E6E6] w-full" />
                    <div className="flex-grow flex flex-col justify-center px-3 pb-1">
                      <div className="text-[12px] text-amazon-headerTeal mb-0.5">{t('globalPromotionsSales')}</div>
                      <div className="text-[11px] text-[#565959] mb-0.5">{t('noDataAvailable')}</div>
                      <a href="#" className="text-[11px] text-amazon-headerTeal hover:underline">{t('learnMore')}</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Column 5: Seller Feedback --- */}
              <div className="lg:border-r border-[#E3E6E6] flex flex-col h-[180px]">
                <div className="px-3 py-1.5 text-[12px] font-semibold text-amazon-headerTeal flex justify-between items-center whitespace-nowrap">
                  {t('sellerFeedbackColumn')} <ChevronDown size={11} className="text-[#888C8C]" />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="px-3 pt-1 h-[60px]">
                    <div className="flex items-center mb-0.5">
                      <StarRating rating={dashboardData?.sellerFeedbackRating || 5.0} />
                    </div>
                    <div className="text-[11px] text-[#565959] opacity-80">{t('pastYear')} ({dashboardData?.sellerFeedbackCount || 0})</div>
                  </div>
                  <div className="mt-auto flex flex-col h-[95px]">
                    <div className="border-t border-[#E3E6E6] w-full" />
                    <div className="flex-grow flex flex-col justify-center px-3 pb-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[12px] font-semibold text-amazon-headerTeal">{t('adSales')}</div>
                        <ChevronDown size={11} className="text-[#888C8C]" />
                      </div>
                      <div className="text-[16px] font-semibold text-amazon-headerTeal mb-0.5">{formatCurrency(dashboardData?.adSales || 0)}</div>
                      <div className="text-[11px] text-[#565959]">{t('todaySoFar')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Column 6: Payments --- */}
              <div className="flex flex-col h-[180px]">
                <div className="px-3 py-1.5 text-[12px] font-semibold text-amazon-headerTeal flex justify-between items-center whitespace-nowrap">
                  {t('paymentsColumn')} <ChevronDown size={11} className="text-[#888C8C]" />
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="px-3 pt-1 h-[60px]">
                    <div className="text-[16px] font-semibold text-amazon-headerTeal mb-0.5">{currencySymbol}{(dashboardData?.paymentsBalance || 0).toFixed(2)}</div>
                    <div className="text-[11px] text-[#565959]">{t('totalBalance')}</div>
                  </div>
                  <div className="mt-auto flex flex-col h-[95px]">
                    <div className="border-t border-[#E3E6E6] w-full" />
                    <div className="flex-grow flex flex-col justify-center px-3 pb-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[12px] font-semibold text-amazon-headerTeal">{t('adImpressions')}</div>
                        <ChevronDown size={11} className="text-[#888C8C]" />
                      </div>
                      <div className="text-[16px] font-semibold text-amazon-headerTeal mb-0.5">{dashboardData?.adImpressions || 0}</div>
                      <div className="text-[11px] text-[#565959]">{t('todaySoFar')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== Product Performance Table ==================== */}
          <div className="bg-white border border-[#E3E6E6] rounded-md shadow-none overflow-hidden">
            {/* Header with controls (Matching image 4) */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#E3E6E6]">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[16px] font-semibold text-amazon-headerTeal">{t('productPerformance')}</h3>
                  <div className="w-4 h-4 rounded-full border border-[#565959] flex items-center justify-center cursor-help">
                    <span className="text-[10px] text-[#565959] font-bold">i</span>
                  </div>
                </div>
                <div className="text-[12px] text-[#565959] mt-0.5">{t('last30Days')}</div>
              </div>

              <div className="flex items-center gap-2">
                {/* Filters */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-[31px] px-2 text-[13px] border border-[#D5D9D9] rounded-none bg-white hover:bg-[#F7F8F8] focus:ring-1 focus:ring-amazon-teal outline-none transition-colors"
                  >
                    <option value={t('active')}>{t('active')}</option>
                    <option value={t('inactive')}>{t('inactive')}</option>
                    <option value={t('all')}>{t('all')}</option>
                  </select>
                  <select
                    value={interactionFilter}
                    onChange={(e) => setInteractionFilter(e.target.value)}
                    className="h-[31px] px-2 text-[13px] border border-[#D5D9D9] rounded-none bg-white hover:bg-[#F7F8F8] focus:ring-1 focus:ring-amazon-teal outline-none transition-colors"
                  >
                    <option>Frequently interacted</option>
                    <option>Recently added</option>
                    <option>All products</option>
                  </select>
                </div>

                {/* Search */}
                <div className="flex h-[31px] items-center ml-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-[180px] h-full px-3 text-[13px] border border-[#D5D9D9] border-r-0 rounded-none bg-white outline-none focus:ring-1 focus:ring-amazon-teal z-10"
                  />
                  <button className="h-[31px] w-[31px] flex items-center justify-center bg-amazon-headerTeal text-white border border-amazon-headerTeal hover:bg-[#00242a] transition-colors">
                    <Search size={16} />
                  </button>
                </div>

                {/* Vertical Menu & Collapse */}
                <div className="flex items-center ml-2 border-l border-[#D5D9D9] pl-2 gap-1">
                  <button className="p-1 text-[#565959] hover:bg-[#F0F2F2] rounded transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                  <button className="p-1 text-[#565959] hover:bg-[#F0F2F2] rounded transition-colors">
                    <ChevronDown size={20} className="rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Header (Matching user feedback) */}
            <div className="bg-[#F7F8F8] border-b border-[#E3E6E6]">
              <div className="grid grid-cols-[1fr_110px_90px_90px_110px_90px_90px_1fr] text-[12px] font-medium text-[#565959]">
                {[
                  t('productDetails'),
                  t('listingStatus'),
                  t('salesColumn'),
                  t('unitsSold'),
                  t('pageViews'),
                  t('inventoryColumn'),
                  t('price'),
                  t('actionsColumn')
                ].map((label, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "px-3 py-2 flex items-center group hover:bg-[#F0F2F2]",
                      idx === 0 ? "px-4 justify-between" : "justify-between",
                      idx === 7 && "justify-end pr-4"
                    )}
                  >
                    <span className="truncate">{label}</span>
                    {idx < 7 && (
                      <div className="flex flex-col scale-75 opacity-40 group-hover:opacity-100">
                        <ChevronDown size={10} className="rotate-180 -mb-1" />
                        <ChevronDown size={10} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Table Content */}
            <div className="divide-y divide-[#E3E6E6]">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[1fr_110px_90px_90px_110px_90px_90px_1fr] hover:bg-[#F7F8F8] transition-colors border-b border-[#E3E6E6] last:border-b-0"
                >
                  <div className="px-4 py-2 flex gap-2 items-center overflow-hidden">
                    <Star
                      size={16}
                      onClick={() => toggleStar(product.id)}
                      className={cn(
                        "flex-shrink-0 cursor-pointer transition-colors",
                        starredIds.has(product.id)
                          ? "fill-[#FFA41C] text-[#FFA41C]"
                          : "text-[#FFA41C]"
                      )}
                    />
                    <img src={product.img} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-[13px] text-[#007185] font-semibold truncate hover:underline cursor-pointer leading-[16px]">{product.title}</div>
                      <div className="text-[11px] text-[#565959] mt-0.5 font-semibold leading-[14px]">{product.asin}</div>
                      <div className="text-[11px] font-semibold leading-[14px]">
                        <span className="text-[#565959]">SKU: </span>
                        <span className="text-[#007185]">{product.sku.replace('SKU: ', '')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2 flex items-center overflow-hidden">
                    <span className="text-[12px] text-[#0F1111] truncate">
                      {product.listingStatus}
                    </span>
                  </div>
                  <div className="px-3 py-2 flex items-center font-normal text-[#0F1111] text-[13px] overflow-hidden">
                    <span className="truncate">{product.sales}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center text-[13px] text-[#0F1111] overflow-hidden">
                    <span className="truncate">{formatNumber(product.unitsSold)}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center text-[13px] text-[#0F1111] overflow-hidden">
                    <span className="truncate">{product.pageViews > 0 ? formatNumber(product.pageViews) : "--"}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center text-[12px] text-[#565959] overflow-hidden">
                    <span className="truncate">{product.inventory}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center text-[13px] text-[#007185] overflow-hidden">
                    <div className="flex flex-col">
                      <span className="truncate">{product.price}</span>
                      {(product.id === 1 || product.id === 4) && (
                        <span className="text-[11px] text-[#B12704] mt-1">{t('improveListingQuality')}</span>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-end overflow-hidden pr-4">
                    <button className="h-[29px] w-[29px] flex items-center justify-center bg-white border border-[#D5DBDB] rounded-[3px] shadow-sm hover:bg-[#F7F8F8] text-[#007185] flex-shrink-0">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination / Footer (Centered) */}
            <div className="px-4 py-2 border-t border-[#E3E6E6] bg-[#F8F8F8] flex items-center relative min-h-[48px]">
              <div className="text-[12px] text-[#565959] absolute left-4">
                {t('showItems', {
                  from: filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
                  to: Math.min(currentPage * itemsPerPage, filteredProducts.length),
                  total: filteredProducts.length
                })}
              </div>
              <div className="flex items-center gap-1 mx-auto">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-[#007185] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={14} className="rotate-90" />
                </button>
                <div className="flex items-center gap-2 px-2 text-[13px]">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "hover:underline",
                        currentPage === i + 1 ? "font-bold text-[#565959]" : "text-[#007185]"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 text-[#007185] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={14} className="-rotate-90" />
                </button>
              </div>
              <button 
                onClick={() => navigate('/app/inventory')}
                className="absolute right-4 px-3 py-1 text-[12px] font-medium text-[#007185] bg-white border border-[#D5D9D9] rounded-[3px] hover:bg-gray-50 transition-all"
              >
                {t('goToManageInventory')}
              </button>
            </div>
          </div>

          {/* ==================== Recommendations (New) ==================== */}
          <div className="bg-white border border-[#E3E6E6] rounded-md shadow-none overflow-hidden pb-4">
            <div className="flex justify-between items-center px-4 py-2 border-b border-[#E3E6E6] bg-[#F7F8F8]">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-amazon-headerTeal">Recommendations</h3>
                <div className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#AAB7B8] text-[9px] text-[#6F7373] font-bold italic leading-none">i</div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-[28px] h-[28px] flex items-center justify-center text-[#565959] hover:bg-[#F0F2F2] transition-colors rounded-sm">
                  <MoreHorizontal size={18} />
                </button>
                <button className="w-[28px] h-[28px] flex items-center justify-center text-[#565959] hover:bg-[#F0F2F2] transition-colors rounded-sm">
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>
            <div className="p-8 text-center text-[#565959] text-[13px] bg-white">
              No recommendations available at this time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}