"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = require("path");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const TAX_INFO_FILE = (0, path_1.join)(process.cwd(), 'data', 'tax_info.json');
const TaxInfoSchema = zod_1.z.object({
    legal_business_name: zod_1.z.string().optional(),
    place_of_establishment: zod_1.z.string().optional(),
    vat_registration_number: zod_1.z.string().optional(),
    rfc_id: zod_1.z.string().optional(),
    tax_interview_completed: zod_1.z.boolean().optional(),
    tax_information_complete: zod_1.z.boolean().optional(),
});
const readTaxInfoData = () => {
    try {
        const data = (0, fs_1.readFileSync)(TAX_INFO_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading tax info data:', error);
        return [];
    }
};
const writeTaxInfoData = (data) => {
    try {
        (0, fs_1.writeFileSync)(TAX_INFO_FILE, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error('Error writing tax info data:', error);
        throw error;
    }
};
router.get('/:storeId', (req, res) => {
    try {
        const { storeId } = req.params;
        const taxInfoData = readTaxInfoData();
        const taxInfo = taxInfoData.find((info) => info.store_id === storeId);
        if (!taxInfo) {
            const defaultTaxInfo = {
                id: `tax-info-${storeId}`,
                store_id: storeId,
                legal_business_name: '',
                place_of_establishment: '',
                vat_registration_number: '',
                rfc_id: '',
                tax_interview_completed: false,
                tax_information_complete: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            return res.json({
                success: true,
                data: defaultTaxInfo
            });
        }
        res.json({
            success: true,
            data: taxInfo
        });
    }
    catch (error) {
        console.error('Error getting tax info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get tax info'
        });
    }
});
router.put('/:storeId', (req, res) => {
    try {
        const { storeId } = req.params;
        const validationResult = TaxInfoSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tax info data',
                errors: validationResult.error.errors
            });
        }
        const taxInfoData = readTaxInfoData();
        const existingIndex = taxInfoData.findIndex((info) => info.store_id === storeId);
        const updatedTaxInfo = {
            id: `tax-info-${storeId}`,
            store_id: storeId,
            ...validationResult.data,
            updated_at: new Date().toISOString()
        };
        if (existingIndex >= 0) {
            updatedTaxInfo.created_at = taxInfoData[existingIndex].created_at;
            taxInfoData[existingIndex] = updatedTaxInfo;
        }
        else {
            updatedTaxInfo.created_at = new Date().toISOString();
            taxInfoData.push(updatedTaxInfo);
        }
        writeTaxInfoData(taxInfoData);
        res.json({
            success: true,
            data: updatedTaxInfo,
            message: 'Tax info updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating tax info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tax info'
        });
    }
});
exports.default = router;
