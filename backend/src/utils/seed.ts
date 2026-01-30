import { dataService } from '../services/dataService';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Store, 
  Product, 
  GlobalSnapshot, 
  SalesSnapshot, 
  DailySales,
  ForumPost 
} from '../types/index.js';

async function seedStores() {
  console.log('🏪 Seeding stores...');
  
  const stores: Omit<Store, 'id'>[] = [
    {
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
    }
  ];
  
  for (const store of stores) {
    await dataService.create<Store>('stores', store);
  }
  
  console.log(`✅ Created ${stores.length} stores`);
}

async function seedProducts() {
  console.log('📦 Seeding products...');
  
  const stores = await dataService.readData<Store>('stores');
  const storeId = stores[0]?.id;
  
  if (!storeId) {
    console.error('❌ No store found. Please seed stores first.');
    return;
  }
  
  const products: Omit<Product, 'id'>[] = [
    {
      store_id: storeId,
      title: "Lace Things for Women Bralette",
      asin: "B08F765432",
      sku: "TYNBO-LACE-001",
      image_url: "https://m.media-amazon.com/images/I/71tJkM8vDVL._AC_UY218_.jpg",
      price: 39.99,
      inventory: 66,
      fulfillment_type: 'FBA',
      status: 'Active',
      sales_amount: 822,
      units_sold: 21,
      page_views: 298,
      ncx_rate: 2.5,
      ncx_orders: 1,
      total_orders: 21,
      star_rating: 4.2,
      cx_health_status: 'Good',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      store_id: storeId,
      title: "Easy Soft Stretch Womens Underwear",
      asin: "B08G876543",
      sku: "TYNBO-UNDER-002",
      image_url: "https://m.media-amazon.com/images/I/51p+sM-iXRL._AC_UY218_.jpg",
      price: 5.99,
      inventory: 102,
      fulfillment_type: 'FBA',
      status: 'Active',
      sales_amount: 160,
      units_sold: 16,
      page_views: 0,
      ncx_rate: 0,
      ncx_orders: 0,
      total_orders: 16,
      star_rating: 4.5,
      cx_health_status: 'Excellent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      store_id: storeId,
      title: "Easy Soft Stretch Womens Underwear",
      asin: "B08H987654",
      sku: "TYNBO-UNDER-003",
      image_url: "https://m.media-amazon.com/images/I/61f8g9h0iJL._AC_UY218_.jpg",
      price: 5.99,
      inventory: 106,
      fulfillment_type: 'FBA',
      status: 'Active',
      sales_amount: 146,
      units_sold: 18,
      page_views: 0,
      ncx_rate: 1.2,
      ncx_orders: 1,
      total_orders: 18,
      star_rating: 4.3,
      cx_health_status: 'Good',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      store_id: storeId,
      title: "Underwear for Women Cotton High",
      asin: "B08I098765",
      sku: "TYNBO-UNDER-004",
      image_url: "https://m.media-amazon.com/images/I/61s+N9rK-xL._AC_UY218_.jpg",
      price: 5.99,
      inventory: 83,
      fulfillment_type: 'FBA',
      status: 'Active',
      sales_amount: 107,
      units_sold: 12,
      page_views: 0,
      ncx_rate: 0,
      ncx_orders: 0,
      total_orders: 12,
      star_rating: 4.7,
      cx_health_status: 'Excellent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      store_id: storeId,
      title: "Lace Things for Women Bralette",
      asin: "B08J109876",
      sku: "TYNBO-LACE-002",
      image_url: "https://m.media-amazon.com/images/I/81M51+d85EL._AC_UY218_.jpg",
      price: 19.99,
      inventory: 126,
      fulfillment_type: 'FBA',
      status: 'Active',
      sales_amount: 101,
      units_sold: 10,
      page_views: 0,
      ncx_rate: 3.1,
      ncx_orders: 2,
      total_orders: 10,
      star_rating: 3.9,
      cx_health_status: 'Fair',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  
  for (const product of products) {
    await dataService.create<Product>('products', product);
  }
  
  console.log(`✅ Created ${products.length} products`);
}

async function seedGlobalSnapshot() {
  console.log('📊 Seeding global snapshot...');
  
  const stores = await dataService.readData<Store>('stores');
  const storeId = stores[0]?.id;
  
  if (!storeId) {
    console.error('❌ No store found. Please seed stores first.');
    return;
  }
  
  const snapshot: Omit<GlobalSnapshot, 'id'> = {
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
  };
  
  await dataService.create<GlobalSnapshot>('global_snapshots', snapshot);
  console.log('✅ Created global snapshot');
}

async function seedSalesSnapshot() {
  console.log('💰 Seeding sales snapshot...');
  
  const stores = await dataService.readData<Store>('stores');
  const storeId = stores[0]?.id;
  
  if (!storeId) {
    console.error('❌ No store found. Please seed stores first.');
    return;
  }
  
  const snapshot: Omit<SalesSnapshot, 'id'> = {
    store_id: storeId,
    total_order_items: 248,
    units_ordered: 192260,
    ordered_product_sales: 18657478,
    avg_units_per_order: 1.14,
    avg_sales_per_order: 110.29,
    snapshot_time: new Date().toISOString(),
  };
  
  await dataService.create<SalesSnapshot>('sales_snapshots', snapshot);
  console.log('✅ Created sales snapshot');
}

async function seedDailySales() {
  console.log('📈 Seeding daily sales data...');
  
  const stores = await dataService.readData<Store>('stores');
  const storeId = stores[0]?.id;
  
  if (!storeId) {
    console.error('❌ No store found. Please seed stores first.');
    return;
  }
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Last 30 days
  
  const totalSales = 500000;
  const totalUnits = 10000;
  const days = 30;
  const avgSales = totalSales / days;
  const avgUnits = totalUnits / days;
  
  const dailySalesData: Omit<DailySales, 'id'>[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Add some randomness
    const salesMultiplier = 0.8 + Math.random() * 0.4;
    const unitsMultiplier = 0.8 + Math.random() * 0.4;
    
    dailySalesData.push({
      store_id: storeId,
      sale_date: date.toISOString().split('T')[0],
      sales_amount: Math.round(avgSales * salesMultiplier),
      units_ordered: Math.round(avgUnits * unitsMultiplier),
    });
  }
  
  for (const dailySale of dailySalesData) {
    await dataService.create<DailySales>('daily_sales', dailySale);
  }
  
  console.log(`✅ Created ${dailySalesData.length} daily sales records`);
}

async function seedForumPosts() {
  console.log('💬 Seeding forum posts...');
  
  const stores = await dataService.readData<Store>('stores');
  const storeId = stores[0]?.id;
  
  if (!storeId) {
    console.error('❌ No store found. Please seed stores first.');
    return;
  }
  
  const posts: Omit<ForumPost, 'id'>[] = [
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
    {
      store_id: storeId,
      title: "Amazon Brand Registry updates",
      post_date: new Date().toISOString().split('T')[0],
      views: 756,
      comments: 12,
      post_type: 'FORUM',
      likes: 8,
    },
  ];
  
  for (const post of posts) {
    await dataService.create<ForumPost>('forum_posts', post);
  }
  
  console.log(`✅ Created ${posts.length} forum posts`);
}

async function main() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    await seedStores();
    await seedProducts();
    await seedGlobalSnapshot();
    await seedSalesSnapshot();
    await seedDailySales();
    await seedForumPosts();
    
    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as seedDatabase };