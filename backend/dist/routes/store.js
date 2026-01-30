"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const index_1 = require("../types/index");
const errorHandler_1 = require("../middleware/errorHandler");
const storeValidation_1 = require("../middleware/storeValidation");
const router = express_1.default.Router();
async function cascadeDeleteStoreData(storeId, storeName) {
    console.log(`🗑️ Starting cascade deletion for store: ${storeName} (${storeId})`);
    const deletionTasks = [
        { name: 'products', description: 'products' },
        { name: 'global_snapshots', description: 'global snapshots' },
        { name: 'sales_snapshots', description: 'sales snapshots' },
        { name: 'daily_sales', description: 'daily sales records' },
        { name: 'forum_posts', description: 'forum posts' },
        { name: 'account_health', description: 'account health records' },
        { name: 'legal_entity', description: 'legal entity information' },
        { name: 'voc_data', description: 'voice of customer data' },
    ];
    let totalDeleted = 0;
    const deletionResults = {};
    for (const task of deletionTasks) {
        try {
            const records = await dataService_1.dataService.findByStoreId(task.name, storeId);
            if (records.length > 0) {
                let deletedCount = 0;
                for (const record of records) {
                    const success = await dataService_1.dataService.delete(task.name, record.id);
                    if (success) {
                        deletedCount++;
                    }
                }
                deletionResults[task.name] = deletedCount;
                totalDeleted += deletedCount;
                console.log(`✅ Deleted ${deletedCount}/${records.length} ${task.description} for store ${storeName}`);
            }
            else {
                deletionResults[task.name] = 0;
            }
        }
        catch (error) {
            console.warn(`⚠️ Warning: Could not delete ${task.description} for store ${storeName}:`, error);
            deletionResults[task.name] = 0;
        }
    }
    console.log(`📊 Deletion summary for store ${storeName}:`, deletionResults);
    return totalDeleted;
}
async function validateStoreDeletion(storeId) {
    try {
        const stores = await dataService_1.dataService.readData('stores');
        const activeStores = stores.filter(s => s.is_active && s.id !== storeId);
        if (activeStores.length === 0) {
            return {
                canDelete: false,
                reason: 'Cannot delete the last active store. At least one active store must remain.'
            };
        }
        return { canDelete: true };
    }
    catch (error) {
        console.error('Error validating store deletion:', error);
        return {
            canDelete: false,
            reason: 'Unable to validate store deletion constraints'
        };
    }
}
router.get('/marketplaces', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const marketplaces = [
        { id: 'United States', name: 'United States', currency: 'USD', symbol: '$' },
        { id: 'Japan', name: 'Japan', currency: 'JPY', symbol: '¥' },
        { id: 'United Kingdom', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
        { id: 'Germany', name: 'Germany', currency: 'EUR', symbol: '€' },
        { id: 'Europe', name: 'Europe', currency: 'EUR', symbol: '€' },
    ];
    const response = {
        success: true,
        data: marketplaces,
        message: 'Available marketplaces retrieved successfully'
    };
    res.json(response);
}));
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stores = await dataService_1.dataService.readData('stores');
    const response = {
        success: true,
        data: stores,
        message: `Retrieved ${stores.length} stores`
    };
    res.json(response);
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const storeData = index_1.CreateStoreRequestSchema.parse(req.body);
    const newStore = await dataService_1.dataService.create('stores', {
        ...storeData,
        country: storeData.country || 'United States',
        marketplace: storeData.marketplace || 'United States',
        currency_symbol: storeData.currency_symbol || '$',
        business_type: storeData.business_type || 'Business',
        timezone: storeData.timezone || 'UTC',
        vacation_mode: false,
        auto_pricing: false,
        inventory_alerts: true,
        order_notifications: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });
    const response = {
        success: true,
        data: newStore,
        message: 'Store created successfully',
    };
    res.status(201).json(response);
}));
router.get('/:id/summary', storeValidation_1.validateStoreAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const store = req.storeContext?.store;
    if (!store) {
        throw (0, errorHandler_1.createError)('Store not found', 404);
    }
    const [products, orders, sales] = await Promise.all([
        dataService_1.dataService.readData('products'),
        dataService_1.dataService.readData('orders'),
        dataService_1.dataService.readData('sales')
    ]);
    const summary = {
        store: {
            id: store.id,
            name: store.name,
            marketplace: store.country,
            currency_symbol: store.currency_symbol,
            is_active: store.is_active,
            created_at: store.created_at
        },
        statistics: {
            total_products: products.length,
            total_orders: orders.length,
            total_sales_records: sales.length,
            last_updated: new Date().toISOString()
        },
        health: {
            status: store.is_active ? 'active' : 'inactive',
            data_integrity: 'good',
            last_sync: new Date().toISOString()
        }
    };
    const response = {
        success: true,
        data: summary,
        message: 'Store summary retrieved successfully',
    };
    res.json(response);
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const stores = await dataService_1.dataService.readData('stores');
    const store = stores.find(s => s.id === id);
    if (!store) {
        throw (0, errorHandler_1.createError)('Store not found', 404);
    }
    const response = {
        success: true,
        data: store,
    };
    res.json(response);
}));
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = index_1.UpdateStoreRequestSchema.parse({
        ...req.body,
        updated_at: new Date().toISOString(),
    });
    const updatedStore = await dataService_1.dataService.update('stores', id, updateData);
    if (!updatedStore) {
        throw (0, errorHandler_1.createError)('Store not found', 404);
    }
    const response = {
        success: true,
        data: updatedStore,
        message: 'Store updated successfully',
    };
    res.json(response);
}));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const stores = await dataService_1.dataService.readData('stores');
    const store = stores.find(s => s.id === id);
    if (!store) {
        throw (0, errorHandler_1.createError)('Store not found', 404);
    }
    const validation = await validateStoreDeletion(id);
    if (!validation.canDelete) {
        throw (0, errorHandler_1.createError)(validation.reason || 'Store cannot be deleted', 400);
    }
    try {
        const totalDeleted = await cascadeDeleteStoreData(id, store.name);
        const deleted = await dataService_1.dataService.delete('stores', id);
        if (!deleted) {
            throw (0, errorHandler_1.createError)('Failed to delete store', 500);
        }
        console.log(`✅ Successfully deleted store ${store.name} and ${totalDeleted} related records`);
        const response = {
            success: true,
            data: null,
            message: `Store '${store.name}' and ${totalDeleted} related records deleted successfully`,
        };
        res.json(response);
    }
    catch (error) {
        console.error(`❌ Error during cascade deletion for store ${store.name}:`, error);
        throw (0, errorHandler_1.createError)('Failed to delete store and related data', 500);
    }
}));
router.get('/legacy', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stores = await dataService_1.dataService.readData('stores');
    let store = stores[0];
    if (!store) {
        store = await dataService_1.dataService.create('stores', {
            name: 'TYNBO Store',
            country: 'United States',
            marketplace: 'United States',
            currency_symbol: '$',
            business_type: 'Business',
            timezone: 'UTC',
            vacation_mode: false,
            auto_pricing: false,
            inventory_alerts: true,
            order_notifications: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    }
    const response = {
        success: true,
        data: store,
    };
    res.json(response);
}));
router.put('/legacy', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const stores = await dataService_1.dataService.readData('stores');
    let store = stores[0];
    if (!store) {
        throw (0, errorHandler_1.createError)('Store not found', 404);
    }
    const updateData = index_1.StoreSchema.partial().parse({
        ...req.body,
        updated_at: new Date().toISOString(),
    });
    const updatedStore = await dataService_1.dataService.update('stores', store.id, updateData);
    if (!updatedStore) {
        throw (0, errorHandler_1.createError)('Failed to update store', 500);
    }
    const response = {
        success: true,
        data: updatedStore,
        message: 'Store updated successfully',
    };
    res.json(response);
}));
module.exports = router;
