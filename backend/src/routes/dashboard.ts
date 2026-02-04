import express from 'express';
import { dataService } from '../services/dataService';
import { 
  GlobalSnapshotSchema, 
  type GlobalSnapshot, 
  type Product,
  type ForumPost,
  type ApiResponse,
  type Store
} from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

type HourlyPoint = { hour: number; units: number; sales: number };
type HourlySeries = { date: string; hours: HourlyPoint[] };
type SalesTimeSeriesRecord = {
  id?: string;
  store_id: string;
  updated_at?: string;
  day?: {
    today?: HourlySeries;
    [key: string]: any;
  };
  week?: any;
  month?: any;
  year?: any;
};

const toUtcDate = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const allocateTotals = (total: number, weights: number[]) => {
  if (total <= 0 || weights.length === 0) {
    return weights.map(() => 0);
  }

  const sumWeights = weights.reduce((sum, w) => sum + w, 0);
  const raw = weights.map(w => (w / sumWeights) * total);
  const floors = raw.map(value => Math.floor(value));
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);

  const fractions = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  let cursor = 0;
  while (remainder > 0 && fractions.length > 0) {
    floors[fractions[cursor].index] += 1;
    remainder -= 1;
    cursor = (cursor + 1) % fractions.length;
  }

  return floors;
};

const buildHourlyWeights = (rng: () => number) => {
  const weights: number[] = [];
  for (let i = 0; i < 24; i++) {
    const r1 = rng();
    const r2 = rng();
    const r3 = rng();
    const r4 = rng();
    const base = 0.05 + r1 * 2.5;
    const tail = Math.pow(r2, 2.2);
    const spread = 0.1 + tail * 18;
    const spike = r3 > 0.88 ? 6 + r3 * 8 : 1;
    const dip = r4 < 0.12 ? 0.12 : 1;
    const weight = base * spread * spike * dip;
    weights.push(Math.max(0.002, Math.min(40, weight)));
  }
  return weights;
};

const buildHourlySeries = (dateIso: string, totalUnits: number, totalSales: number, rng: () => number): HourlySeries => {
  const unitWeights = buildHourlyWeights(rng);
  const salesWeights = buildHourlyWeights(rng);
  const units = allocateTotals(Math.max(0, Math.round(totalUnits)), unitWeights);
  const sales = allocateTotals(Math.max(0, Math.round(totalSales)), salesWeights);

  return {
    date: dateIso,
    hours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      units: units[hour],
      sales: sales[hour],
    }))
  };
};

const upsertTodayHourlySeries = async (storeId: string, totalUnits: number, totalSales: number) => {
  const todayIso = formatDate(toUtcDate(new Date()));
  const seedBase = hashString(`${storeId}-${todayIso}-${totalUnits}-${totalSales}`);
  const rng = createRng(seedBase + 5);
  const todaySeries = buildHourlySeries(todayIso, totalUnits, totalSales, rng);

  const existing = await dataService.findByStoreId<SalesTimeSeriesRecord>('sales_time_series', storeId);
  const current = existing[0];
  const updated: SalesTimeSeriesRecord = {
    ...(current || { store_id: storeId }),
    store_id: storeId,
    updated_at: new Date().toISOString(),
    day: {
      ...(current?.day || {}),
      today: todaySeries,
    },
    week: current?.week || { startDate: '', endDate: '', current: [], lastWeek: [], lastYear: [] },
    month: current?.month || { startDate: '', endDate: '', current: [], lastMonth: [], lastYear: [] },
    year: current?.year || { startDate: '', endDate: '', days: [] },
  };

  if (current?.id) {
    await dataService.update<SalesTimeSeriesRecord>('sales_time_series', current.id, updated);
  } else {
    await dataService.create<SalesTimeSeriesRecord>('sales_time_series', updated);
  }
};

