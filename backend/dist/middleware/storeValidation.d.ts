import { Request, Response, NextFunction } from 'express';
import { Store } from '../types/index';
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
export declare const validateStoreAccess: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalStoreValidation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateStoreOwnership: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const extractStoreId: (req: Request) => string | null;
export declare const getStoreContext: (req: Request) => {
    storeId: string;
    store?: Store;
} | null;
export declare const withStoreContext: (handler: (req: Request, res: Response, storeId: string, store?: Store) => Promise<void> | void) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=storeValidation.d.ts.map