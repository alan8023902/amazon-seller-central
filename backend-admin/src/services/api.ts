import axios from 'axios';
import { ADMIN_API_CONFIG, adminApiGet, adminApiPost, adminApiPut, adminApiDelete } from '../config/api';

// Create axios instance using unified config
export const api = axios.create({
  baseURL: `${ADMIN_API_CONFIG.BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('🚀 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Store API - using unified config
export const storeApi = {
  getStore: async () => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.STORES.LIST);
  },
  
  updateStore: async (data: any) => {
    return await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.STORES.UPDATE(data.id), data);
  },
  
  getMarketplaces: async () => {
    return await adminApiGet('/api/marketplaces');
  },
};

// Product API - using unified config
export const productApi = {
  getProducts: async (params?: any) => {
    // Filter out undefined values to prevent "undefined" strings in URL
    const cleanParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });
    }
    
    const queryString = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams).toString()}` : '';
    return await adminApiGet(`${ADMIN_API_CONFIG.ENDPOINTS.PRODUCTS.LIST}${queryString}`);
  },
  
  getProduct: async (id: string) => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.PRODUCTS.DETAIL(id));
  },
  
  createProduct: async (data: any) => {
    return await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, data);
  },
  
  updateProduct: async (id: string, data: any) => {
    return await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id), data);
  },
  
  deleteProduct: async (id: string) => {
    return await adminApiDelete(ADMIN_API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id));
  },
  
  uploadProductImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  bulkCreateProducts: async (products: any[]) => {
    return await adminApiPost('/api/products/bulk', { products });
  },
};

// Sales API - using unified config
export const salesApi = {
  getSalesSnapshot: async (storeId: string) => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.SALES.BY_STORE(storeId));
  },
  
  updateSalesSnapshot: async (storeId: string, data: any) => {
    return await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.SALES.UPDATE(storeId), data);
  },
  
  getDailySales: async (storeId: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await adminApiGet(`/api/sales/daily/${storeId}${queryString}`);
  },
  
  generateDailySales: async (storeId: string, data: any) => {
    return await adminApiPost(`/api/sales/generate-daily/${storeId}`, data);
  },
  
  getChartData: async (storeId: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await adminApiGet(`/api/sales/chart-data/${storeId}${queryString}`);
  },
};

// Dashboard API - using unified config
export const dashboardApi = {
  getSnapshot: async (storeId: string) => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.DASHBOARD.SNAPSHOT(storeId));
  },
  
  updateSnapshot: async (storeId: string, data: any) => {
    return await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.DASHBOARD.UPDATE_SNAPSHOT(storeId), data);
  },
  
  getConfig: async (storeId: string) => {
    return await adminApiGet(`/api/dashboard/config/${storeId}`);
  },
  
  updateConfig: async (storeId: string, data: any) => {
    return await adminApiPut(`/api/dashboard/config/${storeId}`, data);
  },
  
  getProducts: async (storeId: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return await adminApiGet(`/api/dashboard/products/${storeId}${queryString}`);
  },
  
  getActions: async (storeId: string) => {
    return await adminApiGet(`/api/dashboard/actions/${storeId}`);
  },
  
  getCommunications: async (storeId: string) => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.COMMUNICATIONS.BY_STORE(storeId));
  },
  
  getHealth: async (storeId: string) => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.ACCOUNT_HEALTH.BY_STORE(storeId));
  },
};

// Users API - using unified config
export const usersApi = {
  getUsers: async () => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.USERS.LIST);
  },
  
  getUser: async (id: string) => {
    return await adminApiGet(ADMIN_API_CONFIG.ENDPOINTS.USERS.DETAIL(id));
  },
  
  createUser: async (data: any) => {
    return await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.USERS.CREATE, data);
  },
  
  updateUser: async (id: string, data: any) => {
    return await adminApiPut(ADMIN_API_CONFIG.ENDPOINTS.USERS.UPDATE(id), data);
  },
  
  deleteUser: async (id: string) => {
    return await adminApiDelete(ADMIN_API_CONFIG.ENDPOINTS.USERS.DELETE(id));
  },
  
  refreshOTP: async (id: string) => {
    return await adminApiPost(ADMIN_API_CONFIG.ENDPOINTS.USERS.REFRESH_OTP(id));
  },
};

// Default export for compatibility
export default api;