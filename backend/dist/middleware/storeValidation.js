"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withStoreContext = exports.getStoreContext = exports.extractStoreId = exports.validateStoreOwnership = exports.optionalStoreValidation = exports.validateStoreAccess = void 0;
const dataService_1 = require("../services/dataService");
const validateStoreAccess = async (req, res, next) => {
    try {
        const storeId = req.params.storeId ||
            req.body.store_id ||
            req.query.store_id ||
            req.headers['x-store-id'];
        if (!storeId) {
            res.status(400).json({
                success: false,
                error: 'Store ID is required',
                message: 'Please provide a store ID in the request parameters, body, query, or headers'
            });
            return;
        }
        if (typeof storeId !== 'string' || storeId.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'Invalid store ID format',
                message: 'Store ID must be a non-empty string'
            });
            return;
        }
        const stores = await dataService_1.dataService.readData('stores');
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
    }
    catch (error) {
        console.error('Store validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during store validation',
            message: 'An error occurred while validating store access'
        });
    }
};
exports.validateStoreAccess = validateStoreAccess;
const optionalStoreValidation = async (req, res, next) => {
    try {
        const storeId = req.params.storeId ||
            req.body.store_id ||
            req.query.store_id ||
            req.headers['x-store-id'];
        if (!storeId) {
            next();
            return;
        }
        if (typeof storeId !== 'string' || storeId.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'Invalid store ID format',
                message: 'Store ID must be a non-empty string'
            });
            return;
        }
        const stores = await dataService_1.dataService.readData('stores');
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
    }
    catch (error) {
        console.error('Optional store validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during store validation',
            message: 'An error occurred while validating store access'
        });
    }
};
exports.optionalStoreValidation = optionalStoreValidation;
const validateStoreOwnership = async (req, res, next) => {
    try {
        if (!req.storeContext) {
            res.status(400).json({
                success: false,
                error: 'Store context not found',
                message: 'Store validation middleware must run before ownership validation'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Store ownership validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during ownership validation',
            message: 'An error occurred while validating store ownership'
        });
    }
};
exports.validateStoreOwnership = validateStoreOwnership;
const extractStoreId = (req) => {
    return req.params.storeId ||
        req.body.store_id ||
        req.query.store_id ||
        req.headers['x-store-id'] ||
        null;
};
exports.extractStoreId = extractStoreId;
const getStoreContext = (req) => {
    return req.storeContext || null;
};
exports.getStoreContext = getStoreContext;
const withStoreContext = (handler) => {
    return async (req, res, next) => {
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
        }
        catch (error) {
            next(error);
        }
    };
};
exports.withStoreContext = withStoreContext;
