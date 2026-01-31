import express from 'express';
import { dataService } from '../services/dataService';
import { asyncHandler } from '../middleware/errorHandler';
import type { ApiResponse } from '../types/index';

const router = express.Router();

// GET /api/selling-applications/:storeId - Get selling applications by store
router.get('/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  const sellingApplications = await dataService.readData('selling_applications');
  const storeApplications = sellingApplications.filter((app: any) => app.store_id === storeId);
  
  const response: ApiResponse = {
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

// PUT /api/selling-applications/:storeId - Update selling applications
router.put('/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const updateData = req.body;
  
  const sellingApplications = await dataService.readData('selling_applications');
  const existingIndex = sellingApplications.findIndex((app: any) => app.store_id === storeId);
  
  let updatedApplication;
  if (existingIndex >= 0) {
    // Update existing
    const existingApp = sellingApplications[existingIndex] as any;
    sellingApplications[existingIndex] = {
      ...existingApp,
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    updatedApplication = sellingApplications[existingIndex];
  } else {
    // Create new
    updatedApplication = {
      id: `sa-${storeId}`,
      store_id: storeId,
      ...updateData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    sellingApplications.push(updatedApplication);
  }
  
  await dataService.writeData('selling_applications', sellingApplications);
  
  const response: ApiResponse = {
    success: true,
    data: updatedApplication,
    message: 'Selling applications updated successfully',
  };
  
  res.json(response);
}));

export = router;