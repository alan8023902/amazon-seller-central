import { z } from 'zod';

// Marketplace types
export type Marketplace = 'United States' | 'Japan' | 'United Kingdom' | 'Germany' | 'Europe';

// Store Schema
export const StoreSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  country: z.string().default('United States'),
  marketplace: z.string().default('United States'), // Add marketplace field
  currency_symbol: z.string().default('$'),
  business_type: z.enum(['Individual', 'Business']).default('Business'), // Add business type
  timezone: z.string().default('UTC'), // Add timezone
  description: z.string().optional(), // Add description
  // Store settings
  vacation_mode: z.boolean().default(false), // Add vacation mode
  auto_pricing: z.boolean().default(false), // Add auto pricing
  inventory_alerts: z.boolean().default(true), // Add inventory alerts
  order_notifications: z.boolean().default(true), // Add order notifications
  // Contact information
  contact_email: z.string().email().optional(), // Add contact email
  contact_phone: z.string().optional(), // Add contact phone
  // Business details
  tax_id: z.string().optional(), // Add tax ID
  vat_number: z.string().optional(), // Add VAT number
  // Status and metadata
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Store = z.infer<typeof StoreSchema>;

// Global Snapshot Schema
export const GlobalSnapshotSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  sales_amount: z.number().default(0),
  open_orders: z.number().int().default(0),
  buyer_messages: z.number().int().default(0),
  featured_offer_percent: z.number().int().default(100),
  seller_feedback_rating: z.number().default(5.00),
  seller_feedback_count: z.number().int().default(0),
  payments_balance: z.number().default(0),
  fbm_unshipped: z.number().int().default(0),
  fbm_pending: z.number().int().default(0),
  fba_pending: z.number().int().default(0),
  inventory_performance_index: z.number().int().default(400),
  ad_sales: z.number().default(0),
  ad_impressions: z.number().int().default(0),
  updated_at: z.string().optional(),
});

export type GlobalSnapshot = z.infer<typeof GlobalSnapshotSchema>;

// Product Schema
export const ProductSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  title: z.string(),
  asin: z.string(),
  sku: z.string(),
  image_url: z.string().optional(),
  price: z.number(),
  inventory: z.number().int().default(0),
  fulfillment_type: z.enum(['FBA', 'FBM']).default('FBA'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  sales_amount: z.number().default(0),
  revenue: z.number().default(0), // Add revenue field
  units_sold: z.number().int().default(0),
  page_views: z.number().int().default(0),
  // CX Health related
  ncx_rate: z.number().default(0),
  ncx_orders: z.number().int().default(0),
  total_orders: z.number().int().default(0),
  star_rating: z.number().default(0),
  cx_health_status: z.enum(['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']).default('Good'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// Sales Snapshot Schema
export const SalesSnapshotSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  total_order_items: z.number().int().default(0),
  units_ordered: z.number().int().default(0),
  ordered_product_sales: z.number().default(0),
  avg_units_per_order_item: z.number().default(0),
  avg_sales_per_order_item: z.number().default(0),
  // Backward compatibility (legacy fields)
  avg_units_per_order: z.number().default(0).optional(),
  avg_sales_per_order: z.number().default(0).optional(),
  snapshot_time: z.string().optional(),
});

export type SalesSnapshot = z.infer<typeof SalesSnapshotSchema>;

// Daily Sales Schema
export const DailySalesSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  sale_date: z.string(),
  units_ordered: z.number().int().default(0),
  sales_amount: z.number().default(0),
});

export type DailySales = z.infer<typeof DailySalesSchema>;

// CX Health Summary Schema
export const CXHealthSummarySchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  very_poor_count: z.number().int().default(0),
  poor_count: z.number().int().default(0),
  fair_count: z.number().int().default(0),
  good_count: z.number().int().default(0),
  excellent_count: z.number().int().default(0),
  updated_at: z.string().optional(),
});

export type CXHealthSummary = z.infer<typeof CXHealthSummarySchema>;

// Account Health Schema
export const AccountHealthSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  // Customer Service Performance
  order_defect_rate_seller: z.number().default(0),
  order_defect_rate_fba: z.number().default(0),
  negative_feedback_rate: z.number().default(0),
  a2z_claims_rate: z.number().default(0),
  chargeback_rate: z.number().default(0),
  // Policy Compliance
  account_health_rating: z.number().int().default(1000),
  ip_violations: z.number().int().default(0),
  product_auth_complaints: z.number().int().default(0),
  listing_violations: z.number().int().default(0),
  // Shipping Performance
  late_shipment_rate: z.number().default(0),
  cancel_rate: z.number().default(0),
  valid_tracking_rate: z.number().default(99),
  updated_at: z.string().optional(),
});

export type AccountHealth = z.infer<typeof AccountHealthSchema>;

// Legal Entity Schema
export const LegalEntitySchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  legalBusinessName: z.string().optional(),
  businessAddress: z.object({
    street: z.string().optional(),
    suite: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  taxInformation: z.object({
    status: z.string().optional(),
    taxId: z.string().optional(),
    taxClassification: z.string().optional(),
  }).optional(),
  businessType: z.string().optional(),
  registrationDate: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type LegalEntity = z.infer<typeof LegalEntitySchema>;

// Forum Post Schema
export const ForumPostSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  title: z.string(),
  post_date: z.string(),
  views: z.number().int().default(0),
  comments: z.number().int().default(0),
  post_type: z.enum(['FORUM', 'NEWS']).default('FORUM'),
  likes: z.number().int().default(0),
});

