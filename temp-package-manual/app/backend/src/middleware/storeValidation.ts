/**
 * Store Validation Middleware
 * 
 * This middleware validates store access and adds store context to requests.
 * It ensures that API requests include valid store IDs and that the store exists.
 */

import { Request, Response, NextFunction } from 'express';
import { dataService } from '../services/dataService';
import { Store } from '../types/index';

// Extend Express Request interface to include store context
declare global {
  namespace Express {
    interface Request {
      storeContext?: {
        storeId: string;
        store?: Store;
      };
    }
  }
}

/**
 * Middleware to validate store access and add store context to request
 * 
 * This middleware:
 * 1. Extracts store ID from request parameters, body, or query
 * 2. Validates that the store ID is provided
 * 3. Checks that the store exists in the database
 * 4. Adds store context to the request object
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const validateStoreAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract store ID from various sources
    const storeId = req.params.storeId || 
                   req.body.store_id || 
                   req.query.store_id as string ||
                   req.headers['x-store-id'] as string;

    // Check if store ID is provided
    if (!storeId) {
      res.status(400).json({
        success: false,
        error: 'Store ID is required',
        message: 'Please provide a store ID in the request parameters, body, query, or headers'
      });
      return;
    }

    // Validate store ID format (should be a non-empty string)
    if (typeof storeId !== 'string' || storeId.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format',
        message: 'Store ID must be a non-empty string'
      });
      return;
    }

    // Check if store exists
    const stores = await dataService.readData<Store>('stores');
    const store = stores.find(s => s.id === storeId.trim());

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found',
        message: `Store with ID '${storeId}' does not exist`
      });
      return;
    }

    // Check if store is active
    if (!store.is_active) {
      res.status(403).json({
        success: false,
        error: 'Store is inactive',
        message: `Store '${store.name}' is currently inactive and cannot be accessed`
      });
      return;
    }

    // Add store context to request
    req.storeContext = {
      storeId: store.id,
      store: store
    };

    // Continue to next middleware
    next();

  } catch (error) {
    console.error('Store validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during store validation',
      message: 'An error occurred while validating store access'
    });
  }
};

/**
 * Optional middleware that validates store access but doesn't fail if no store ID is provided
 * Useful for endpoints that can work with or without store context
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const optionalStoreValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const storeId = req.params.storeId || 
                   req.body.store_id || 
                   req.query.store_id as string ||
                   req.headers['x-store-id'] as string;

    // If no store ID provided, continue without store context
    if (!storeId) {
      next();
      return;
    }

    // If store ID is provided, validate it
    if (typeof storeId !== 'string' || storeId.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid store ID format',
        message: 'Store ID must be a non-empty string'
      });
      return;
    }

    const stores = await dataService.readData<Store>('stores');
    const store = stores.find(s => s.id === storeId.trim());

    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Store not found',
        message: `Store with ID '${storeId}' does not exist`
      });
      return;
    }

    if (!store.is_active) {
      res.status(403).json({
        success: false,
        error: 'Store is inactive',
        message: `Store '${store.name}' is currently inactive and cannot be accessed`
      });
      return;
    }

    req.storeContext = {
      storeId: store.id,
      store: store
    };

    next();

  } catch (error) {
    console.error('Optional store validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during store validation',
      message: 'An error occurred while validating store access'
    });
  }
};

/**
 * Middleware to validate that the authenticated user has access to the specified store
 * This would be used in conjunction with authentication middleware
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const validateStoreOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This middleware assumes that store validation has already run
    if (!req.storeContext) {
      res.status(400).json({
        success: false,
        error: 'Store context not found',
        message: 'Store validation middleware must run before ownership validation'
      });
      return;
    }

    // In a real application, you would check if the authenticated user
    // has access to this store. For now, we'll just continue.
    // 
    // Example implementation:
    // const userId = req.user?.id;
    // const hasAccess = await checkUserStoreAccess(userId, req.storeContext.storeId);
    // 
    // if (!hasAccess) {
    //   res.status(403).json({
    //     success: false,
    //     error: 'Access denied',
    //     message: 'You do not have access to this store'
    //   });
    //   return;
    // }

    next();

  } catch (error) {
    console.error('Store ownership validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during ownership validation',
      message: 'An error occurred while validating store ownership'
    });
  }
};

/**
 * Utility function to extract store ID from request
 * 
 * @param req Express request object
 * @returns Store ID if found, null otherwise
 */
export const extractStoreId = (req: Request): string | null => {
  return req.params.storeId || 
         req.body.store_id || 
         req.query.store_id as string ||
         req.headers['x-store-id'] as string ||
         null;
};

/**
 * Utility function to get store context from request
 * 
 * @param req Express request object
 * @returns Store context if available, null otherwise
 */
export const getStoreContext = (req: Request): { storeId: string; store?: Store } | null => {
  return req.storeContext || null;
};

/**
 * Higher-order function to create store-specific route handlers
 * This ensures that all operations within the handler are scoped to the validated store
 * 
 * @param handler Route handler function that receives store context
 * @returns Express route handler with store validation
 */
export const withStoreContext = (
  handler: (req: Request, res: Response, storeId: string, store?: Store) => Promise<void> | void
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.storeContext) {
        res.status(400).json({
          success: false,
          error: 'Store context required',
          message: 'This endpoint requires store validation middleware'
        });
        return;
      }

      await handler(req, res, req.storeContext.storeId, req.storeContext.store);
    } catch (error) {
      next(error);
    }
  };
};