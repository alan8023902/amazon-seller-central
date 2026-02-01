export declare class DataService {
    private dataDir;
    constructor();
    private ensureDataDirectory;
    private getFilePath;
    readData<T>(filename: string): Promise<T[]>;
    writeData<T>(filename: string, data: T[]): Promise<void>;
    findById<T extends {
        id?: string;
    }>(filename: string, id: string): Promise<T | null>;
    findByStoreId<T extends {
        id?: string;
        store_id: string;
    }>(filename: string, storeId: string): Promise<T[]>;
    create<T extends {
        id?: string;
    }>(filename: string, item: Omit<T, 'id'> & {
        id?: string;
    }): Promise<T>;
    update<T extends {
        id?: string;
    }>(filename: string, id: string, updates: Partial<T>): Promise<T | null>;
    delete<T extends {
        id?: string;
    }>(filename: string, id: string): Promise<boolean>;
    paginate<T>(data: T[], page?: number, limit?: number): Promise<{
        data: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    readStoreData<T extends {
        store_id: string;
    }>(collection: string, storeId: string): Promise<T[]>;
    createStoreData<T extends {
        store_id: string;
        id?: string;
        created_at?: string;
        updated_at?: string;
    }>(collection: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'> & {
        store_id: string;
    }): Promise<T>;
    updateStoreData<T extends {
        store_id: string;
        id: string;
        updated_at?: string;
    }>(collection: string, id: string, storeId: string, updates: Partial<T>): Promise<T | null>;
    deleteStoreData<T extends {
        store_id: string;
        id: string;
    }>(collection: string, id: string, storeId: string): Promise<boolean>;
    bulkCreateStoreData<T extends {
        store_id: string;
        id?: string;
        created_at?: string;
        updated_at?: string;
    }>(collection: string, items: Array<Omit<T, 'id' | 'created_at' | 'updated_at'> & {
        store_id: string;
    }>): Promise<T[]>;
    bulkUpdateStoreData<T extends {
        store_id: string;
        id: string;
        updated_at?: string;
    }>(collection: string, storeId: string, updates: Array<{
        id: string;
        data: Partial<T>;
    }>): Promise<T[]>;
    bulkDeleteStoreData<T extends {
        store_id: string;
        id: string;
    }>(collection: string, storeId: string, ids: string[]): Promise<number>;
    deleteAllStoreData<T extends {
        store_id: string;
    }>(collection: string, storeId: string): Promise<number>;
    getStoreDataStats<T extends {
        store_id: string;
        created_at?: string;
    }>(collection: string, storeId: string): Promise<{
        total: number;
        createdToday: number;
        createdThisWeek: number;
        createdThisMonth: number;
    }>;
    paginateStoreData<T extends {
        store_id: string;
    }>(collection: string, storeId: string, page?: number, limit?: number): Promise<{
        data: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
export declare const dataService: DataService;
//# sourceMappingURL=dataService.d.ts.map