import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class DataService {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory() {
    await fs.ensureDir(this.dataDir);
  }

  private getFilePath(filename: string): string {
    return path.join(this.dataDir, `${filename}.json`);
  }

  async readData<T>(filename: string): Promise<T[]> {
    try {
      const filePath = this.getFilePath(filename);
      const exists = await fs.pathExists(filePath);
      
      if (!exists) {
        await this.writeData(filename, []);
        return [];
      }
      
      const data = await fs.readJson(filePath);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  async writeData<T>(filename: string, data: T[]): Promise<void> {
    try {
      const filePath = this.getFilePath(filename);
      await fs.writeJson(filePath, data, { spaces: 2 });
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      throw error;
    }
  }

  async findById<T extends { id?: string }>(filename: string, id: string): Promise<T | null> {
    const data = await this.readData<T>(filename);
    return data.find(item => item.id === id) || null;
  }

  async findByStoreId<T extends { id?: string; store_id?: string }>(filename: string, storeId: string): Promise<T[]> {
    const data = await this.readData<T>(filename);
    return data.filter((item: any) => item.store_id === storeId);
  }

  async create<T extends { id?: string }>(filename: string, item: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const data = await this.readData<T>(filename);
    const newItem = {
      ...item,
      id: item.id || uuidv4(),
    } as T;
    
    data.push(newItem);
    await this.writeData(filename, data);
    return newItem;
  }

  async update<T extends { id?: string }>(filename: string, id: string, updates: Partial<T>): Promise<T | null> {
    const data = await this.readData<T>(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    data[index] = { ...data[index], ...updates };
    await this.writeData(filename, data);
    return data[index];
  }

  async delete<T extends { id?: string }>(filename: string, id: string): Promise<boolean> {
    const data = await this.readData<T>(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    data.splice(index, 1);
    await this.writeData(filename, data);
    return true;
  }

  async paginate<T>(
    data: T[], 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: data.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  // ============================================
  // Store-Aware Operations
  // ============================================

  /**
   * Read data filtered by store ID
   * @param collection Collection name (filename without .json)
   * @param storeId Store ID to filter by
   * @returns Array of items belonging to the specified store
   */
  async readStoreData<T extends { store_id: string }>(
    collection: string, 
    storeId: string
  ): Promise<T[]> {
    const allData = await this.readData<T>(collection);
    return allData.filter(item => item.store_id === storeId);
  }

  /**
   * Create data with store association
   * @param collection Collection name
   * @param data Data to create (must include store_id)
   * @returns Created item with generated ID and timestamps
   */
  async createStoreData<T extends { store_id: string; id?: string; created_at?: string; updated_at?: string }>(
    collection: string,
    data: Omit<T, 'id' | 'created_at' | 'updated_at'> & { store_id: string }
  ): Promise<T> {
    const timestamp = new Date().toISOString();
    const newItem = {
      ...data,
      id: uuidv4(),
      created_at: timestamp,
      updated_at: timestamp,
    } as T;

    const allData = await this.readData<T>(collection);
    allData.push(newItem);
    await this.writeData(collection, allData);
    
    return newItem;
  }

  /**
   * Update data with store validation
   * @param collection Collection name
   * @param id Item ID to update
   * @param storeId Store ID for validation
   * @param updates Partial updates to apply
   * @returns Updated item or null if not found or store mismatch
   */
  async updateStoreData<T extends { store_id: string; id: string; updated_at?: string }>(
    collection: string,
    id: string,
    storeId: string,
    updates: Partial<T>
  ): Promise<T | null> {
    const allData = await this.readData<T>(collection);
    const index = allData.findIndex(item => item.id === id && item.store_id === storeId);
    
    if (index === -1) return null;
    
    allData[index] = {
      ...allData[index],
      ...updates,
      updated_at: new Date().toISOString(),
    } as T;
    
    await this.writeData(collection, allData);
    return allData[index];
  }

  /**
   * Delete data with store validation
   * @param collection Collection name
   * @param id Item ID to delete
   * @param storeId Store ID for validation
   * @returns True if deleted, false if not found or store mismatch
   */
  async deleteStoreData<T extends { store_id: string; id: string }>(
    collection: string,
    id: string,
    storeId: string
  ): Promise<boolean> {
    const allData = await this.readData<T>(collection);
    const index = allData.findIndex(item => item.id === id && item.store_id === storeId);
    
    if (index === -1) return false;
    
    allData.splice(index, 1);
    await this.writeData(collection, allData);
    return true;
  }

  /**
   * Bulk create store data
   * @param collection Collection name
   * @param items Array of items to create (must include store_id)
   * @returns Array of created items with generated IDs and timestamps
   */
  async bulkCreateStoreData<T extends { store_id: string; id?: string; created_at?: string; updated_at?: string }>(
    collection: string,
    items: Array<Omit<T, 'id' | 'created_at' | 'updated_at'> & { store_id: string }>
  ): Promise<T[]> {
    const timestamp = new Date().toISOString();
    const newItems = items.map(item => ({
      ...item,
      id: uuidv4(),
      created_at: timestamp,
      updated_at: timestamp,
    })) as T[];

    const allData = await this.readData<T>(collection);
    allData.push(...newItems);
    await this.writeData(collection, allData);
    
    return newItems;
  }

  /**
   * Bulk update store data
   * @param collection Collection name
   * @param storeId Store ID for validation
   * @param updates Array of updates with id and partial data
   * @returns Array of updated items
   */
  async bulkUpdateStoreData<T extends { store_id: string; id: string; updated_at?: string }>(
    collection: string,
    storeId: string,
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<T[]> {
    const allData = await this.readData<T>(collection);
    const updatedItems: T[] = [];
    const timestamp = new Date().toISOString();

    for (const update of updates) {
      const index = allData.findIndex(item => item.id === update.id && item.store_id === storeId);
      if (index !== -1) {
        allData[index] = {
          ...allData[index],
          ...update.data,
          updated_at: timestamp,
        } as T;
        updatedItems.push(allData[index]);
      }
    }

    await this.writeData(collection, allData);
    return updatedItems;
  }

  /**
   * Bulk delete store data
   * @param collection Collection name
   * @param storeId Store ID for validation
   * @param ids Array of item IDs to delete
   * @returns Number of items deleted
   */
  async bulkDeleteStoreData<T extends { store_id: string; id: string }>(
    collection: string,
    storeId: string,
    ids: string[]
  ): Promise<number> {
    const allData = await this.readData<T>(collection);
    let deletedCount = 0;

    // Delete in reverse order to maintain indices
    for (let i = allData.length - 1; i >= 0; i--) {
      const item = allData[i];
      if (ids.includes(item.id) && item.store_id === storeId) {
        allData.splice(i, 1);
        deletedCount++;
      }
    }

    await this.writeData(collection, allData);
    return deletedCount;
  }

  /**
   * Delete all data for a specific store (used when deleting a store)
   * @param collection Collection name
   * @param storeId Store ID to delete all data for
   * @returns Number of items deleted
   */
  async deleteAllStoreData<T extends { store_id: string }>(
    collection: string,
    storeId: string
  ): Promise<number> {
    const allData = await this.readData<T>(collection);
    const initialCount = allData.length;
    const filteredData = allData.filter(item => item.store_id !== storeId);
    
    await this.writeData(collection, filteredData);
    return initialCount - filteredData.length;
  }

  /**
   * Get store data statistics
   * @param collection Collection name
   * @param storeId Store ID
   * @returns Statistics object with counts and other metrics
   */
  async getStoreDataStats<T extends { store_id: string; created_at?: string }>(
    collection: string,
    storeId: string
  ): Promise<{
    total: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
  }> {
    const storeData = await this.readStoreData<T>(collection, storeId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: storeData.length,
      createdToday: storeData.filter(item => 
        item.created_at && new Date(item.created_at) >= today
      ).length,
      createdThisWeek: storeData.filter(item => 
        item.created_at && new Date(item.created_at) >= weekAgo
      ).length,
      createdThisMonth: storeData.filter(item => 
        item.created_at && new Date(item.created_at) >= monthAgo
      ).length,
    };
  }

  /**
   * Paginate store-specific data
   * @param collection Collection name
   * @param storeId Store ID
   * @param page Page number (1-based)
   * @param limit Items per page
   * @returns Paginated store data
   */
  async paginateStoreData<T extends { store_id: string }>(
    collection: string,
    storeId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const storeData = await this.readStoreData<T>(collection, storeId);
    return this.paginate(storeData, page, limit);
  }
}

export const dataService = new DataService();