import { dataService } from '../services/dataService';

interface RealisticProduct {
  store_id: string;
  title: string;
  asin: string;
  sku: string;
  price: number;
  inventory: number;
  fulfillment_type: 'FBA' | 'FBM';
  status: 'Active' | 'Inactive';
  sales_amount: number;
  units_sold: number;
  page_views: number;
  ncx_rate: number;
  ncx_orders: number;
  total_orders: number;
  star_rating: number;
  cx_health_status: 'Good' | 'Fair' | 'Poor';
  image_url?: string;
}

const realisticProducts = [
  {
    title: "Wireless Bluetooth Headphones - Premium Sound Quality",
    category: "Electronics",
    price: 79.99,
    inventory: 150,
    sales_amount: 2399.70,
    units_sold: 30,
    star_rating: 4.5
  },
  {
    title: "Stainless Steel Water Bottle - 32oz Insulated",
    category: "Home & Kitchen",
    price: 24.99,
    inventory: 200,
    sales_amount: 1249.50,
    units_sold: 50,
    star_rating: 4.7
  },
  {
    title: "Organic Cotton T-Shirt - Unisex Comfortable Fit",
    category: "Clothing",
    price: 19.99,
    inventory: 300,
    sales_amount: 1999.00,
    units_sold: 100,
    star_rating: 4.3
  },
  {
    title: "LED Desk Lamp - Adjustable Brightness & Color Temperature",
    category: "Home & Garden",
    price: 45.99,
    inventory: 75,
    sales_amount: 1379.70,
    units_sold: 30,
    star_rating: 4.6
  },
  {
    title: "Yoga Mat - Non-Slip Exercise & Fitness Mat",
    category: "Sports & Outdoors",
    price: 29.99,
    inventory: 120,
    sales_amount: 1799.40,
    units_sold: 60,
    star_rating: 4.4
  },
  {
    title: "Ceramic Coffee Mug Set - 4 Pack with Gift Box",
    category: "Home & Kitchen",
    price: 34.99,
    inventory: 80,
    sales_amount: 1049.70,
    units_sold: 30,
    star_rating: 4.8
  },
  {
    title: "Portable Phone Charger - 10000mAh Power Bank",
    category: "Electronics",
    price: 39.99,
    inventory: 100,
    sales_amount: 1999.50,
    units_sold: 50,
    star_rating: 4.2
  },
  {
    title: "Essential Oil Diffuser - Ultrasonic Aromatherapy",
    category: "Health & Personal Care",
    price: 49.99,
    inventory: 60,
    sales_amount: 1499.70,
    units_sold: 30,
    star_rating: 4.5
  },
  {
    title: "Bluetooth Speaker - Waterproof Portable Audio",
    category: "Electronics",
    price: 59.99,
    inventory: 90,
    sales_amount: 2399.60,
    units_sold: 40,
    star_rating: 4.3
  },
  {
    title: "Memory Foam Pillow - Ergonomic Sleep Support",
    category: "Home & Kitchen",
    price: 69.99,
    inventory: 50,
    sales_amount: 1399.80,
    units_sold: 20,
    star_rating: 4.6
  },
  {
    title: "Resistance Bands Set - 5 Levels Workout Equipment",
    category: "Sports & Outdoors",
    price: 25.99,
    inventory: 150,
    sales_amount: 1299.50,
    units_sold: 50,
    star_rating: 4.4
  },
  {
    title: "Bamboo Cutting Board - Large Kitchen Chopping Block",
    category: "Home & Kitchen",
    price: 32.99,
    inventory: 70,
    sales_amount: 989.70,
    units_sold: 30,
    star_rating: 4.7
  },
  {
    title: "Wireless Mouse - Ergonomic Design for PC & Mac",
    category: "Electronics",
    price: 22.99,
    inventory: 200,
    sales_amount: 1149.50,
    units_sold: 50,
    star_rating: 4.1
  },
  {
    title: "Succulent Plant Set - 6 Mini Indoor Plants",
    category: "Home & Garden",
    price: 28.99,
    inventory: 40,
    sales_amount: 869.70,
    units_sold: 30,
    star_rating: 4.8
  },
  {
    title: "Blue Light Blocking Glasses - Computer Eye Strain Relief",
    category: "Health & Personal Care",
    price: 18.99,
    inventory: 180,
    sales_amount: 1139.40,
    units_sold: 60,
    star_rating: 4.2
  }
];

export async function addRealisticProducts(storeId: string): Promise<void> {
  console.log(`Adding realistic products for store: ${storeId}`);
  
  for (let i = 0; i < realisticProducts.length; i++) {
    const productTemplate = realisticProducts[i];
    
    const product: RealisticProduct = {
      store_id: storeId,
      title: productTemplate.title,
      asin: `B${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      sku: `SKU-${storeId.substring(0, 8)}-${i.toString().padStart(3, '0')}`,
      price: productTemplate.price,
      inventory: productTemplate.inventory,
      fulfillment_type: Math.random() > 0.8 ? 'FBM' : 'FBA',
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      sales_amount: productTemplate.sales_amount,
      units_sold: productTemplate.units_sold,
      page_views: Math.floor(Math.random() * 1000) + 100,
      ncx_rate: Math.random() * 10,
      ncx_orders: Math.floor(Math.random() * 10),
      total_orders: productTemplate.units_sold + Math.floor(Math.random() * 20),
      star_rating: productTemplate.star_rating,
      cx_health_status: productTemplate.star_rating > 4.5 ? 'Good' : 
                       productTemplate.star_rating > 3.5 ? 'Fair' : 'Poor'
    };

    try {
      const createdProduct = await dataService.create('products', product);
      console.log(`Added product: ${product.title}`);
    } catch (error) {
      console.error(`Failed to add product ${product.title}:`, error);
    }
  }
  
  console.log(`Finished adding realistic products for store: ${storeId}`);
}

// Function to add products to all existing stores
export async function addRealisticProductsToAllStores(): Promise<void> {
  try {
    const stores = await dataService.readData('stores');
    
    for (const store of stores) {
      if (store && typeof store === 'object' && 'id' in store) {
        await addRealisticProducts(store.id as string);
      }
    }
    
    console.log('Successfully added realistic products to all stores');
  } catch (error) {
    console.error('Failed to add realistic products:', error);
  }
}