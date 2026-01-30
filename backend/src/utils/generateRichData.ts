import fs from 'fs-extra';
import path from 'path';

// 生成大数值（1万以上）- 确保返回整数
function generateLargeNumber(min: number = 10000, max: number = 100000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机日期
function generateRandomDate(daysBack: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

// 生成Seller Forums数据
function generateSellerForums(storeId: string) {
  const forumTopics = [
    'Amazon FBA Fee Changes Discussion',
    'Best Practices for Product Photography',
    'Inventory Management Tips',
    'Customer Service Excellence',
    'PPC Campaign Optimization',
    'Brand Registry Benefits',
    'International Shipping Solutions',
    'Product Launch Strategies',
    'Review Management Best Practices',
    'Seasonal Sales Preparation'
  ];

  const storeMultiplier = getStoreMultiplier(storeId);
  
  return forumTopics.map((topic, index) => ({
    id: `forum-${storeId}-${index + 1}`,
    title: topic,
    author: `Seller${Math.floor(Math.random() * 1000)}`,
    views: Math.floor(generateLargeNumber(15000, 80000) * storeMultiplier),
    replies: Math.floor(generateLargeNumber(500, 5000) * storeMultiplier),
    likes: Math.floor(generateLargeNumber(1000, 10000) * storeMultiplier),
    category: ['General', 'FBA', 'Marketing', 'Technical'][Math.floor(Math.random() * 4)],
    created_at: generateRandomDate(60),
    last_activity: generateRandomDate(7),
    is_pinned: Math.random() > 0.8,
    is_solved: Math.random() > 0.6
  }));
}

// 生成Seller News数据
function generateSellerNews(storeId: string) {
  const newsItems = [
    'Amazon Announces New FBA Fee Structure for 2026',
    'Enhanced Brand Analytics Now Available',
    'New Product Category Guidelines Released',
    'Holiday Season Preparation Checklist',
    'Amazon Advertising Updates and Features',
    'Sustainability Initiatives for Sellers',
    'International Expansion Opportunities',
    'Customer Review Policy Updates',
    'Inventory Performance Index Changes',
    'New Seller Support Resources Available'
  ];

  const storeMultiplier = getStoreMultiplier(storeId);
  
  return newsItems.map((title, index) => ({
    id: `news-${storeId}-${index + 1}`,
    title,
    summary: `Important updates and information for Amazon sellers regarding ${title.toLowerCase()}.`,
    views: Math.floor(generateLargeNumber(25000, 150000) * storeMultiplier),
    comments: Math.floor(generateLargeNumber(200, 2000) * storeMultiplier),
    likes: Math.floor(generateLargeNumber(500, 8000) * storeMultiplier),
    category: ['Policy', 'Features', 'Marketing', 'Operations'][Math.floor(Math.random() * 4)],
    published_at: generateRandomDate(30),
    is_featured: Math.random() > 0.7,
    read_time: Math.floor(Math.random() * 10) + 2
  }));
}

// 根据店铺生成不同的数据倍数
function getStoreMultiplier(storeId: string): number {
  const multipliers: { [key: string]: number } = {
    'store-us-main': 1.5,  // 美国店数据最多
    'store-jp-main': 1.2,  // 日本店次之
    'store-uk-main': 1.0,  // 英国店标准
    'store-de-main': 0.7   // 德国店最少（暂停状态）
  };
  return multipliers[storeId] || 1.0;
}

// 生成差异化的Dashboard数据
function generateDashboardData(storeId: string) {
  const multiplier = getStoreMultiplier(storeId);
  const baseRevenue = 50000;
  const baseOrders = 1000;
  
  return {
    store_id: storeId,
    total_revenue: Math.floor(baseRevenue * multiplier * (0.8 + Math.random() * 0.4)),
    total_orders: Math.floor(baseOrders * multiplier * (0.8 + Math.random() * 0.4)),
    conversion_rate: Math.round((2 + Math.random() * 3) * 100) / 100,
    average_order_value: Math.round((baseRevenue / baseOrders) * multiplier * 100) / 100,
    return_rate: Math.round((1 + Math.random() * 2) * 100) / 100,
    customer_satisfaction: Math.round((4.2 + Math.random() * 0.7) * 100) / 100,
    inventory_turnover: Math.round((8 + Math.random() * 4) * 100) / 100,
    profit_margin: Math.round((15 + Math.random() * 10) * 100) / 100,
    updated_at: new Date().toISOString()
  };
}

// 生成差异化的销售数据
function generateSalesData(storeId: string) {
  const multiplier = getStoreMultiplier(storeId);
  const salesData = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    salesData.push({
      store_id: storeId,
      date: date.toISOString().split('T')[0],
      revenue: Math.floor((1000 + Math.random() * 3000) * multiplier),
      orders: Math.floor((20 + Math.random() * 80) * multiplier),
      units_sold: Math.floor((50 + Math.random() * 200) * multiplier),
      sessions: Math.floor(generateLargeNumber(5000, 20000) * multiplier),
      page_views: Math.floor(generateLargeNumber(10000, 50000) * multiplier),
      conversion_rate: Math.round((1.5 + Math.random() * 2.5) * 100) / 100
    });
  }
  
  return salesData;
}

// 生成差异化的产品数据
function generateProductData(storeId: string) {
  const productNames = [
    'Wireless Bluetooth Headphones',
    'Smart Phone Case',
    'USB-C Charging Cable',
    'Portable Power Bank',
    'Bluetooth Speaker',
    'Wireless Mouse',
    'Phone Stand',
    'Screen Protector',
    'Car Phone Mount',
    'Wireless Charger'
  ];
  
  const multiplier = getStoreMultiplier(storeId);
  
  return productNames.map((name, index) => ({
    id: `product-${storeId}-${index + 1}`,
    store_id: storeId,
    title: name,
    sku: `SKU-${storeId.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
    asin: `B${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
    price: Math.round((10 + Math.random() * 90) * 100) / 100,
    inventory: Math.floor((100 + Math.random() * 500) * multiplier),
    sales_rank: Math.floor((1000 + Math.random() * 50000) / multiplier),
    reviews_count: Math.floor(generateLargeNumber(500, 5000) * multiplier),
    rating: Math.round((4.0 + Math.random() * 1.0) * 100) / 100,
    units_sold: Math.floor(generateLargeNumber(1000, 10000) * multiplier),
    revenue: Math.floor((5000 + Math.random() * 20000) * multiplier),
    status: Math.random() > 0.1 ? 'Active' : 'Inactive',
    created_at: generateRandomDate(365),
    updated_at: generateRandomDate(7)
  }));
}

// 生成Communications数据
function generateCommunicationsData() {
  const stores = ['store-us-main', 'store-jp-main', 'store-uk-main', 'store-de-main'];
  const communications: any = {};
  
  stores.forEach(storeId => {
    communications[storeId] = {
      seller_forums: generateSellerForums(storeId),
      seller_news: generateSellerNews(storeId),
      notifications: {
        unread_count: Math.floor(Math.random() * 20) + 5,
        total_count: Math.floor(generateLargeNumber(100, 1000)),
        last_updated: new Date().toISOString()
      },
      messages: {
        inbox_count: Math.floor(Math.random() * 50) + 10,
        sent_count: Math.floor(Math.random() * 30) + 5,
        draft_count: Math.floor(Math.random() * 5)
      }
    };
  });
  
  return communications;
}

// 主要生成函数
export async function generateAllRichData() {
  const stores = ['store-us-main', 'store-jp-main', 'store-uk-main', 'store-de-main'];
  const dataDir = path.join(__dirname, '../../data');
  
  // 确保数据目录存在
  await fs.ensureDir(dataDir);
  
  // 生成Dashboard数据
  const dashboardData: any = {};
  stores.forEach(storeId => {
    dashboardData[storeId] = generateDashboardData(storeId);
  });
  await fs.writeJSON(path.join(dataDir, 'dashboard_snapshots.json'), dashboardData, { spaces: 2 });
  
  // 生成销售数据
  const salesData: any = {};
  stores.forEach(storeId => {
    salesData[storeId] = generateSalesData(storeId);
  });
  await fs.writeJSON(path.join(dataDir, 'sales_data.json'), salesData, { spaces: 2 });
  
  // 生成产品数据
  const allProducts: any[] = [];
  stores.forEach(storeId => {
    const storeProducts = generateProductData(storeId);
    allProducts.push(...storeProducts);
  });
  await fs.writeJSON(path.join(dataDir, 'products.json'), allProducts, { spaces: 2 });
  
  // 生成Communications数据
  const communicationsData = generateCommunicationsData();
  await fs.writeJSON(path.join(dataDir, 'communications.json'), communicationsData, { spaces: 2 });
  
  console.log('✅ 所有丰富数据生成完成！');
  console.log('📊 包含内容:');
  console.log('  - 4个差异化店铺的Dashboard数据');
  console.log('  - 每个店铺30天的销售数据');
  console.log('  - 每个店铺10个产品数据');
  console.log('  - Seller Forums (观看数1.5万-8万)');
  console.log('  - Seller News (观看数2.5万-15万)');
  console.log('  - 所有数据都有1万以上的大数值');
  
  return {
    stores: stores.length,
    dashboard_entries: Object.keys(dashboardData).length,
    sales_entries: Object.values(salesData).reduce((acc: number, data: any) => acc + data.length, 0),
    products: allProducts.length,
    communications: Object.keys(communicationsData).length
  };
}

// 如果直接运行此文件
if (require.main === module) {
  generateAllRichData().catch(console.error);
}