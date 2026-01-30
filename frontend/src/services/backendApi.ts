// Backend API service for real data integration
import { API_CONFIG } from '../config/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface GlobalSnapshotData {
  sales: {
    todaySoFar: number;
    currency: string;
  };
  orders: {
    totalCount: number;
    fbmUnshipped: number;
    fbmPending: number;
    fbaPending: number;
  };
  messages: {
    casesRequiringAttention: number;
  };
  featuredOffer: {
    percentage: number;
    daysAgo: number;
  };
  feedback: {
    rating: number;
    count: number;
  };
  payments: {
    totalBalance: number;
    currency: string;
  };
  ads: {
    sales: number;
    impressions: number;
    currency: string;
  };
  inventory: {
    performanceIndex: number;
  };
}

class BackendApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Dashboard API methods
  async getDashboardSnapshot(storeId: string): Promise<GlobalSnapshotData> {
    const response = await this.request<GlobalSnapshotData>(`/api/dashboard/snapshot/${storeId}`);
    return response.data;
  }

  async updateDashboardSnapshot(storeId: string, data: Partial<GlobalSnapshotData>): Promise<GlobalSnapshotData> {
    const response = await this.request<GlobalSnapshotData>(`/api/dashboard/snapshot/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getDashboardConfig(storeId: string) {
    const response = await this.request(`/api/dashboard/config/${storeId}`);
    return response.data;
  }

  async updateDashboardConfig(storeId: string, config: any) {
    const response = await this.request(`/api/dashboard/config/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    return response.data;
  }

  // Products API methods
  async getProducts(storeId: string, params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('store_id', storeId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.request(`/api/products?${queryParams.toString()}`);
    return response.data;
  }

  async getProduct(storeId: string, id: string) {
    const response = await this.request(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(storeId: string, productData: any) {
    const response = await this.request(`/api/products`, {
      method: 'POST',
      body: JSON.stringify({ ...productData, store_id: storeId }),
    });
    return response.data;
  }

  async updateProduct(storeId: string, id: string, productData: any) {
    const response = await this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    return response.data;
  }

  async deleteProduct(storeId: string, id: string) {
    const response = await this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  // Store API methods
  async getStores() {
    const response = await this.request('/api/stores');
    return response.data;
  }

  async getStore(storeId: string) {
    const response = await this.request(`/api/stores/${storeId}`);
    return response.data;
  }

  async updateStore(storeId: string, storeData: any) {
    const response = await this.request(`/api/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
    return response.data;
  }

  // Sales API methods
  async getSalesSnapshot(storeId: string) {
    const response = await this.request(`/api/sales/snapshot/${storeId}`);
    return response.data;
  }

  async getDailySales(storeId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.request(`/api/sales/daily/${storeId}?${queryParams.toString()}`);
    return response.data;
  }

  async getChartData(storeId: string, period: string = '30d') {
    const response = await this.request(`/api/sales/chart-data/${storeId}?period=${period}`);
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.request('/api/health');
    return response.data;
  }
}

export const backendApi = new BackendApiService();
export type { GlobalSnapshotData };