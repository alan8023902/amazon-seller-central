"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const index_1 = require("../types/index");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/snapshot/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    let snapshots = await dataService_1.dataService.findByStoreId('global_snapshots', storeId);
    let snapshot = snapshots[0];
    if (!snapshot) {
        snapshot = await dataService_1.dataService.create('global_snapshots', {
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
    const response = {
        success: true,
        data: snapshot,
    };
    res.json(response);
}));
router.put('/snapshot/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const updateData = index_1.GlobalSnapshotSchema.partial().parse({
        ...req.body,
        updated_at: new Date().toISOString(),
    });
    let snapshots = await dataService_1.dataService.findByStoreId('global_snapshots', storeId);
    let snapshot = snapshots[0];
    if (!snapshot) {
        snapshot = await dataService_1.dataService.create('global_snapshots', {
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
    }
    else {
        const updatedSnapshot = await dataService_1.dataService.update('global_snapshots', snapshot.id, updateData);
        if (!updatedSnapshot) {
            throw (0, errorHandler_1.createError)('Failed to update snapshot', 500);
        }
        snapshot = updatedSnapshot;
    }
    if (!snapshot) {
        throw (0, errorHandler_1.createError)('Failed to update snapshot', 500);
    }
    const response = {
        success: true,
        data: snapshot,
        message: 'Snapshot updated successfully',
    };
    res.json(response);
}));
router.get('/products/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { limit = 5 } = req.query;
    let products = await dataService_1.dataService.findByStoreId('products', storeId);
    products = products
        .sort((a, b) => b.sales_amount - a.sales_amount)
        .slice(0, Number(limit));
    const response = {
        success: true,
        data: products,
    };
    res.json(response);
}));
router.get('/actions/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const actions = [
        { id: "shipmentPerformance", count: null, text: "Review shipment performance" },
        { id: "shipOrders", count: 10, text: "Ship orders" },
        { id: "reviewReturns", count: 2, text: "Review returns" },
        { id: "fixStrandedInventory", count: null, text: "Fix stranded inventory" },
    ];
    const response = {
        success: true,
        data: actions,
    };
    res.json(response);
}));
router.get('/communications/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    let forumPosts = await dataService_1.dataService.findByStoreId('forum_posts', storeId);
    if (forumPosts.length === 0) {
        const defaultPosts = [
            {
                store_id: storeId,
                title: "New seller performance standards",
                post_date: new Date().toISOString().split('T')[0],
                views: 1234,
                comments: 56,
                post_type: 'FORUM',
                likes: 0,
            },
            {
                store_id: storeId,
                title: "Holiday selling tips and best practices",
                post_date: new Date().toISOString().split('T')[0],
                views: 987,
                comments: 23,
                post_type: 'NEWS',
                likes: 45,
            },
        ];
        for (const post of defaultPosts) {
            await dataService_1.dataService.create('forum_posts', post);
        }
        forumPosts = await dataService_1.dataService.findByStoreId('forum_posts', storeId);
    }
    const response = {
        success: true,
        data: forumPosts,
    };
    res.json(response);
}));
router.get('/health/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const healthData = {
        status: 'Healthy',
        score: 1000,
        criticalIssues: 0,
        recommendations: [
            'Continue maintaining excellent performance',
            'Monitor inventory levels regularly',
        ],
    };
    const response = {
        success: true,
        data: healthData,
    };
    res.json(response);
}));
router.get('/config/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const stores = await dataService_1.dataService.readData('stores');
    const store = stores.find((s) => s.id === storeId);
    if (!store) {
        throw (0, errorHandler_1.createError)('Store not found', 404);
    }
    let snapshots = await dataService_1.dataService.findByStoreId('global_snapshots', storeId);
    let snapshot = snapshots[0];
    if (!snapshot) {
        snapshot = await dataService_1.dataService.create('global_snapshots', {
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
            daysAgo: 2
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
    const response = {
        success: true,
        data: configData,
    };
    res.json(response);
}));
router.put('/config/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { globalSnapshot, welcomeBanner } = req.body;
    if (!globalSnapshot) {
        throw (0, errorHandler_1.createError)('Global snapshot data is required', 400);
    }
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
    const updateData = index_1.GlobalSnapshotSchema.partial().parse(backendData);
    let snapshots = await dataService_1.dataService.findByStoreId('global_snapshots', storeId);
    let snapshot = snapshots[0];
    if (!snapshot) {
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
        snapshot = await dataService_1.dataService.create('global_snapshots', {
            ...defaultSnapshot,
            ...updateData,
        });
    }
    else {
        const updatedSnapshot = await dataService_1.dataService.update('global_snapshots', snapshot.id, updateData);
        if (!updatedSnapshot) {
            throw (0, errorHandler_1.createError)('Failed to update snapshot', 500);
        }
        snapshot = updatedSnapshot;
    }
    const response = {
        success: true,
        data: snapshot,
        message: 'Dashboard configuration updated successfully',
    };
    res.json(response);
}));
module.exports = router;
