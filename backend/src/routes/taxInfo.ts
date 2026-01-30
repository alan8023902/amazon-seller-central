import { Router } from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

const router = Router();
const TAX_INFO_FILE = join(process.cwd(), 'data', 'tax_info.json');

// Tax Info schema
const TaxInfoSchema = z.object({
  legal_business_name: z.string().optional(),
  place_of_establishment: z.string().optional(),
  vat_registration_number: z.string().optional(),
  rfc_id: z.string().optional(),
  tax_interview_completed: z.boolean().optional(),
  tax_information_complete: z.boolean().optional(),
});

// Helper function to read tax info data
const readTaxInfoData = () => {
  try {
    const data = readFileSync(TAX_INFO_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tax info data:', error);
    return [];
  }
};

// Helper function to write tax info data
const writeTaxInfoData = (data: any[]) => {
  try {
    writeFileSync(TAX_INFO_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing tax info data:', error);
    throw error;
  }
};

// GET /api/tax-info/:storeId - Get tax info for a store
router.get('/:storeId', (req, res) => {
  try {
    const { storeId } = req.params;
    const taxInfoData = readTaxInfoData();
    
    const taxInfo = taxInfoData.find((info: any) => info.store_id === storeId);
    
    if (!taxInfo) {
      // Return default structure if not found
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
  } catch (error) {
    console.error('Error getting tax info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tax info'
    });
  }
});

// PUT /api/tax-info/:storeId - Update tax info for a store
router.put('/:storeId', (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Validate request body
    const validationResult = TaxInfoSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tax info data',
        errors: validationResult.error.errors
      });
    }
    
    const taxInfoData = readTaxInfoData();
    const existingIndex = taxInfoData.findIndex((info: any) => info.store_id === storeId);
    
    const updatedTaxInfo: any = {
      id: `tax-info-${storeId}`,
      store_id: storeId,
      ...validationResult.data,
      updated_at: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing
      updatedTaxInfo.created_at = taxInfoData[existingIndex].created_at;
      taxInfoData[existingIndex] = updatedTaxInfo;
    } else {
      // Create new
      updatedTaxInfo.created_at = new Date().toISOString();
      taxInfoData.push(updatedTaxInfo);
    }
    
    writeTaxInfoData(taxInfoData);
    
    res.json({
      success: true,
      data: updatedTaxInfo,
      message: 'Tax info updated successfully'
    });
  } catch (error) {
    console.error('Error updating tax info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tax info'
    });
  }
});

export default router;