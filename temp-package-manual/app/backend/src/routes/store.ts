import express, { Request, Response } from 'express';
import { dataService } from '../services/dataService';
import { StoreSchema, CreateStoreRequestSchema, UpdateStoreRequestSchema, type Store, type ApiResponse } from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateStoreAccess, optionalStoreValidation } from '../middleware/storeValidation';

const router = express.Router();

/**
 * Cascade delete all data related to a store
 * This ensures referential integrity when deleting stores
 */
async function cascadeDeleteStoreData(storeId: string, storeName: string): Promise<number> {
  console.log(`🗑️ Starting cascade deletion for store: ${storeName} (${storeId})`);
  
  // Define the order of deletion to maintain referential integrity
  const deletionTasks = [
    { name: 'products', description: 'products' },
    { name: 'global_snapshots', description: 'global snapshots' },
    { name: 'sales_snapshots', description: 'sales snapshots' },
    { name: 'daily_sales', description: 'daily sales records' },
    { name: 'forum_posts', description: 'forum posts' },
    { name: 'account_health', description: 'account health records' },
    { name: 'legal_entity', description: 'legal entity information' },
    { name: 'voc_data', description: 'voice of customer data' },
    // Add other store-related data types as needed
  ];
  
  let totalDeleted = 0;
  const deletionResults: { [key: string]: number } = {};
  
  for (const task of deletionTasks) {
    try {
      // Get all records for this store
      const records = await dataService.findByStoreId(task.name, storeId);
      
      if (records.length > 0) {
        // Delete each record
        let deletedCount = 0;
        for (const record of records) {
          const success = await dataService.delete(task.name, record.id);
          if (success) {
            deletedCount++;
          }
        }
        
        deletionResults[task.name] = deletedCount;
        totalDeleted += deletedCount;
        console.log(`✅ Deleted ${deletedCount}/${records.length} ${task.description} for store ${storeName}`);
      } else {
        deletionResults[task.name] = 0;
      }
    } catch (error) {
      console.warn(`⚠️ Warning: Could not delete ${task.description} for store ${storeName}:`, error);
      deletionResults[task.name] = 0;
      // Continue with other deletions even if one fails
    }
  }
  
  console.log(`📊 Deletion summary for store ${storeName}:`, deletionResults);
  return totalDeleted;
}

/**
 * Validate store deletion constraints
 * Check if store can be safely deleted
 */
async function validateStoreDeletion(storeId: string): Promise<{ canDelete: boolean; reason?: string }> {
  try {
    // Check if this is the last active store
    const stores = await dataService.readData<Store>('stores');
    const activeStores = stores.filter(s => s.is_active && s.id !== storeId);
    
    if (activeStores.length === 0) {
      return {
        canDelete: false,
        reason: 'Cannot delete the last active store. At least one active store must remain.'
      };
    }
    
    // Add other business rules as needed
    // For example: check if store has pending orders, active subscriptions, etc.
    
    return { canDelete: true };
  } catch (error) {
    console.error('Error validating store deletion:', error);
    return {
      canDelete: false,
      reason: 'Unable to validate store deletion constraints'
    };
  }
}

// GET /api/stores/marketplaces - Get available marketplaces (must be before /:id route)
router.get('/marketplaces', asyncHandler(async (req: Request, res: Response) => {
  const marketplaces = [
    { id: 'United States', name: 'United States', currency: 'USD', symbol: '$' },
    { id: 'Japan', name: 'Japan', currency: 'JPY', symbol: '¥' },
    { id: 'United Kingdom', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
    { id: 'Germany', name: 'Germany', currency: 'EUR', symbol: '€' },
    { id: 'Europe', name: 'Europe', currency: 'EUR', symbol: '€' },
  ];
  
  const response: ApiResponse<typeof marketplaces> = {
    success: true,
    data: marketplaces,
    message: 'Available marketplaces retrieved successfully'
  };
  
  res.json(response);
}));

// GET /api/stores - Get all stores
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const stores = await dataService.readData<Store>('stores');
  
  const response: ApiResponse<Store[]> = {
    success: true,
    data: stores,
    message: `Retrieved ${stores.length} stores`
  };
  
  res.json(response);
}));

