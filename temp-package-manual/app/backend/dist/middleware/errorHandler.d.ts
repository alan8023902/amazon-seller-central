import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const errorHandler: (err: AppError | ZodError, req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode?: number) => AppError;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map