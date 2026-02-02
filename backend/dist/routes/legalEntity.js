"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const index_1 = require("../types/index");
const errorHandler_1 = require("../middleware/errorHandler");
const storeValidation_1 = require("../middleware/storeValidation");
const fs_1 = require("fs");
const path_1 = require("path");
const router = express_1.default.Router();
const readTaxInfoData = () => {
    try {
        const taxInfoPath = (0, path_1.join)(process.cwd(), 'data', 'tax_info.json');
        const data = (0, fs_1.readFileSync)(taxInfoPath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading tax info data:', error);
        return [];
    }
};
router.get('/:storeId', storeValidation_1.validateStoreAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const legalEntities = await dataService_1.dataService.readData('legal_entity');
        let legalEntity = legalEntities.find(le => le.store_id === storeId);
        const taxInfoData = readTaxInfoData();
        const taxInfo = taxInfoData.find((info) => info.store_id === storeId);
        if (!legalEntity) {
            legalEntity = {
                id: `legal-entity-${storeId}`,
                store_id: storeId,
                legalBusinessName: taxInfo?.legal_business_name || 'Sample Technology Co., Ltd.',
                businessAddress: {
                    street: '123 Business Street',
                    suite: 'Suite 456',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94105',
                    country: 'United States'
                },
                taxInformation: {
                    status: taxInfo?.tax_information_complete ? 'Complete' : 'Pending',
                    taxId: taxInfo?.vat_registration_number || '12-3456789',
                    taxClassification: 'LLC'
                },
                businessType: 'Limited Liability Company',
                registrationDate: '2023-01-15',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }
        else {
            if (taxInfo) {
                legalEntity = {
                    ...legalEntity,
                    legalBusinessName: taxInfo.legal_business_name || legalEntity.legalBusinessName,
                    taxInformation: {
                        ...legalEntity.taxInformation,
                        status: taxInfo.tax_information_complete ? 'Complete' : 'Pending',
                        taxId: taxInfo.vat_registration_number || legalEntity.taxInformation.taxId,
                    },
                    updated_at: taxInfo.updated_at || legalEntity.updated_at
                };
                if (taxInfo.place_of_establishment) {
                    const addressParts = taxInfo.place_of_establishment.split(',').map((part) => part.trim());
                    if (addressParts.length >= 2) {
                        const street = addressParts[0] || legalEntity.businessAddress.street;
                        let suite = '';
                        let city = '';
                        let state = '';
                        let zipCode = '';
                        let country = '';
                        if (addressParts.length >= 4) {
                            suite = addressParts[1] || '';
                            city = addressParts[2] || '';
                            const stateZipCountry = addressParts.slice(3).join(', ');
                            const lastCommaIndex = stateZipCountry.lastIndexOf(',');
                            if (lastCommaIndex > -1) {
                                const stateZip = stateZipCountry.substring(0, lastCommaIndex).trim();
                                country = stateZipCountry.substring(lastCommaIndex + 1).trim();
                                const stateZipMatch = stateZip.match(/^(.+?)\s+(\d{5,}|\w{3,}\s*\w{3,})$/);
                                if (stateZipMatch) {
                                    state = stateZipMatch[1];
                                    zipCode = stateZipMatch[2];
                                }
                                else {
                                    state = stateZip;
                                }
                            }
                            else {
                                state = stateZipCountry;
                            }
                        }
                        else if (addressParts.length === 3) {
                            city = addressParts[1] || '';
                            country = addressParts[2] || '';
                        }
                        else {
                            country = addressParts[1] || '';
                        }
                        legalEntity.businessAddress = {
                            street: street,
                            suite: suite || legalEntity.businessAddress.suite,
                            city: city || legalEntity.businessAddress.city,
                            state: state || legalEntity.businessAddress.state,
                            zipCode: zipCode || legalEntity.businessAddress.zipCode,
                            country: country || legalEntity.businessAddress.country,
                        };
                    }
                }
            }
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
        try {
            const taxInfoData = readTaxInfoData();
            const taxInfoIndex = taxInfoData.findIndex((info) => info.store_id === storeId);
            const updatedTaxInfo = {
                id: `tax-info-${storeId}`,
                store_id: storeId,
                legal_business_name: updatedLegalEntity.legalBusinessName,
                place_of_establishment: `${updatedLegalEntity.businessAddress.street}, ${updatedLegalEntity.businessAddress.city}, ${updatedLegalEntity.businessAddress.state} ${updatedLegalEntity.businessAddress.zipCode}, ${updatedLegalEntity.businessAddress.country}`,
                vat_registration_number: updatedLegalEntity.taxInformation.taxId,
                rfc_id: '',
                tax_interview_completed: updatedLegalEntity.taxInformation.status === 'Complete',
                tax_information_complete: updatedLegalEntity.taxInformation.status === 'Complete',
                updated_at: new Date().toISOString()
            };
            if (taxInfoIndex >= 0) {
                updatedTaxInfo.created_at = taxInfoData[taxInfoIndex].created_at;
                taxInfoData[taxInfoIndex] = updatedTaxInfo;
            }
            else {
                updatedTaxInfo.created_at = new Date().toISOString();
                taxInfoData.push(updatedTaxInfo);
            }
            const taxInfoPath = (0, path_1.join)(process.cwd(), 'data', 'tax_info.json');
            require('fs').writeFileSync(taxInfoPath, JSON.stringify(taxInfoData, null, 2));
            console.log('Tax info synchronized with legal entity update');
        }
        catch (taxError) {
            console.error('Error synchronizing tax info:', taxError);
        }
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
