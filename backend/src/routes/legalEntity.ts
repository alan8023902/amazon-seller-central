import express, { Request, Response } from 'express';
import { dataService } from '../services/dataService';
import { LegalEntitySchema, type LegalEntity, type ApiResponse } from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateStoreAccess } from '../middleware/storeValidation';

const router = express.Router();

// GET /api/legal-entity/:storeId - Get legal entity by store ID
router.get('/:storeId', validateStoreAccess, asyncHandler(async (req: Request, res: Response) => {
  const { storeId } = req.params;
  
  try {
    const legalEntities = await dataService.readData<LegalEntity>('legal_entity');
    const legalEntity = legalEntities.find(le => le.store_id === storeId);
    
    if (!legalEntity) {
      // Return default legal entity structure if not found
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
      
      const response: ApiResponse<typeof defaultLegalEntity> = {
        success: true,
        data: defaultLegalEntity,
        message: 'Default legal entity data returned'
      };
      
      return res.json(response);
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