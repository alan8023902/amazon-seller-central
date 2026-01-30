"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("../middleware/errorHandler");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const router = express_1.default.Router();
router.get('/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const filePath = path.join(__dirname, '../../data/account_health.json');
        const accountHealthData = await fs.readJson(filePath);
        let storeAccountHealth = accountHealthData.find(ah => ah.store_id === storeId);
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
            accountHealthData.push(storeAccountHealth);
            await fs.writeJson(filePath, accountHealthData, { spaces: 2 });
        }
        const response = {
            success: true,
            data: storeAccountHealth,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Account health fetch error:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch account health data', 500);
    }
}));
router.put('/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const updateData = req.body;
    try {
        const filePath = path.join(__dirname, '../../data/account_health.json');
        const accountHealthData = await fs.readJson(filePath);
        const existingIndex = accountHealthData.findIndex(ah => ah.store_id === storeId);
        const updatedAccountHealth = {
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
            accountHealthData[existingIndex] = updatedAccountHealth;
        }
        else {
            accountHealthData.push(updatedAccountHealth);
        }
        await fs.writeJson(filePath, accountHealthData, { spaces: 2 });
        const response = {
            success: true,
            data: updatedAccountHealth,
            message: 'Account health data updated successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Account health update error:', error);
        throw (0, errorHandler_1.createError)('Failed to update account health data', 500);
    }
}));
module.exports = router;
