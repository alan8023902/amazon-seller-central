import express from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse } from '../types/index';
import * as fs from 'fs-extra';
import * as path from 'path';

const router = express.Router();

interface AccountHealthData {
  id: string;
  store_id: string;
  order_defect_rate: {
    seller_fulfilled: number;
    fulfilled_by_amazon: number;
  };
  policy_violations: {
    negative_feedback: number;
    a_to_z_claims: number;
    chargeback_claims: number;
  };
  account_health_rating: number;
  shipping_performance: {
    late_shipment_rate: number;
    pre_fulfillment_cancel_rate: number;
    valid_tracking_rate: number;
    on_time_delivery_rate: number | null;
  };
  policy_compliance: {
    product_policy_violations: number;
    listing_policy_violations: number;
    intellectual_property_violations: number;
    customer_product_reviews: number;
    other_policy_violations: number;
  };
  updated_at: string;
}

// GET /api/account-health/:storeId - Get account health data for a store
router.get('/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  try {
    const filePath = path.join(__dirname, '../../data/account_health.json');
    const accountHealthData: AccountHealthData[] = await fs.readJson(filePath);
    
    // Find account health data for the specific store
    let storeAccountHealth = accountHealthData.find(ah => ah.store_id === storeId);
    
    // If store account health not found, create default data
    if (!storeAccountHealth) {
      console.log(`Creating default account health data for store: ${storeId}`);
      
      storeAccountHealth = {
        id: `ah-${storeId}`,
        store_id: storeId,
        order_defect_rate: {
          seller_fulfilled: 3,
          fulfilled_by_amazon: 2
        },
        policy_violations: {
          negative_feedback: 0,
          a_to_z_claims: 0,
          chargeback_claims: 0
        },
        account_health_rating: 982,
        shipping_performance: {
          late_shipment_rate: 0,
          pre_fulfillment_cancel_rate: 0,
          valid_tracking_rate: 99,
          on_time_delivery_rate: null
        },
        policy_compliance: {
          product_policy_violations: 0,
          listing_policy_violations: 0,
          intellectual_property_violations: 0,
          customer_product_reviews: 0,
          other_policy_violations: 0
        },
        updated_at: new Date().toISOString()
      };
      
      // Add to array and save
      accountHealthData.push(storeAccountHealth);
      await fs.writeJson(filePath, accountHealthData, { spaces: 2 });
    }
    
    const response: ApiResponse<AccountHealthData> = {
      success: true,
      data: storeAccountHealth,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Account health fetch error:', error);
    throw createError('Failed to fetch account health data', 500);
  }
}));

// PUT /api/account-health/:storeId - Update account health data for a store
router.put('/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const updateData = req.body;
  
  try {
    const filePath = path.join(__dirname, '../../data/account_health.json');
    const accountHealthData: AccountHealthData[] = await fs.readJson(filePath);
    
    // Find existing account health data or create new one
    const existingIndex = accountHealthData.findIndex(ah => ah.store_id === storeId);
    
    const updatedAccountHealth: AccountHealthData = {
      id: existingIndex >= 0 ? accountHealthData[existingIndex].id : `ah-${storeId}`,
      store_id: storeId,
      order_defect_rate: {
        seller_fulfilled: parseFloat(updateData.order_defect_rate?.seller_fulfilled) || 0,
        fulfilled_by_amazon: parseFloat(updateData.order_defect_rate?.fulfilled_by_amazon) || 0
      },
      policy_violations: {
        negative_feedback: parseFloat(updateData.policy_violations?.negative_feedback) || 0,
        a_to_z_claims: parseFloat(updateData.policy_violations?.a_to_z_claims) || 0,
        chargeback_claims: parseFloat(updateData.policy_violations?.chargeback_claims) || 0
      },
      account_health_rating: parseInt(updateData.account_health_rating) || 0,
      shipping_performance: {
        late_shipment_rate: parseFloat(updateData.shipping_performance?.late_shipment_rate) || 0,
        pre_fulfillment_cancel_rate: parseFloat(updateData.shipping_performance?.pre_fulfillment_cancel_rate) || 0,
        valid_tracking_rate: parseFloat(updateData.shipping_performance?.valid_tracking_rate) || 0,
        on_time_delivery_rate: updateData.shipping_performance?.on_time_delivery_rate ? parseFloat(updateData.shipping_performance.on_time_delivery_rate) : null
      },
      policy_compliance: {
        product_policy_violations: parseInt(updateData.policy_compliance?.product_policy_violations) || 0,
        listing_policy_violations: parseInt(updateData.policy_compliance?.listing_policy_violations) || 0,
        intellectual_property_violations: parseInt(updateData.policy_compliance?.intellectual_property_violations) || 0,
        customer_product_reviews: parseInt(updateData.policy_compliance?.customer_product_reviews) || 0,
        other_policy_violations: parseInt(updateData.policy_compliance?.other_policy_violations) || 0
      },
      updated_at: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing
      accountHealthData[existingIndex] = updatedAccountHealth;
    } else {
      // Add new
      accountHealthData.push(updatedAccountHealth);
    }
    
    // Save the updated data
    await fs.writeJson(filePath, accountHealthData, { spaces: 2 });
    
    const response: ApiResponse<AccountHealthData> = {
      success: true,
      data: updatedAccountHealth,
      message: 'Account health data updated successfully',
    };
    
    res.json(response);
  } catch (error) {
    console.error('Account health update error:', error);
    throw createError('Failed to update account health data', 500);
  }
}));

export = router;