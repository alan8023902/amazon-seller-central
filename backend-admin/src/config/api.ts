// 管理后台API配置文件 - 统一管理所有API端点
// 根据环境和当前域名确定后端URL
const getBackendUrl = () => {
  // 后端API始终使用localhost:3001 (用户指定后端不需要域名)
  return 'http://localhost:3001';
};

const BACKEND_URL = getBackendUrl();

export const ADMIN_API_CONFIG = {
  // 后端API基础URL
  BASE_URL: BACKEND_URL,
  
  // API端点
  ENDPOINTS: {
    // 店铺相关
    STORES: {
      LIST: '/api/stores',
      DETAIL: (id: string) => `/api/stores/${id}`,
      CREATE: '/api/stores',
      UPDATE: (id: string) => `/api/stores/${id}`,
      DELETE: (id: string) => `/api/stores/${id}`,
    },
    
    // Dashboard相关
    DASHBOARD: {
      SNAPSHOT: (storeId: string) => `/api/dashboard/snapshot/${storeId}`,
      UPDATE_SNAPSHOT: (storeId: string) => `/api/dashboard/snapshot/${storeId}`,
    },
    
    // 产品相关
    PRODUCTS: {
      LIST: '/api/products',
      DETAIL: (id: string) => `/api/products/${id}`,
      CREATE: '/api/products',
      UPDATE: (id: string) => `/api/products/${id}`,
      DELETE: (id: string) => `/api/products/${id}`,
      BY_STORE: (storeId: string) => `/api/products?store_id=${storeId}`,
      UPLOAD_IMAGE: '/api/products/upload-image',
    },
    
    // 销售数据相关
    SALES: {
      LIST: '/api/sales',
      BY_STORE: (storeId: string) => `/api/sales/snapshot/${storeId}`,
      UPDATE: (storeId: string) => `/api/sales/snapshot/${storeId}`,
      CHART_DATA: (storeId: string) => `/api/sales/chart-data/${storeId}`,
      DAILY_SALES: (storeId: string) => `/api/sales/daily/${storeId}`,
      GENERATE_DAILY: (storeId: string) => `/api/sales/generate-daily/${storeId}`,
    },
    
    // Communications相关
    COMMUNICATIONS: {
      BY_STORE: (storeId: string) => `/api/communications/${storeId}/admin`,
      FORUMS: (storeId: string) => `/api/communications/${storeId}/forums`,
      NEWS: (storeId: string) => `/api/communications/${storeId}/news`,
      UPDATE_FORUM: (storeId: string, forumId: string) => `/api/communications/${storeId}/forums/${forumId}`,
      UPDATE_NEWS: (storeId: string, newsId: string) => `/api/communications/${storeId}/news/${newsId}`,
    },
    
    // VOC相关
    VOC: {
      BY_STORE: (storeId: string) => `/api/voc/${storeId}`,
      UPDATE: (storeId: string) => `/api/voc/${storeId}`,
    },
    
    // 用户相关
    USERS: {
      LIST: '/api/users',
      DETAIL: (id: string) => `/api/users/${id}`,
      CREATE: '/api/users',
      UPDATE: (id: string) => `/api/users/${id}`,
      DELETE: (id: string) => `/api/users/${id}`,
      REFRESH_OTP: (id: string) => `/api/users/${id}/refresh-otp`,
      REFRESH_PASSWORD: (id: string) => `/api/users/${id}/refresh-password`,
    },
    
    // 账户健康相关
    ACCOUNT_HEALTH: {
      BY_STORE: (storeId: string) => `/api/account-health/${storeId}`,
      UPDATE: (storeId: string) => `/api/account-health/${storeId}`,
    },
    
    // 法律实体相关
    LEGAL_ENTITY: {
      BY_STORE: (storeId: string) => `/api/legal-entity/${storeId}`,
      UPDATE: (storeId: string) => `/api/legal-entity/${storeId}`,
    },
    
    // 销售申请相关
    SELLING_APPLICATIONS: {
      BY_STORE: (storeId: string) => `/api/selling-applications/${storeId}`,
      UPDATE: (storeId: string) => `/api/selling-applications/${storeId}`,
    },
    
    // 税务信息相关
    TAX_INFO: {
      BY_STORE: (storeId: string) => `/api/tax-info/${storeId}`,
      UPDATE: (storeId: string) => `/api/tax-info/${storeId}`,
    },
  }
};

// API请求工具函数
export const adminApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${ADMIN_API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🚀 Admin API Request: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log(`✅ Admin API Response: ${response.status} ${url}`, responseData);
    
    // 对于GET请求，如果响应格式是 {success: true, data: ...}，则返回 data 字段
    // 但是如果有 pagination 字段，则保持完整响应格式
    // 对于POST/PUT/DELETE请求，保持完整响应格式以便进行success检查
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET' && responseData.success && responseData.data !== undefined) {
      // 如果有分页信息，保持完整格式
      if (responseData.pagination) {
        return responseData;
      }
      // 否则只返回数据部分
      return responseData.data;
    }
    
    // 对于非GET请求或者没有标准格式的响应，返回完整响应
    return responseData;
  } catch (error) {
    console.error('❌ 管理后台API请求错误:', error);
    throw error;
  }
};

// GET请求
export const adminApiGet = (endpoint: string) => {
  return adminApiRequest(endpoint, { method: 'GET' });
};

// POST请求
export const adminApiPost = (endpoint: string, data?: any) => {
  return adminApiRequest(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// PUT请求
export const adminApiPut = (endpoint: string, data?: any) => {
  return adminApiRequest(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// DELETE请求
export const adminApiDelete = (endpoint: string) => {
  return adminApiRequest(endpoint, { method: 'DELETE' });
};

// 文件上传请求
export const adminApiUpload = (endpoint: string, formData: FormData) => {
  return adminApiRequest(endpoint, {
    method: 'POST',
    body: formData,
    headers: {}, // 让浏览器自动设置Content-Type for FormData
  });
};