// GET /api/dashboard/snapshot/:storeId - Get global snapshot data
router.get('/snapshot/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  let snapshots = await dataService.findByStoreId<GlobalSnapshot>('global_snapshots', storeId);
  let snapshot = snapshots[0];
  
  // Create default snapshot if none exists
  if (!snapshot) {
    snapshot = await dataService.create<GlobalSnapshot>('global_snapshots', {
      store_id: storeId,
      sales_amount: 49.95,
      open_orders: 6,
      buyer_messages: 0,
      featured_offer_percent: 100,
      seller_feedback_rating: 5.00,
      seller_feedback_count: 2,
      payments_balance: 228.31,
      fbm_unshipped: 0,
      fbm_pending: 0,
      fba_pending: 6,
      inventory_performance_index: 400,
      ad_sales: 0,
      ad_impressions: 0,
      updated_at: new Date().toISOString(),
    });
  }
  
  const response: ApiResponse<GlobalSnapshot> = {
    success: true,
    data: snapshot,
  };
  
  res.json(response);
}));

// PUT /api/dashboard/snapshot/:storeId - Update global snapshot
router.put('/snapshot/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  const updateData = GlobalSnapshotSchema.partial().parse({
    ...req.body,
    updated_at: new Date().toISOString(),
  });
  
  let snapshots = await dataService.findByStoreId<GlobalSnapshot>('global_snapshots', storeId);
  let snapshot = snapshots[0];
  
  if (!snapshot) {
    // Create new snapshot with default values
    snapshot = await dataService.create<GlobalSnapshot>('global_snapshots', {
      store_id: storeId,
      sales_amount: updateData.sales_amount || 0,
      open_orders: updateData.open_orders || 0,
      buyer_messages: updateData.buyer_messages || 0,
      featured_offer_percent: updateData.featured_offer_percent || 100,
      seller_feedback_rating: updateData.seller_feedback_rating || 5.0,
      seller_feedback_count: updateData.seller_feedback_count || 0,
      payments_balance: updateData.payments_balance || 0,
      fbm_unshipped: updateData.fbm_unshipped || 0,
      fbm_pending: updateData.fbm_pending || 0,
      fba_pending: updateData.fba_pending || 0,
      inventory_performance_index: updateData.inventory_performance_index || 400,
      ad_sales: updateData.ad_sales || 0,
      ad_impressions: updateData.ad_impressions || 0,
      updated_at: new Date().toISOString(),
    });
  } else {
    // Update existing snapshot
    const updatedSnapshot = await dataService.update<GlobalSnapshot>('global_snapshots', snapshot.id, updateData);
    if (!updatedSnapshot) {
      throw createError('Failed to update snapshot', 500);
    }
    snapshot = updatedSnapshot;
  }
  
  if (!snapshot) {
    throw createError('Failed to update snapshot', 500);
  }
  
  const response: ApiResponse<GlobalSnapshot> = {
    success: true,
    data: snapshot,
    message: 'Snapshot updated successfully',
  };
  
  res.json(response);
}));

// GET /api/dashboard/products/:storeId - Get product performance data
router.get('/products/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { limit = 5 } = req.query;
  
  let products = await dataService.findByStoreId<Product>('products', storeId);
  
  // Sort by sales amount descending and limit results
  products = products
    .sort((a, b) => b.sales_amount - a.sales_amount)
    .slice(0, Number(limit));
  
  const response: ApiResponse<Product[]> = {
    success: true,
    data: products,
  };
  
  res.json(response);
}));

// GET /api/dashboard/actions/:storeId - Get action items
router.get('/actions/:storeId', asyncHandler(async (req, res) => {
  // Mock action items for now
  const actions = [
    { id: "shipmentPerformance", count: null, text: "Review shipment performance" },
    { id: "shipOrders", count: 10, text: "Ship orders" },
    { id: "reviewReturns", count: 2, text: "Review returns" },
    { id: "fixStrandedInventory", count: null, text: "Fix stranded inventory" },
  ];
  
  const response: ApiResponse = {
    success: true,
    data: actions,
  };
  
  res.json(response);
}));

