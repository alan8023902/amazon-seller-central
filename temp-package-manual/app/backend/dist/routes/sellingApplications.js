"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const sellingApplications = await dataService_1.dataService.readData('selling_applications');
    const storeApplications = sellingApplications.filter((app) => app.store_id === storeId);
    const response = {
        success: true,
        data: storeApplications.length > 0 ? storeApplications[0] : {
            id: `sa-${storeId}`,
            store_id: storeId,
            applications: [],
            pending_count: 0,
            approved_count: 0,
            rejected_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    };
    res.json(response);
}));
router.put('/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const updateData = req.body;
    const sellingApplications = await dataService_1.dataService.readData('selling_applications');
    const existingIndex = sellingApplications.findIndex((app) => app.store_id === storeId);
    let updatedApplication;
    if (existingIndex >= 0) {
        const existingApp = sellingApplications[existingIndex];
        sellingApplications[existingIndex] = {
            ...existingApp,
            ...updateData,
            updated_at: new Date().toISOString(),
        };
        updatedApplication = sellingApplications[existingIndex];
    }
    else {
        updatedApplication = {
            id: `sa-${storeId}`,
            store_id: storeId,
            ...updateData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        sellingApplications.push(updatedApplication);
    }
    await dataService_1.dataService.writeData('selling_applications', sellingApplications);
    const response = {
        success: true,
        data: updatedApplication,
        message: 'Selling applications updated successfully',
    };
    res.json(response);
}));
module.exports = router;
