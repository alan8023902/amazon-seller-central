// Store-specific API service with caching
import { API_CONFIG } from '../config/api';

// Simple in-memory cache
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new ApiCache();

export interface StoreData {
  id: string;
  name: string;
  marketplace: string;
  currency: string;
  timezone: string;
  business_type: string;
  is_active: boolean;
  settings: {
    default_language: string;
    tax_settings: Record<string, any>;
    shipping_settings: Record<string, any>;
  };
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  salesToday: number;
  openOrders: number;
  messages: number;
  featuredOfferPercent: number;
  sellerFeedbackRating: number;
  sellerFeedbackCount: number;
  paymentsBalance: number;
  fbmUnshipped: number;
  fbmPending: number;
  fbaPending: number;
  inventoryPerformanceIndex: number;
  adSales: number;
  adImpressions: number;
  salesHistory: Array<{
    time: string;
    today: number;
    lastYear: number;
  }>;
  inventory: Product[];
  actions: any[];
  communications: any[];
  orders: any[];
  salesSnapshot: {
    totalOrderItems: number;
    unitsOrdered: number;
    orderedProductSales: number;
    avgUnitsOrderItem: number;
    avgSalesOrderItem: number;
  };
}

export interface Product {
  id: string;
  store_id: string;
  title: string;
  sku: string;
  asin: string;
  price: number;
  inventory: number;
  status: 'Active' | 'Inactive';
  sales_amount: number;
  units_sold: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesSnapshot {
  store_id: string;
  total_order_items: number;
  units_ordered: number;
  ordered_product_sales: number;
  avg_units_per_order: number;
  avg_sales_per_order: number;
}

export interface DailySales {
  store_id: string;
  date: string;
  sales_amount: number;
  units_sold: number;
  orders_count: number;
}

class StoreApiService {
  // Get all stores with caching
  async getAllStores(): Promise<StoreData[]> {
    const cacheKey = 'stores:all';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/stores`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const stores = result.data || [];

      // Cache for 5 minutes
      apiCache.set(cacheKey, stores, 5 * 60 * 1000);
      return stores;
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      throw error;
    }
  }

  // Get all stores (alias for compatibility)
  async getStores(): Promise<StoreData[]> {
    return this.getAllStores();
  }

  // Create a new store
  async createStore(storeData: Omit<StoreData, 'id' | 'created_at' | 'updated_at'>): Promise<StoreData> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Invalidate stores cache
      apiCache.invalidate('stores:');

      return result.data;
    } catch (error) {
      console.error('Failed to create store:', error);
      throw error;
    }
  }

  // Update an existing store
  async updateStore(storeId: string, storeData: Partial<StoreData>): Promise<StoreData> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Invalidate related caches
      apiCache.invalidate('stores:');
      apiCache.invalidate(`store:${storeId}`);

      return result.data;
    } catch (error) {
      console.error('Failed to update store:', error);
      throw error;
    }
  }

  // Delete a store
  async deleteStore(storeId: string): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Invalidate related caches
      apiCache.invalidate('stores:');
      apiCache.invalidate(`store:${storeId}`);
      apiCache.invalidate(`dashboard:${storeId}`);
      apiCache.invalidate(`products:${storeId}`);
    } catch (error) {
      console.error('Failed to delete store:', error);
      throw error;
    }
  }

  // Get store by ID with caching
  async getStore(storeId: string): Promise<StoreData | null> {
    const cacheKey = `store:${storeId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/stores/${storeId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Cache for 5 minutes
      apiCache.set(cacheKey, result.data, 5 * 60 * 1000);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch store:', error);
      throw error;
    }
  }

  // Get store statistics
  async getStoreStatistics(storeId: string): Promise<any> {
    const cacheKey = `store:${storeId}:stats`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/stores/${storeId}/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Cache for 2 minutes (more frequent updates for stats)
      apiCache.set(cacheKey, result.data, 2 * 60 * 1000);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch store statistics:', error);
      throw error;
    }
  }

  // Get dashboard data for a specific store with caching
  async getDashboardData(storeId: string): Promise<DashboardData> {
    const cacheKey = `dashboard:${storeId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/dashboard/${storeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Cache for 1 minute (frequent updates for dashboard)
      apiCache.set(cacheKey, result.data, 1 * 60 * 1000);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  // Get products for a specific store with caching
  async getProducts(storeId: string, filters?: { status?: string; search?: string }): Promise<Product[]> {
    const filterKey = filters ? JSON.stringify(filters) : 'all';
    const cacheKey = `products:${storeId}:${filterKey}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({ store_id: storeId });
      if (filters?.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const products = result.data || [];

      // Cache for 2 minutes
      apiCache.set(cacheKey, products, 2 * 60 * 1000);
      return products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  // Get sales snapshot for a specific store with caching
  async getSalesSnapshot(storeId: string): Promise<SalesSnapshot | null> {
    const cacheKey = `sales:${storeId}:snapshot`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/sales/snapshot/${storeId}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Cache for 1 minute
      apiCache.set(cacheKey, result.data, 1 * 60 * 1000);
      return result.data;
    } catch (error) {
      console.error('Failed to fetch sales snapshot:', error);
      throw error;
    }
  }

  // Get daily sales data for a specific store with caching
  async getDailySales(storeId: string): Promise<DailySales[]> {
    const cacheKey = `sales:${storeId}:daily`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/sales/daily/${storeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const dailySales = result.data || [];

      // Cache for 5 minutes
      apiCache.set(cacheKey, dailySales, 5 * 60 * 1000);
      return dailySales;
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
      throw error;
    }
  }

  // Invalidate cache for a specific store
  invalidateStoreCache(storeId: string) {
    apiCache.invalidate(`store:${storeId}`);
    apiCache.invalidate(`dashboard:${storeId}`);
    apiCache.invalidate(`products:${storeId}`);
    apiCache.invalidate(`sales:${storeId}`);
  }

  // Clear all cache
  clearCache() {
    apiCache.invalidate();
  }

  // Get current store (first available store for now)
  async getCurrentStore(): Promise<StoreData | null> {
    try {
      const stores = await this.getStores();
      return stores.length > 0 ? stores[0] : null;
    } catch (error) {
      console.error('Failed to get current store:', error);
      return null;
    }
  }

  // Find store by name
  async findStoreByName(storeName: string): Promise<StoreData | null> {
    try {
      const stores = await this.getStores();
      return stores.find(store => store.name === storeName) || null;
    } catch (error) {
      console.error('Failed to find store by name:', error);
      return null;
    }
  }
}

export const storeApi = new StoreApiService();