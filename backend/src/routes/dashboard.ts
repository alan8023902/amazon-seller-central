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
    open_orders: globalSnapshot.orders?.totalCount || 0,
    buyer_messages: globalSnapshot.messages?.casesRequiringAttention || 0,
    featured_offer_percent: globalSnapshot.featuredOffer?.percentage || 100,
    seller_feedback_rating: globalSnapshot.feedback?.rating || 5.0,
    seller_feedback_count: globalSnapshot.feedback?.count || 0,
    payments_balance: globalSnapshot.payments?.totalBalance || 0,
    fbm_unshipped: globalSnapshot.orders?.fbmUnshipped || 0,
    fbm_pending: globalSnapshot.orders?.fbmPending || 0,
    fba_pending: globalSnapshot.orders?.fbaPending || 0,
    inventory_performance_index: globalSnapshot.inventory?.performanceIndex || 400,
    ad_sales: globalSnapshot.ads?.sales || 0,
    ad_impressions: globalSnapshot.ads?.impressions || 0,
    updated_at: new Date().toISOString(),
  };
  
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
  
  const response: ApiResponse<GlobalSnapshot> = {
    success: true,
    data: snapshot,
    message: 'Dashboard configuration updated successfully',
  };
  
  res.json(response);
}));

export = router;