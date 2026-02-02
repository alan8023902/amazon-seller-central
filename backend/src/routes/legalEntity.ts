import express, { Request, Response } from 'express';
import { dataService } from '../services/dataService';
import { LegalEntitySchema, type LegalEntity, type ApiResponse } from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateStoreAccess } from '../middleware/storeValidation';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = express.Router();

// Helper function to read tax info data
const readTaxInfoData = () => {
  try {
    const taxInfoPath = join(process.cwd(), 'data', 'tax_info.json');
    const data = readFileSync(taxInfoPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tax info data:', error);
    return [];
  }
};

// GET /api/legal-entity/:storeId - Get legal entity by store ID
router.get('/:storeId', validateStoreAccess, asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  
  try {
    const legalEntities = await dataService.readData<LegalEntity>('legal_entity');
    let legalEntity = legalEntities.find(le => le.store_id === storeId);
    
    // 读取税务信息数据
    const taxInfoData = readTaxInfoData();
    const taxInfo = taxInfoData.find((info: any) => info.store_id === storeId);
    
    if (!legalEntity) {
      // 如果没有找到legal entity，创建默认结构
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
    } else {
      // 如果找到了legal entity，用税务信息更新相关字段
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
        
        // 如果税务信息中有地址信息，也更新地址
        if (taxInfo.place_of_establishment) {
          // 改进的地址解析逻辑
          const addressParts = taxInfo.place_of_establishment.split(',').map((part: string) => part.trim());
          if (addressParts.length >= 2) {
            const street = addressParts[0] || legalEntity.businessAddress.street;
            let suite = '';
            let city = '';
            let state = '';
            let zipCode = '';
            let country = '';
            
            if (addressParts.length >= 4) {
              // Format: Street, Suite, City, State ZipCode, Country
              suite = addressParts[1] || '';
              city = addressParts[2] || '';
              const stateZipCountry = addressParts.slice(3).join(', ');
              const lastCommaIndex = stateZipCountry.lastIndexOf(',');
              if (lastCommaIndex > -1) {
                const stateZip = stateZipCountry.substring(0, lastCommaIndex).trim();
                country = stateZipCountry.substring(lastCommaIndex + 1).trim();
                
                // 尝试提取邮编
                const stateZipMatch = stateZip.match(/^(.+?)\s+(\d{5,}|\w{3,}\s*\w{3,})$/);
                if (stateZipMatch) {
                  state = stateZipMatch[1];
                  zipCode = stateZipMatch[2];
                } else {
                  state = stateZip;
                }
              } else {
                state = stateZipCountry;
              }
            } else if (addressParts.length === 3) {
              // Format: Street, City, Country
              city = addressParts[1] || '';
              country = addressParts[2] || '';
            } else {
              // Format: Street, Country
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
    
    const response: ApiResponse<LegalEntity> = {
      success: true,
      data: legalEntity,
      message: 'Legal entity retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching legal entity:', error);
    throw createError('Failed to fetch legal entity', 500);
  }
}));

// PUT /api/legal-entity/:storeId - Update legal entity by store ID
router.put('/:storeId', validateStoreAccess, asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  
  try {
    // Validate request body
    const legalEntityData = LegalEntitySchema.omit({ id: true, created_at: true }).parse({
      ...req.body,
      store_id: storeId,
      updated_at: new Date().toISOString()
    });
    
    const legalEntities = await dataService.readData<LegalEntity>('legal_entity');
    const existingIndex = legalEntities.findIndex(le => le.store_id === storeId);
    
    let updatedLegalEntity: LegalEntity;
    
    if (existingIndex >= 0) {
      // Update existing legal entity
      updatedLegalEntity = {
        ...legalEntities[existingIndex],
        ...legalEntityData,
        updated_at: new Date().toISOString()
      };
      
      legalEntities[existingIndex] = updatedLegalEntity;
    } else {
      // Create new legal entity
      updatedLegalEntity = {
        id: `legal-entity-${storeId}`,
        ...legalEntityData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      legalEntities.push(updatedLegalEntity);
    }
    
    await dataService.writeData('legal_entity', legalEntities);
    
    // 同时更新税务信息
    try {
      const taxInfoData = readTaxInfoData();
      const taxInfoIndex = taxInfoData.findIndex((info: any) => info.store_id === storeId);
      
      const updatedTaxInfo: any = {
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
      } else {
        updatedTaxInfo.created_at = new Date().toISOString();
        taxInfoData.push(updatedTaxInfo);
      }
      
      // 写入税务信息文件
      const taxInfoPath = join(process.cwd(), 'data', 'tax_info.json');
      require('fs').writeFileSync(taxInfoPath, JSON.stringify(taxInfoData, null, 2));
      
      console.log('Tax info synchronized with legal entity update');
    } catch (taxError) {
      console.error('Error synchronizing tax info:', taxError);
      // 不抛出错误，因为主要的legal entity更新已经成功
    }
    
    const response: ApiResponse<LegalEntity> = {
      success: true,
      data: updatedLegalEntity,
      message: 'Legal entity updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating legal entity:', error);
    throw createError('Failed to update legal entity', 500);
  }
}));

export = router;