// POST /api/stores - Create new store
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  // Validate request body using the new schema
  const storeData = CreateStoreRequestSchema.parse(req.body);
  
  // Create new store with all fields
  const newStore = await dataService.create<Store>('stores', {
    ...storeData,
    // Set defaults for optional fields
    country: storeData.country || 'United States',
    marketplace: storeData.marketplace || 'United States',
    currency_symbol: storeData.currency_symbol || '$',
    business_type: storeData.business_type || 'Business',
    timezone: storeData.timezone || 'UTC',
    // Initialize settings with defaults
    vacation_mode: false,
    auto_pricing: false,
    inventory_alerts: true,
    order_notifications: true,
    // Set status and timestamps
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  const response: ApiResponse<Store> = {
    success: true,
    data: newStore,
    message: 'Store created successfully',
  };
  
  res.status(201).json(response);
}));

// GET /api/stores/:id/summary - Get store statistics and summary (must be before /:id route)
router.get('/:id/summary', validateStoreAccess, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const store = req.storeContext?.store;
  
  if (!store) {
    throw createError('Store not found', 404);
  }
  
  // Get store-specific data counts
  // Note: These will be enhanced when we implement store-aware data filtering
  const [products, orders, sales] = await Promise.all([
    dataService.readData('products'),
    dataService.readData('orders'),
    dataService.readData('sales')
  ]);
  
  // For now, return total counts (will be filtered by store_id in future tasks)
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
      data_integrity: 'good', // Placeholder for future data validation
      last_sync: new Date().toISOString()
    }
  };
  
  const response: ApiResponse<typeof summary> = {
    success: true,
    data: summary,
    message: 'Store summary retrieved successfully',
  };
  
  res.json(response);
}));

// GET /api/stores/:id - Get specific store by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stores = await dataService.readData<Store>('stores');
  const store = stores.find(s => s.id === id);
  
  if (!store) {
    throw createError('Store not found', 404);
  }
  
  const response: ApiResponse<Store> = {
    success: true,
    data: store,
  };
  
  res.json(response);
}));

// PUT /api/stores/:id - Update specific store
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Validate request body using the new schema
  const updateData = UpdateStoreRequestSchema.parse({
    ...req.body,
    updated_at: new Date().toISOString(),
  });
  
  const updatedStore = await dataService.update<Store>('stores', id, updateData);
  
  if (!updatedStore) {
    throw createError('Store not found', 404);
  }
  
  const response: ApiResponse<Store> = {
    success: true,
    data: updatedStore,
    message: 'Store updated successfully',
  };
  
  res.json(response);
}));

// DELETE /api/stores/:id - Delete specific store
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Check if store exists
  const stores = await dataService.readData<Store>('stores');
  const store = stores.find(s => s.id === id);
  
  if (!store) {
    throw createError('Store not found', 404);
  }
  
  // Validate deletion constraints
  const validation = await validateStoreDeletion(id);
  if (!validation.canDelete) {
    throw createError(validation.reason || 'Store cannot be deleted', 400);
  }
  
  try {
    // Perform cascade deletion of all related data
    const totalDeleted = await cascadeDeleteStoreData(id, store.name);
    
    // Finally, delete the store itself
    const deleted = await dataService.delete('stores', id);
    
    if (!deleted) {
      throw createError('Failed to delete store', 500);
    }
    
    console.log(`✅ Successfully deleted store ${store.name} and ${totalDeleted} related records`);
    
    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: `Store '${store.name}' and ${totalDeleted} related records deleted successfully`,
    };
    
    res.json(response);
    
  } catch (error) {
    console.error(`❌ Error during cascade deletion for store ${store.name}:`, error);
    throw createError('Failed to delete store and related data', 500);
  }
}));

// Legacy endpoints for backward compatibility
// GET /api/store - Get first store (deprecated, use GET /api/stores)
router.get('/legacy', asyncHandler(async (req: Request, res: Response) => {
  const stores = await dataService.readData<Store>('stores');
  
  // For backward compatibility, return the first store or create a default one
  let store = stores[0];
  
  if (!store) {
    store = await dataService.create<Store>('stores', {
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
  
  const response: ApiResponse<Store> = {
    success: true,
    data: store,
  };
  
  res.json(response);
}));

// PUT /api/store - Update first store (deprecated, use PUT /api/stores/:id)
router.put('/legacy', asyncHandler(async (req: Request, res: Response) => {
  const stores = await dataService.readData<Store>('stores');
  let store = stores[0];
  
  if (!store) {
    throw createError('Store not found', 404);
  }
  
  // Validate request body
  const updateData = StoreSchema.partial().parse({
    ...req.body,
    updated_at: new Date().toISOString(),
  });
  
  const updatedStore = await dataService.update<Store>('stores', store.id, updateData);
  
  if (!updatedStore) {
    throw createError('Failed to update store', 500);
  }
  
  const response: ApiResponse<Store> = {
    success: true,
    data: updatedStore,
    message: 'Store updated successfully',
  };
  
  res.json(response);
}));

export = router;