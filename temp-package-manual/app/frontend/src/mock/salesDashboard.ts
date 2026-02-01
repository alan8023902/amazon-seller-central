// Mock data for Sales Dashboard
import { Marketplace } from '../types';

// Common product images (using online placeholders)
const product1 = 'https://m.media-amazon.com/images/I/71YyW3mI-iL._AC_SL1500_.jpg';
const product2 = 'https://m.media-amazon.com/images/I/61Nl-HhDsyL._AC_SL1500_.jpg';
const product3 = 'https://m.media-amazon.com/images/I/71cnd7plSjL._AC_SL1500_.jpg';
const product4 = 'https://m.media-amazon.com/images/I/71vZ6U83NDL._AC_SL1500_.jpg';

// Generate random sales data for a time range
export const generateSalesHistory = (isUS: boolean = true) => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < months.length; i++) {
    const baseValue = isUS ? 5000000 : 4000000;
    const today = baseValue + Math.floor(Math.random() * 3000000);
    const lastYear = today - Math.floor(Math.random() * 1000000);
    
    data.push({
      time: months[i],
      today,
      lastYear
    });
  }
  
  return data;
};

// Generate random inventory data
export const generateInventory = (isUS: boolean = true) => {
  const basePrice = isUS ? 150 : 120;
  const baseUnits = isUS ? 100000 : 80000;
  
  return [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      asin: 'B08FD5Z321',
      price: basePrice + Math.random() * 50,
      units: Math.floor(baseUnits + Math.random() * 50000),
      image: product1
    },
    {
      id: '2',
      name: 'Smart Watch with Health Tracking',
      asin: 'B09HJ5K789',
      price: basePrice + Math.random() * 100,
      units: Math.floor(baseUnits + Math.random() * 40000),
      image: product2
    },
    {
      id: '3',
      name: 'Portable Power Bank 20000mAh',
      asin: 'B07Y4X3210',
      price: basePrice - Math.random() * 80,
      units: Math.floor(baseUnits + Math.random() * 60000),
      image: product3
    },
    {
      id: '4',
      name: 'USB-C to HDMI Adapter 4K',
      asin: 'B08Q9X7654',
      price: basePrice - Math.random() * 100,
      units: Math.floor(baseUnits + Math.random() * 30000),
      image: product4
    }
  ];
};

// Dashboard data by marketplace
export const salesDashboardData = {
  'United States': {
    salesSnapshot: {
      totalOrderItems: 248,
      unitsOrdered: 192260,
      orderedProductSales: 18657478.98,
      avgUnitsOrderItem: 1.14,
      avgSalesOrderItem: 110.29
    },
    salesHistory: generateSalesHistory(true),
    inventory: generateInventory(true)
  },
  'Japan': {
    salesSnapshot: {
      totalOrderItems: 186,
      unitsOrdered: 145320,
      orderedProductSales: 21543678.45,
      avgUnitsOrderItem: 1.22,
      avgSalesOrderItem: 105.87
    },
    salesHistory: generateSalesHistory(false),
    inventory: generateInventory(false)
  },
  'United Kingdom': {
    salesSnapshot: {
      totalOrderItems: 152,
      unitsOrdered: 128640,
      orderedProductSales: 15876345.23,
      avgUnitsOrderItem: 1.18,
      avgSalesOrderItem: 102.45
    },
    salesHistory: generateSalesHistory(false),
    inventory: generateInventory(false)
  },
  'Germany': {
    salesSnapshot: {
      totalOrderItems: 168,
      unitsOrdered: 139470,
      orderedProductSales: 16987456.78,
      avgUnitsOrderItem: 1.15,
      avgSalesOrderItem: 98.67
    },
    salesHistory: generateSalesHistory(false),
    inventory: generateInventory(false)
  },
  'Europe': {
    salesSnapshot: {
      totalOrderItems: 324,
      unitsOrdered: 258790,
      orderedProductSales: 28987654.32,
      avgUnitsOrderItem: 1.20,
      avgSalesOrderItem: 112.34
    },
    salesHistory: generateSalesHistory(false),
    inventory: generateInventory(false)
  }
} as Record<Marketplace, any>;

// Generate ASIN tabs with translations
export const asinTabsConfig = (t: (key: string) => string) => [
  { id: 'decliningSales', label: t('decliningSales') || 'Declining Sales' },
  { id: 'increasingSales', label: t('increasingSales') || 'Increasing Sales' },
  { id: 'decliningTraffic', label: t('decliningTraffic') || 'Declining Traffic' },
  { id: 'belowMarket', label: t('belowMarket') || 'Below Market' },
  { id: 'topSales', label: t('topSales') || 'Top Sales' }
];