// GET /api/dashboard/communications/:storeId - Get communication items
router.get('/communications/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  let forumPosts = await dataService.findByStoreId<ForumPost>('forum_posts', storeId);
  
  // Create default forum posts if none exist
  if (forumPosts.length === 0) {
    const defaultPosts = [
      {
        store_id: storeId,
        title: "New seller performance standards",
        post_date: new Date().toISOString().split('T')[0],
        views: 1234,
        comments: 56,
        post_type: 'FORUM' as const,
        likes: 0,
      },
      {
        store_id: storeId,
        title: "Holiday selling tips and best practices",
        post_date: new Date().toISOString().split('T')[0],
        views: 987,
        comments: 23,
        post_type: 'NEWS' as const,
        likes: 45,
      },
    ];
    
    for (const post of defaultPosts) {
      await dataService.create<ForumPost>('forum_posts', post);
    }
    
    forumPosts = await dataService.findByStoreId<ForumPost>('forum_posts', storeId);
  }
  
  const response: ApiResponse<ForumPost[]> = {
    success: true,
    data: forumPosts,
  };
  
  res.json(response);
}));

// GET /api/dashboard/health/:storeId - Get account health status
router.get('/health/:storeId', asyncHandler(async (req, res) => {
  // Mock health data for now
  const healthData = {
    status: 'Healthy',
    score: 1000,
    criticalIssues: 0,
    recommendations: [
      'Continue maintaining excellent performance',
      'Monitor inventory levels regularly',
    ],
  };
  
  const response: ApiResponse = {
    success: true,
    data: healthData,
  };
  
  res.json(response);
}));

// GET /api/dashboard/config/:storeId - Get dashboard configuration
router.get('/config/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  // Get store information first
  const stores = await dataService.readData('stores');
  const store = stores.find((s: any) => s.id === storeId) as Store;
  
  if (!store) {
    throw createError('Store not found', 404);
  }
  
  // Get dashboard configuration data
  let snapshots = await dataService.findByStoreId<GlobalSnapshot>('global_snapshots', storeId);
  let snapshot = snapshots[0];
  
  // Create default snapshot if none exists
  if (!snapshot) {
    snapshot = await dataService.create<GlobalSnapshot>('global_snapshots', {
      store_id: storeId,
      sales_amount: 49.95,
      open_orders: 6,
      buyer_messages: 0,
      featured_offer_percent: 100,
      seller_feedback_rating: 5.00,
      seller_feedback_count: 2,
      payments_balance: 228.31,
      fbm_unshipped: 0,
      fbm_pending: 0,
      fba_pending: 6,
      inventory_performance_index: 400,
      ad_sales: 0,
      ad_impressions: 0,
      updated_at: new Date().toISOString(),
    });
  }
  
  // Transform backend data to admin interface format
  const globalSnapshot = {
    sales: {
      todaySoFar: snapshot.sales_amount,
      currency: store.currency_symbol || 'US$'
    },
    orders: {
      totalCount: snapshot.open_orders,
      fbmUnshipped: snapshot.fbm_unshipped,
      fbmPending: snapshot.fbm_pending,
      fbaPending: snapshot.fba_pending
    },
    messages: {
      casesRequiringAttention: snapshot.buyer_messages
    },
    featuredOffer: {
      percentage: snapshot.featured_offer_percent,
      daysAgo: 2 // This could be calculated or stored separately
    },
    feedback: {
      rating: snapshot.seller_feedback_rating,
      count: snapshot.seller_feedback_count
    },
    payments: {
      totalBalance: snapshot.payments_balance,
      currency: store.currency_symbol || 'US$'
    },
    ads: {
      sales: snapshot.ad_sales,
      impressions: snapshot.ad_impressions,
      currency: store.currency_symbol || 'US$'
    },
    inventory: {
      performanceIndex: snapshot.inventory_performance_index
    }
  };
  
  const welcomeBanner = {
    greeting: 'Good evening',
    healthStatus: 'Healthy',
    healthColor: '#507F00',
    showTour: true,
    showLearnMore: true
  };
  
  const configData = {
    store: store,
    globalSnapshot: globalSnapshot,
    welcomeBanner: welcomeBanner,
    lastUpdated: snapshot.updated_at,
  };
  
  const response: ApiResponse = {
    success: true,
    data: configData,
  };
  
  res.json(response);
}));

