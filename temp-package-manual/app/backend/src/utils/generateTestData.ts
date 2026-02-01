import { dataService } from '../services/dataService';

interface Store {
  id: string;
  name: string;
  marketplace: string;
  currency_symbol: string;
  country: string;
  business_type: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
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

// 产品名称模板
const productTemplates = {
  'United States': [
    'Wireless Bluetooth Headphones - Premium Sound Quality',
    'Smart Fitness Tracker with Heart Rate Monitor',
    'Portable Phone Charger 10000mAh Power Bank',
    'LED Desk Lamp with USB Charging Port',
    'Waterproof Bluetooth Speaker - 360° Sound',
    'Gaming Mouse with RGB Lighting',
    'Stainless Steel Water Bottle 32oz',
    'Wireless Car Charger Mount',
    'Noise Cancelling Earbuds',
    'Smart Home Security Camera',
    'Ergonomic Office Chair Cushion',
    'Portable Laptop Stand Adjustable',
    'USB-C Hub 7-in-1 Adapter',
    'Wireless Charging Pad Fast Charge',
    'Blue Light Blocking Glasses'
  ],
  'Japan': [
    'ワイヤレス Bluetooth ヘッドフォン - 高音質',
    'スマートフィットネストラッカー 心拍数モニター付き',
    'ポータブル充電器 10000mAh モバイルバッテリー',
    'LED デスクランプ USB充電ポート付き',
    '防水 Bluetooth スピーカー - 360°サウンド',
    'ゲーミングマウス RGB ライト付き',
    'ステンレス製ウォーターボトル 1L',
    'ワイヤレス車載充電器マウント',
    'ノイズキャンセリング イヤホン',
    'スマートホーム セキュリティカメラ',
    '人間工学オフィスチェアクッション',
    'ポータブル ノートパソコンスタンド 調整可能',
    'USB-C ハブ 7-in-1 アダプター',
    'ワイヤレス充電パッド 急速充電',
    'ブルーライトカット メガネ'
  ],
  'United Kingdom': [
    'Wireless Bluetooth Headphones - Premium Audio',
    'Smart Fitness Tracker with Heart Monitor',
    'Portable Mobile Charger 10000mAh Power Bank',
    'LED Reading Lamp with USB Port',
    'Waterproof Bluetooth Speaker - Surround Sound',
    'Gaming Mouse with Customizable RGB',
    'Insulated Water Bottle 1 Litre',
    'Wireless Car Charging Mount',
    'Active Noise Cancelling Earphones',
    'Smart Home CCTV Camera',
    'Ergonomic Office Seat Cushion',
    'Adjustable Laptop Stand Portable',
    'USB-C Multi-Port Hub Adapter',
    'Fast Wireless Charging Station',
    'Anti Blue Light Reading Glasses'
  ]
};

// SKU前缀
const skuPrefixes = {
  'TechNestGo': 'TNG',
  'TYNBO Store': 'TYN',
  'Mayer Jones': 'MJN',
  'alanlr': 'ALR'
};

// 生成随机ASIN
function generateASIN(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'B0';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成随机价格
function generatePrice(min: number = 10, max: number = 500): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// 生成随机库存
function generateInventory(): number {
  return Math.floor(Math.random() * 1000) + 10;
}

// 生成销售数据
function generateSalesData(price: number, inventory: number) {
  const unitsSold = Math.floor(Math.random() * Math.min(inventory * 0.3, 100));
  const salesAmount = Math.round(unitsSold * price * 100) / 100;
  return { unitsSold, salesAmount };
}

export async function generateTestData() {
  try {
    console.log('🚀 开始生成测试数据...');
    
    // 获取现有店铺
    const stores: Store[] = await dataService.readData('stores');
    console.log(`📊 找到 ${stores.length} 个店铺`);
    
    // 清空现有产品数据
    await dataService.writeData('products', []);
    console.log('🗑️ 清空现有产品数据');
    
    const allProducts: Product[] = [];
    
    for (const store of stores) {
      console.log(`\n🏪 为店铺 "${store.name}" 生成产品数据...`);
      
      const marketplace = store.marketplace as keyof typeof productTemplates;
      const templates = productTemplates[marketplace] || productTemplates['United States'];
      const skuPrefix = skuPrefixes[store.name as keyof typeof skuPrefixes] || 'GEN';
      
      // 为每个店铺生成10-15个产品
      const productCount = Math.floor(Math.random() * 6) + 10; // 10-15个产品
      
      for (let i = 0; i < productCount; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const price = generatePrice();
        const inventory = generateInventory();
        const { unitsSold, salesAmount } = generateSalesData(price, inventory);
        
        const product: Product = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          store_id: store.id,
          title: template,
          sku: `${skuPrefix}-${String(i + 1).padStart(3, '0')}`,
          asin: generateASIN(),
          price: price,
          inventory: inventory,
          status: Math.random() > 0.1 ? 'Active' : 'Inactive', // 90% Active
          sales_amount: salesAmount,
          units_sold: unitsSold,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // 过去30天内随机时间
          updated_at: new Date().toISOString()
        };
        
        allProducts.push(product);
      }
      
      console.log(`✅ 为店铺 "${store.name}" 生成了 ${productCount} 个产品`);
    }
    
    // 保存所有产品数据
    await dataService.writeData('products', allProducts);
    console.log(`\n🎉 成功生成 ${allProducts.length} 个产品！`);
    
    // 统计信息
    const stats = stores.map(store => {
      const storeProducts = allProducts.filter(p => p.store_id === store.id);
      const totalSales = storeProducts.reduce((sum, p) => sum + p.sales_amount, 0);
      const totalUnits = storeProducts.reduce((sum, p) => sum + p.units_sold, 0);
      const activeProducts = storeProducts.filter(p => p.status === 'Active').length;
      
      return {
        storeName: store.name,
        marketplace: store.marketplace,
        productCount: storeProducts.length,
        activeProducts,
        totalSales: Math.round(totalSales * 100) / 100,
        totalUnits
      };
    });
    
    console.log('\n📈 店铺统计信息:');
    stats.forEach(stat => {
      console.log(`🏪 ${stat.storeName} (${stat.marketplace}):`);
      console.log(`   📦 产品数量: ${stat.productCount} (活跃: ${stat.activeProducts})`);
      console.log(`   💰 总销售额: ${stat.totalSales}`);
      console.log(`   📊 总销量: ${stat.totalUnits} 件`);
    });
    
    return { success: true, stats };
    
  } catch (error) {
    console.error('❌ 生成测试数据失败:', error);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  generateTestData()
    .then(() => {
      console.log('\n✅ 测试数据生成完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 生成失败:', error);
      process.exit(1);
    });
}