"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: 'Invalid request data',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
        return;
    }
    if (err.isOperational) {
        res.status(err.statusCode || 500).json({
            success: false,
            error: err.name || 'Error',
            message: err.message
        });
        return;
    }
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Something went wrong'
    });
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
