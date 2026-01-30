"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/data/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    let vocData = await dataService_1.dataService.findByStoreId('voc_data', storeId);
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
            await dataService_1.dataService.create('voc_data', {
                ...data,
                sku_status: data.sku_status,
                satisfaction_status: data.satisfaction_status
            });
        }
        vocData = await dataService_1.dataService.findByStoreId('voc_data', storeId);
    }
    const response = {
        success: true,
        data: vocData,
    };
    res.json(response);
}));
router.get('/summary/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const vocData = await dataService_1.dataService.findByStoreId('voc_data', storeId);
    const summary = {
        'Excellent': vocData.filter(item => item.satisfaction_status === 'Excellent').length,
        'Good': vocData.filter(item => item.satisfaction_status === 'Good').length,
        'Average': vocData.filter(item => item.satisfaction_status === 'Average').length,
        'Poor': vocData.filter(item => item.satisfaction_status === 'Poor').length,
        'Very Poor': vocData.filter(item => item.satisfaction_status === 'Very Poor').length,
    };
    const response = {
        success: true,
        data: summary,
    };
    res.json(response);
}));
router.put('/data/:storeId/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId, id } = req.params;
    const updatedData = await dataService_1.dataService.update('voc_data', id, {
        ...req.body,
        store_id: storeId,
        last_updated: new Date().toISOString().split('T')[0],
    });
    if (!updatedData) {
        throw (0, errorHandler_1.createError)('VOC data not found', 404);
    }
    const response = {
        success: true,
        data: updatedData,
        message: 'VOC data updated successfully',
    };
    res.json(response);
}));
router.get('/cx-health/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const filePath = require('path').join(__dirname, '../../data/cx_health.json');
        const cxHealthData = require('fs-extra').readJsonSync(filePath);
        let storeCxHealth = cxHealthData[storeId];
        if (!storeCxHealth) {
            console.log(`Creating default CX Health data for store: ${storeId}`);
            storeCxHealth = {
                poor_listings: 6,
                fair_listings: 0,
                good_listings: 0,
                very_good_listings: 1,
                excellent_listings: 6
            };
            cxHealthData[storeId] = storeCxHealth;
            require('fs-extra').writeJsonSync(filePath, cxHealthData, { spaces: 2 });
        }
        const response = {
            success: true,
            data: storeCxHealth,
        };
        res.json(response);
    }
    catch (error) {
        console.error('CX Health error:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch CX Health data', 500);
    }
}));
router.put('/cx-health/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { poor_listings, fair_listings, good_listings, very_good_listings, excellent_listings } = req.body;
    try {
        const filePath = require('path').join(__dirname, '../../data/cx_health.json');
        const cxHealthData = require('fs-extra').readJsonSync(filePath);
        cxHealthData[storeId] = {
            poor_listings: parseInt(poor_listings) || 0,
            fair_listings: parseInt(fair_listings) || 0,
            good_listings: parseInt(good_listings) || 0,
            very_good_listings: parseInt(very_good_listings) || 0,
            excellent_listings: parseInt(excellent_listings) || 0
        };
        require('fs-extra').writeJsonSync(filePath, cxHealthData, { spaces: 2 });
        const response = {
            success: true,
            data: cxHealthData[storeId],
            message: 'CX Health data updated successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('CX Health update error:', error);
        throw (0, errorHandler_1.createError)('Failed to update CX Health data', 500);
    }
}));
module.exports = router;
