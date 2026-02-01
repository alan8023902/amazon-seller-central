import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
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

  // Operational errors
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.name || 'Error',
      message: err.message
    });
    return;
  }

  // Programming errors - don't leak details
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};