// PUT /api/dashboard/config/:storeId - Update dashboard configuration
router.put('/config/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { globalSnapshot, welcomeBanner } = req.body;
  
  if (!globalSnapshot) {
    throw createError('Global snapshot data is required', 400);
  }
  
  // Transform admin interface data to backend format
  const backendData = {
    sales_amount: globalSnapshot.sales?.todaySoFar || 0,
    buyer_messages: globalSnapshot.messages?.casesRequiringAttention || 0,
    featured_offer_percent: globalSnapshot.featuredOffer?.percentage || 100,
    seller_feedback_rating: globalSnapshot.feedback?.rating || 5.0,
    seller_feedback_count: globalSnapshot.feedback?.count || 0,
    payments_balance: globalSnapshot.payments?.totalBalance || 0,
    open_orders: 0,
    fbm_unshipped: globalSnapshot.orders?.fbmUnshipped || 0,
    fbm_pending: globalSnapshot.orders?.fbmPending || 0,
    fba_pending: globalSnapshot.orders?.fbaPending || 0,
    inventory_performance_index: globalSnapshot.inventory?.performanceIndex || 400,
    ad_sales: globalSnapshot.ads?.sales || 0,
    ad_impressions: globalSnapshot.ads?.impressions || 0,
    updated_at: new Date().toISOString(),
  };

  const computedOpenOrders =
    (backendData.fbm_unshipped || 0) +
    (backendData.fbm_pending || 0) +
    (backendData.fba_pending || 0);
  backendData.open_orders = computedOpenOrders;
  
  const updateData = GlobalSnapshotSchema.partial().parse(backendData);
  
  let snapshots = await dataService.findByStoreId<GlobalSnapshot>('global_snapshots', storeId);
  let snapshot = snapshots[0];
  
  if (!snapshot) {
    // Create new snapshot with default values plus any provided updates
    const defaultSnapshot = {
      store_id: storeId,
      sales_amount: 0,
      open_orders: 0,
      buyer_messages: 0,
      featured_offer_percent: 100,
      seller_feedback_rating: 5.0,
      seller_feedback_count: 0,
      payments_balance: 0,
      fbm_unshipped: 0,
      fbm_pending: 0,
      fba_pending: 0,
      inventory_performance_index: 400,
      ad_sales: 0,
      ad_impressions: 0,
      updated_at: new Date().toISOString(),
    };
    
    snapshot = await dataService.create<GlobalSnapshot>('global_snapshots', {
      ...defaultSnapshot,
      ...updateData,
    });
  } else {
    // Update existing snapshot
    const updatedSnapshot = await dataService.update<GlobalSnapshot>('global_snapshots', snapshot.id, updateData);
    if (!updatedSnapshot) {
      throw createError('Failed to update snapshot', 500);
    }
    snapshot = updatedSnapshot;
  }
  
  try {
    const totalUnits = Number(globalSnapshot?.orders?.totalCount || 0);
    const totalSales = Number(globalSnapshot?.sales?.todaySoFar || 0);
    await upsertTodayHourlySeries(storeId, totalUnits, totalSales);
  } catch (error) {
    console.error('Failed to update today hourly sales series:', error);
  }

  const response: ApiResponse<GlobalSnapshot> = {
    success: true,
    data: snapshot,
    message: 'Dashboard configuration updated successfully',
  };
  
  res.json(response);
}));

export = router;