export type ForumPost = z.infer<typeof ForumPostSchema>;

// Voice of Customer (VOC) Data Schema
export const VocDataSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  product_name: z.string(),
  asin: z.string(),
  sku_status: z.enum(['Active', 'Inactive']).default('Active'),
  fulfillment: z.string(),
  dissatisfaction_rate: z.number(),
  dissatisfaction_orders: z.number().int(),
  total_orders: z.number().int(),
  rating: z.number(),
  return_rate: z.number(),
  main_negative_reason: z.string(),
  last_updated: z.string(),
  satisfaction_status: z.enum(['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']),
  is_out_of_stock: z.boolean().default(false),
  image: z.string().optional(),
});

export type VocData = z.infer<typeof VocDataSchema>;

// User Schema
export const UserSchema = z.object({
  id: z.string().optional(),
  store_id: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(['admin', 'user', 'manager']).default('user'),
  is_active: z.boolean().default(true),
  last_login: z.string().optional(),
  otp_secret: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// CX Health Breakdown Schema
export const CXHealthBreakdownSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  poor_listings: z.number().int().default(0),
  fair_listings: z.number().int().default(0),
  good_listings: z.number().int().default(0),
  very_good_listings: z.number().int().default(0),
  excellent_listings: z.number().int().default(0),
  updated_at: z.string(),
});

export type CXHealthBreakdown = z.infer<typeof CXHealthBreakdownSchema>;

// Order Schema
export const OrderSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  order_number: z.string(),
  customer_name: z.string().optional(),
  order_date: z.string(),
  ship_date: z.string().optional(),
  delivery_date: z.string().optional(),
  status: z.enum(['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned']).default('Pending'),
  fulfillment_type: z.enum(['FBA', 'FBM']).default('FBA'),
  total_amount: z.number().default(0),
  currency: z.string().default('USD'),
  items_count: z.number().int().default(1),
  shipping_address: z.string().optional(),
  tracking_number: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

// Inventory Schema
export const InventorySchema = z.object({
  id: z.string(),
  store_id: z.string(),
  product_id: z.string(),
  asin: z.string(),
  sku: z.string(),
  available_quantity: z.number().int().default(0),
  reserved_quantity: z.number().int().default(0),
  inbound_quantity: z.number().int().default(0),
  fulfillment_center: z.string().optional(),
  last_updated: z.string(),
});

export type Inventory = z.infer<typeof InventorySchema>;

// Store Settings Schema
export const StoreSettingsSchema = z.object({
  id: z.string(),
  store_id: z.string(),
  // Notification settings
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  order_alerts: z.boolean().default(true),
  inventory_alerts: z.boolean().default(true),
  performance_alerts: z.boolean().default(true),
  // Business settings
  auto_pricing_enabled: z.boolean().default(false),
  auto_reorder_enabled: z.boolean().default(false),
  vacation_mode: z.boolean().default(false),
  vacation_start_date: z.string().optional(),
  vacation_end_date: z.string().optional(),
  // Display settings
  default_currency: z.string().default('USD'),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  time_format: z.enum(['12h', '24h']).default('12h'),
  language: z.enum(['en-US', 'zh-CN', 'ja-JP', 'de-DE', 'fr-FR']).default('en-US'),
  updated_at: z.string(),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  yAxisConfig?: {
    unitsConfig: { ticks: number[]; domain: [number, number] };
    salesConfig: { ticks: number[]; domain: [number, number] };
  };
  compare?: {
    columns: Array<{ key: string; label: string; lines: string[] }>;
    series?: Array<{ key: string; label: string; data: any[] }>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface ProductFilters {
  store_id?: string;
  status?: 'Active' | 'Inactive' | 'All';
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  store_id?: string;
  status?: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'All';
  fulfillment_type?: 'FBA' | 'FBM' | 'All';
  date_range?: SalesDateRange;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StoreFilters {
  marketplace?: string;
  business_type?: 'Individual' | 'Business' | 'All';
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SalesDateRange {
  startDate: string;
  endDate: string;
}

// Store creation and update types
export interface CreateStoreRequest {
  name: string;
  country?: string;
  marketplace?: string;
  currency_symbol?: string;
  business_type?: 'Individual' | 'Business';
  timezone?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  tax_id?: string;
  vat_number?: string;
}

export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {
  vacation_mode?: boolean;
  auto_pricing?: boolean;
  inventory_alerts?: boolean;
  order_notifications?: boolean;
  is_active?: boolean;
}

// Validation schemas for requests
export const CreateStoreRequestSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  country: z.string().optional(),
  marketplace: z.string().optional(),
  currency_symbol: z.string().optional(),
  business_type: z.enum(['Individual', 'Business']).optional(),
  timezone: z.string().optional(),
  description: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  tax_id: z.string().optional(),
  vat_number: z.string().optional(),
});

export const UpdateStoreRequestSchema = CreateStoreRequestSchema.partial().extend({
  vacation_mode: z.boolean().optional(),
  auto_pricing: z.boolean().optional(),
  inventory_alerts: z.boolean().optional(),
  order_notifications: z.boolean().optional(),
  is_active: z.boolean().optional(),
});
