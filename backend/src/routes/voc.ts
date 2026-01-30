import express from 'express';
import { dataService } from '../services/dataService';
import { 
  type ApiResponse,
  type VocData,
  type CXHealthBreakdown
} from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// GET /api/voc/data/:storeId - Get Voice of Customer data
router.get('/data/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  let vocData = await dataService.findByStoreId<VocData>('voc_data', storeId);
  
  // Create default VOC data if none exists
  if (vocData.length === 0) {
    const defaultVocData = [
      {
        store_id: storeId,
        product_name: 'Wireless Bluetooth Headphones',
        asin: 'B012345678',
        sku_status: 'Active',
        fulfillment: 'Amazon Fulfillment',
        dissatisfaction_rate: 1.2,
        dissatisfaction_orders: 15,
        total_orders: 1250,
        rating: 4.5,
        return_rate: 2.3,
        main_negative_reason: 'Battery life insufficient',
        last_updated: '2026-01-12',
        satisfaction_status: 'Good',
        is_out_of_stock: false,
        image: 'https://via.placeholder.com/50',
      },
      {
        store_id: storeId,
        product_name: 'Smart Home Security Camera',
        asin: 'B087654321',
        sku_status: 'Active',
        fulfillment: 'Seller Fulfillment',
        dissatisfaction_rate: 5.8,
        dissatisfaction_orders: 42,
        total_orders: 724,
        rating: 3.8,
        return_rate: 4.1,
        main_negative_reason: 'Connection unstable',
        last_updated: '2026-01-13',
        satisfaction_status: 'Average',
        is_out_of_stock: false,
        image: 'https://via.placeholder.com/50',
      },
      {
        store_id: storeId,
        product_name: 'Portable External SSD 1TB',
        asin: 'B098765432',
        sku_status: 'Active',
        fulfillment: 'Amazon Fulfillment',
        dissatisfaction_rate: 0.5,
        dissatisfaction_orders: 8,
        total_orders: 1600,
        rating: 4.9,
        return_rate: 1.2,
        main_negative_reason: 'None',
        last_updated: '2026-01-11',
        satisfaction_status: 'Excellent',
        is_out_of_stock: false,
        image: 'https://via.placeholder.com/50',
      },
      {
        store_id: storeId,
        product_name: 'Electric Toothbrush with UV Sanitizer',
        asin: 'B076543210',
        sku_status: 'Active',
        fulfillment: 'Amazon Fulfillment',
        dissatisfaction_rate: 8.9,
        dissatisfaction_orders: 67,
        total_orders: 753,
        rating: 3.2,
        return_rate: 6.5,
        main_negative_reason: 'Product quality issues',
        last_updated: '2026-01-13',
        satisfaction_status: 'Very Poor',
        is_out_of_stock: false,
        image: 'https://via.placeholder.com/50',
      },
      {
        store_id: storeId,
        product_name: 'Wireless Charging Pad',
        asin: 'B065432109',
        sku_status: 'Active',
        fulfillment: 'Seller Fulfillment',
        dissatisfaction_rate: 3.4,
        dissatisfaction_orders: 23,
        total_orders: 676,
        rating: 4.1,
        return_rate: 3.0,
        main_negative_reason: 'Slow charging speed',
        last_updated: '2026-01-12',
        satisfaction_status: 'Average',
        is_out_of_stock: true,
        image: 'https://via.placeholder.com/50',
      },
    ];
    
    for (const data of defaultVocData) {
      await dataService.create<VocData>('voc_data', {
        ...data,
        sku_status: data.sku_status as 'Active' | 'Inactive',
        satisfaction_status: data.satisfaction_status as 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor'
      });
    }
    
    vocData = await dataService.findByStoreId<VocData>('voc_data', storeId);
  }
  
  const response: ApiResponse<VocData[]> = {
    success: true,
    data: vocData,
  };
  
  res.json(response);
}));

// GET /api/voc/summary/:storeId - Get satisfaction summary
router.get('/summary/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  const vocData = await dataService.findByStoreId<VocData>('voc_data', storeId);
  
  // Calculate satisfaction summary
  const summary = {
    'Excellent': vocData.filter(item => item.satisfaction_status === 'Excellent').length,
    'Good': vocData.filter(item => item.satisfaction_status === 'Good').length,
    'Average': vocData.filter(item => item.satisfaction_status === 'Average').length,
    'Poor': vocData.filter(item => item.satisfaction_status === 'Poor').length,
    'Very Poor': vocData.filter(item => item.satisfaction_status === 'Very Poor').length,
  };
  
  const response: ApiResponse = {
    success: true,
    data: summary,
  };
  
  res.json(response);
}));

// PUT /api/voc/data/:storeId/:id - Update VOC data
router.put('/data/:storeId/:id', asyncHandler(async (req, res) => {
  const { storeId, id } = req.params;
  
  const updatedData = await dataService.update<VocData>('voc_data', id, {
    ...req.body,
    store_id: storeId,
    last_updated: new Date().toISOString().split('T')[0],
  });
  
  if (!updatedData) {
    throw createError('VOC data not found', 404);
  }
  
  const response: ApiResponse<VocData> = {
    success: true,
    data: updatedData,
    message: 'VOC data updated successfully',
  };
  
  res.json(response);
}));

// GET /api/voc/cx-health/:storeId - Get CX Health breakdown data
router.get('/cx-health/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  try {
    // Read CX Health data directly from JSON file
    const filePath = require('path').join(__dirname, '../../data/cx_health.json');
    const cxHealthData = require('fs-extra').readJsonSync(filePath);
    
    let storeCxHealth = cxHealthData[storeId];
    
    // If store CX Health not found, create default data
    if (!storeCxHealth) {
      console.log(`Creating default CX Health data for store: ${storeId}`);
      
      storeCxHealth = {
        poor_listings: 6,
        fair_listings: 0,
        good_listings: 0,
        very_good_listings: 1,
        excellent_listings: 6
      };
      
      // Save the new data
      cxHealthData[storeId] = storeCxHealth;
      require('fs-extra').writeJsonSync(filePath, cxHealthData, { spaces: 2 });
    }
    
    const response: ApiResponse<any> = {
      success: true,
      data: storeCxHealth,
    };
    
    res.json(response);
  } catch (error) {
    console.error('CX Health error:', error);
    throw createError('Failed to fetch CX Health data', 500);
  }
}));

// PUT /api/voc/cx-health/:storeId - Update CX Health breakdown data
router.put('/cx-health/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { poor_listings, fair_listings, good_listings, very_good_listings, excellent_listings } = req.body;
  
  try {
    // Read CX Health data directly from JSON file
    const filePath = require('path').join(__dirname, '../../data/cx_health.json');
    const cxHealthData = require('fs-extra').readJsonSync(filePath);
    
    // Update the data
    cxHealthData[storeId] = {
      poor_listings: parseInt(poor_listings) || 0,
      fair_listings: parseInt(fair_listings) || 0,
      good_listings: parseInt(good_listings) || 0,
      very_good_listings: parseInt(very_good_listings) || 0,
      excellent_listings: parseInt(excellent_listings) || 0
    };
    
    // Save the updated data
    require('fs-extra').writeJsonSync(filePath, cxHealthData, { spaces: 2 });
    
    const response: ApiResponse<any> = {
      success: true,
      data: cxHealthData[storeId],
      message: 'CX Health data updated successfully',
    };
    
    res.json(response);
  } catch (error) {
    console.error('CX Health update error:', error);
    throw createError('Failed to update CX Health data', 500);
  }
}));

export = router;