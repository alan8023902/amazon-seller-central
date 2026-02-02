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
    
    // 同时更新Legal Entity数据
    try {
      const legalEntityPath = join(process.cwd(), 'data', 'legal_entity.json');
      let legalEntities = [];
      
      try {
        const legalEntityData = readFileSync(legalEntityPath, 'utf-8');
        legalEntities = JSON.parse(legalEntityData);
      } catch (error) {
        console.log('Legal entity file not found, creating new one');
      }
      
      const legalEntityIndex = legalEntities.findIndex((le: any) => le.store_id === storeId);
      
      // 解析地址字符串
      let addressParts = { street: '', suite: '', city: '', state: '', zipCode: '', country: '' };
      if (updatedTaxInfo.place_of_establishment) {
        const parts = updatedTaxInfo.place_of_establishment.split(',').map((part: string) => part.trim());
        if (parts.length >= 2) {
          addressParts.street = parts[0] || '';
          
          if (parts.length >= 4) {
            // Format: Street, Suite, City, State ZipCode, Country
            addressParts.suite = parts[1] || '';
            addressParts.city = parts[2] || '';
            const stateZipCountry = parts.slice(3).join(', ');
            const lastCommaIndex = stateZipCountry.lastIndexOf(',');
            if (lastCommaIndex > -1) {
              const stateZip = stateZipCountry.substring(0, lastCommaIndex).trim();
              addressParts.country = stateZipCountry.substring(lastCommaIndex + 1).trim();
              
              // 尝试提取邮编
              const stateZipMatch = stateZip.match(/^(.+?)\s+(\d{5,}|\w{3,}\s*\w{3,})$/);
              if (stateZipMatch) {
                addressParts.state = stateZipMatch[1];
                addressParts.zipCode = stateZipMatch[2];
              } else {
                addressParts.state = stateZip;
              }
            } else {
              addressParts.state = stateZipCountry;
            }
          } else if (parts.length === 3) {
            // Format: Street, City, Country
            addressParts.city = parts[1] || '';
            addressParts.country = parts[2] || '';
          } else {
            // Format: Street, Country
            addressParts.country = parts[1] || '';
          }
        }
      }
      
      const updatedLegalEntity: any = {
        id: `legal-entity-${storeId}`,
        store_id: storeId,
        legalBusinessName: updatedTaxInfo.legal_business_name || 'Sample Technology Co., Ltd.',
        businessAddress: {
          street: addressParts.street || '123 Business Street',
          suite: addressParts.suite || 'Suite 456',
          city: addressParts.city || 'San Francisco',
          state: addressParts.state || 'CA',
          zipCode: addressParts.zipCode || '94105',
          country: addressParts.country || 'United States'
        },
        taxInformation: {
          status: updatedTaxInfo.tax_information_complete ? 'Complete' : 'Pending',
          taxId: updatedTaxInfo.vat_registration_number || '12-3456789',
          taxClassification: 'LLC'
        },
        businessType: 'Limited Liability Company',
        registrationDate: '2023-01-15',
        updated_at: updatedTaxInfo.updated_at
      };
      
      if (legalEntityIndex >= 0) {
        // 保留原有的一些字段
        const existingEntity = legalEntities[legalEntityIndex];
        updatedLegalEntity.created_at = existingEntity.created_at;
        updatedLegalEntity.businessType = existingEntity.businessType || updatedLegalEntity.businessType;
        updatedLegalEntity.registrationDate = existingEntity.registrationDate || updatedLegalEntity.registrationDate;
        updatedLegalEntity.taxInformation.taxClassification = existingEntity.taxInformation?.taxClassification || updatedLegalEntity.taxInformation.taxClassification;
        
        legalEntities[legalEntityIndex] = updatedLegalEntity;
      } else {
        updatedLegalEntity.created_at = new Date().toISOString();
        legalEntities.push(updatedLegalEntity);
      }
      
      writeFileSync(legalEntityPath, JSON.stringify(legalEntities, null, 2));
      console.log('Legal entity synchronized with tax info update');
    } catch (legalEntityError) {
      console.error('Error synchronizing legal entity:', legalEntityError);
      // 不抛出错误，因为主要的税务信息更新已经成功
    }
    
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