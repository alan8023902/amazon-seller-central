"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const index_1 = require("../types/index");
const errorHandler_1 = require("../middleware/errorHandler");
const storeValidation_1 = require("../middleware/storeValidation");
const router = express_1.default.Router();
router.get('/:storeId', storeValidation_1.validateStoreAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const legalEntities = await dataService_1.dataService.readData('legal_entity');
        const legalEntity = legalEntities.find(le => le.store_id === storeId);
        if (!legalEntity) {
            const defaultLegalEntity = {
                id: `legal-entity-${storeId}`,
                store_id: storeId,
                legalBusinessName: 'Sample Technology Co., Ltd.',
                businessAddress: {
                    street: '123 Business Street',
                    suite: 'Suite 456',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94105',
                    country: 'United States'
                },
                taxInformation: {
                    status: 'Complete',
                    taxId: '12-3456789',
                    taxClassification: 'LLC'
                },
                businessType: 'Limited Liability Company',
                registrationDate: '2023-01-15',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            const response = {
                success: true,
                data: defaultLegalEntity,
                message: 'Default legal entity data returned'
            };
            return res.json(response);
        }
        const response = {
            success: true,
            data: legalEntity,
            message: 'Legal entity retrieved successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching legal entity:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch legal entity', 500);
    }
}));
router.put('/:storeId', storeValidation_1.validateStoreAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const legalEntityData = index_1.LegalEntitySchema.omit({ id: true, created_at: true }).parse({
            ...req.body,
            store_id: storeId,
            updated_at: new Date().toISOString()
        });
        const legalEntities = await dataService_1.dataService.readData('legal_entity');
        const existingIndex = legalEntities.findIndex(le => le.store_id === storeId);
        let updatedLegalEntity;
        if (existingIndex >= 0) {
            updatedLegalEntity = {
                ...legalEntities[existingIndex],
                ...legalEntityData,
                updated_at: new Date().toISOString()
            };
            legalEntities[existingIndex] = updatedLegalEntity;
        }
        else {
            updatedLegalEntity = {
                id: `legal-entity-${storeId}`,
                ...legalEntityData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            legalEntities.push(updatedLegalEntity);
        }
        await dataService_1.dataService.writeData('legal_entity', legalEntities);
        const response = {
            success: true,
            data: updatedLegalEntity,
            message: 'Legal entity updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating legal entity:', error);
        throw (0, errorHandler_1.createError)('Failed to update legal entity', 500);
    }
}));
module.exports = router;
