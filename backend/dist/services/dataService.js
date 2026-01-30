"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataService = exports.DataService = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class DataService {
    dataDir;
    constructor() {
        this.dataDir = path_1.default.join(__dirname, '../../data');
        this.ensureDataDirectory();
    }
    async ensureDataDirectory() {
        await fs_extra_1.default.ensureDir(this.dataDir);
    }
    getFilePath(filename) {
        return path_1.default.join(this.dataDir, `${filename}.json`);
    }
    async readData(filename) {
        try {
            const filePath = this.getFilePath(filename);
            const exists = await fs_extra_1.default.pathExists(filePath);
            if (!exists) {
                await this.writeData(filename, []);
                return [];
            }
            const data = await fs_extra_1.default.readJson(filePath);
            return Array.isArray(data) ? data : [];
        }
        catch (error) {
            console.error(`Error reading ${filename}:`, error);
            return [];
        }
    }
    async writeData(filename, data) {
        try {
            const filePath = this.getFilePath(filename);
            await fs_extra_1.default.writeJson(filePath, data, { spaces: 2 });
        }
        catch (error) {
            console.error(`Error writing ${filename}:`, error);
            throw error;
        }
    }
    async findById(filename, id) {
        const data = await this.readData(filename);
        return data.find(item => item.id === id) || null;
    }
    async findByStoreId(filename, storeId) {
        const data = await this.readData(filename);
        return data.filter((item) => item.store_id === storeId);
    }
    async create(filename, item) {
        const data = await this.readData(filename);
        const newItem = {
            ...item,
            id: item.id || (0, uuid_1.v4)(),
        };
        data.push(newItem);
        await this.writeData(filename, data);
        return newItem;
    }
    async update(filename, id, updates) {
        const data = await this.readData(filename);
        const index = data.findIndex(item => item.id === id);
        if (index === -1) {
            return null;
        }
        data[index] = { ...data[index], ...updates };
        await this.writeData(filename, data);
        return data[index];
    }
    async delete(filename, id) {
        const data = await this.readData(filename);
        const index = data.findIndex(item => item.id === id);
        if (index === -1) {
            return false;
        }
        data.splice(index, 1);
        await this.writeData(filename, data);
        return true;
    }
    async paginate(data, page = 1, limit = 10) {
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
    async readStoreData(collection, storeId) {
        const allData = await this.readData(collection);
        return allData.filter(item => item.store_id === storeId);
    }
    async createStoreData(collection, data) {
        const timestamp = new Date().toISOString();
        const newItem = {
            ...data,
            id: (0, uuid_1.v4)(),
            created_at: timestamp,
            updated_at: timestamp,
        };
        const allData = await this.readData(collection);
        allData.push(newItem);
        await this.writeData(collection, allData);
        return newItem;
    }
    async updateStoreData(collection, id, storeId, updates) {
        const allData = await this.readData(collection);
        const index = allData.findIndex(item => item.id === id && item.store_id === storeId);
        if (index === -1)
            return null;
        allData[index] = {
            ...allData[index],
            ...updates,
            updated_at: new Date().toISOString(),
        };
        await this.writeData(collection, allData);
        return allData[index];
    }
    async deleteStoreData(collection, id, storeId) {
        const allData = await this.readData(collection);
        const index = allData.findIndex(item => item.id === id && item.store_id === storeId);
        if (index === -1)
            return false;
        allData.splice(index, 1);
        await this.writeData(collection, allData);
        return true;
    }
    async bulkCreateStoreData(collection, items) {
        const timestamp = new Date().toISOString();
        const newItems = items.map(item => ({
            ...item,
            id: (0, uuid_1.v4)(),
            created_at: timestamp,
            updated_at: timestamp,
        }));
        const allData = await this.readData(collection);
        allData.push(...newItems);
        await this.writeData(collection, allData);
        return newItems;
    }
    async bulkUpdateStoreData(collection, storeId, updates) {
        const allData = await this.readData(collection);
        const updatedItems = [];
        const timestamp = new Date().toISOString();
        for (const update of updates) {
            const index = allData.findIndex(item => item.id === update.id && item.store_id === storeId);
            if (index !== -1) {
                allData[index] = {
                    ...allData[index],
                    ...update.data,
                    updated_at: timestamp,
                };
                updatedItems.push(allData[index]);
            }
        }
        await this.writeData(collection, allData);
        return updatedItems;
    }
    async bulkDeleteStoreData(collection, storeId, ids) {
        const allData = await this.readData(collection);
        let deletedCount = 0;
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
    async deleteAllStoreData(collection, storeId) {
        const allData = await this.readData(collection);
        const initialCount = allData.length;
        const filteredData = allData.filter(item => item.store_id !== storeId);
        await this.writeData(collection, filteredData);
        return initialCount - filteredData.length;
    }
    async getStoreDataStats(collection, storeId) {
        const storeData = await this.readStoreData(collection, storeId);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
            total: storeData.length,
            createdToday: storeData.filter(item => item.created_at && new Date(item.created_at) >= today).length,
            createdThisWeek: storeData.filter(item => item.created_at && new Date(item.created_at) >= weekAgo).length,
            createdThisMonth: storeData.filter(item => item.created_at && new Date(item.created_at) >= monthAgo).length,
        };
    }
    async paginateStoreData(collection, storeId, page = 1, limit = 10) {
        const storeData = await this.readStoreData(collection, storeId);
        return this.paginate(storeData, page, limit);
    }
}
exports.DataService = DataService;
exports.dataService = new DataService();
