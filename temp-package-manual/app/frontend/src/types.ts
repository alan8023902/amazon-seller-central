
export type Marketplace = string; // Allow any marketplace name from API
export type Language = 'en-US' | 'zh-CN';

// Enhanced Store interface to match backend Store type
export interface Store {
  id: string;
  name: string;
  country: string;
  marketplace: string;
  currency_symbol: string;
  business_type: 'Individual' | 'Business';
  timezone: string;
  description?: string;
  vacation_mode: boolean;
  auto_pricing: boolean;
  inventory_alerts: boolean;
  order_notifications: boolean;
  contact_email?: string;
  contact_phone?: string;
  tax_id?: string;
  vat_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  email: string;
  isLoggedIn: boolean;
  step: 'email' | 'password' | 'otp' | 'done';
  marketplace: Marketplace;
  language: Language;
  store: Store | null; // Changed from string to Store object
  selectedStoreId?: string; // Add selected store ID for easier access
}

export interface SalesHistoryPoint {
  time: string;
  today: number;
  lastYear: number;
}

export interface InventoryItem {
  id: string;
  image: string;
  name: string;
  sku: string;
  asin: string;
  status: 'Active' | 'Inactive' | 'Out of Stock';
  price: number;
  units: number;
}

export interface OrderItem {
  id: string;
  date: string;
  status: 'Unshipped' | 'Shipped' | 'Cancelled' | 'Pending';
  buyerName: string;
  total: number;
  quantity: number;
  productName: string;
  asin: string;
}

export interface DashboardState {
  salesToday: number;
  openOrders: number;
  messages: number;
  salesHistory: SalesHistoryPoint[];
  inventory: InventoryItem[];
  orders: OrderItem[];
  salesSnapshot: {
    totalOrderItems: number;
    unitsOrdered: number;
    orderedProductSales: number;
    avgUnitsOrderItem: number;
    avgSalesOrderItem: number;
  };
}
