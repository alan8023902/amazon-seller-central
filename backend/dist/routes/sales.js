"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const index_1 = require("../types/index");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { store_id } = req.query;
    if (!store_id) {
        throw (0, errorHandler_1.createError)('store_id query parameter is required', 400);
    }
    let snapshots = await dataService_1.dataService.findByStoreId('sales_snapshots', store_id);
    let snapshot = snapshots[0];
    if (!snapshot) {
        snapshot = await dataService_1.dataService.create('sales_snapshots', {
            store_id: store_id,
            total_order_items: 248,
            units_ordered: 192260,
            ordered_product_sales: 18657478,
            avg_units_per_order: 1.14,
            avg_sales_per_order: 110.29,
            snapshot_time: new Date().toISOString(),
        });
    }
    const response = {
        success: true,
        data: snapshot,
    };
    res.json(response);
}));
router.get('/snapshot/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    let snapshots = await dataService_1.dataService.findByStoreId('sales_snapshots', storeId);
    let snapshot = snapshots[0];
    if (!snapshot) {
        snapshot = await dataService_1.dataService.create('sales_snapshots', {
            store_id: storeId,
            total_order_items: 248,
            units_ordered: 192260,
            ordered_product_sales: 18657478,
            avg_units_per_order: 1.14,
            avg_sales_per_order: 110.29,
            snapshot_time: new Date().toISOString(),
        });
    }
    const response = {
        success: true,
        data: snapshot,
    };
    res.json(response);
}));
router.put('/snapshot/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const updateData = index_1.SalesSnapshotSchema.partial().parse({
        ...req.body,
        snapshot_time: new Date().toISOString(),
    });
    let snapshots = await dataService_1.dataService.findByStoreId('sales_snapshots', storeId);
    let snapshot = snapshots[0];
    if (!snapshot) {
        snapshot = await dataService_1.dataService.create('sales_snapshots', {
            store_id: storeId,
            total_order_items: updateData.total_order_items || 0,
            units_ordered: updateData.units_ordered || 0,
            ordered_product_sales: updateData.ordered_product_sales || 0,
            avg_units_per_order: updateData.avg_units_per_order || 0,
            avg_sales_per_order: updateData.avg_sales_per_order || 0,
            snapshot_time: new Date().toISOString(),
        });
    }
    else {
        const updatedSnapshot = await dataService_1.dataService.update('sales_snapshots', snapshot.id, updateData);
        if (!updatedSnapshot) {
            throw (0, errorHandler_1.createError)('Failed to update sales snapshot', 500);
        }
        snapshot = updatedSnapshot;
    }
    if (!snapshot) {
        throw (0, errorHandler_1.createError)('Failed to update sales snapshot', 500);
    }
    const response = {
        success: true,
        data: snapshot,
        message: 'Sales snapshot updated successfully',
    };
    res.json(response);
}));
router.get('/daily/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { startDate, endDate } = req.query;
    let dailySales = await dataService_1.dataService.findByStoreId('daily_sales', storeId);
    if (startDate && endDate) {
        dailySales = dailySales.filter(sale => {
            const saleDate = new Date(sale.sale_date);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
    }
    dailySales.sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime());
    const response = {
        success: true,
        data: dailySales,
    };
    res.json(response);
}));
router.post('/generate-daily/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { startDate, endDate, totalSales, totalUnits, volatility = 0.3 } = req.body;
    if (!startDate || !endDate || !totalSales || !totalUnits) {
        throw (0, errorHandler_1.createError)('Missing required parameters: startDate, endDate, totalSales, totalUnits', 400);
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const existingData = await dataService_1.dataService.findByStoreId('daily_sales', storeId);
    const filteredData = existingData.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate < start || saleDate > end;
    });
    const avgSales = totalSales / days;
    const avgUnits = totalUnits / days;
    const generatedData = [];
    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const salesMultiplier = 1 + (Math.random() - 0.5) * volatility;
        const unitsMultiplier = 1 + (Math.random() - 0.5) * volatility;
        const dailySale = await dataService_1.dataService.create('daily_sales', {
            store_id: storeId,
            sale_date: date.toISOString().split('T')[0],
            sales_amount: Math.round(avgSales * salesMultiplier),
            units_ordered: Math.round(avgUnits * unitsMultiplier),
        });
        generatedData.push(dailySale);
    }
    const allData = [...filteredData, ...generatedData];
    await dataService_1.dataService.writeData('daily_sales', allData);
    const response = {
        success: true,
        data: generatedData,
        message: `Generated ${generatedData.length} days of sales data`,
    };
    res.json(response);
}));
router.get('/chart-data/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { startDate, endDate } = req.query;
    let dailySales = await dataService_1.dataService.findByStoreId('daily_sales', storeId);
    if (startDate && endDate) {
        dailySales = dailySales.filter(sale => {
            const saleDate = new Date(sale.sale_date);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
    }
    const chartData = dailySales
        .sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime())
        .map(sale => ({
        date: sale.sale_date,
        units: sale.units_ordered,
        sales: sale.sales_amount,
        lastYearUnits: Math.round(sale.units_ordered * (0.9 + Math.random() * 0.2)),
        lastYearSales: Math.round(sale.sales_amount * (0.9 + Math.random() * 0.2)),
    }));
    const response = {
        success: true,
        data: chartData,
    };
    res.json(response);
}));
router.get('/snapshot/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const filePath = require('path').join(__dirname, '../../data/sales_snapshots.json');
        const salesSnapshotsData = require('fs-extra').readJsonSync(filePath);
        let storeSnapshot = salesSnapshotsData.find((snapshot) => snapshot.store_id === storeId);
        if (!storeSnapshot) {
            console.log(`Creating default sales snapshot data for store: ${storeId}`);
            storeSnapshot = {
                id: require('crypto').randomUUID(),
                store_id: storeId,
                total_order_items: 154066,
                units_ordered: 174714,
                ordered_product_sales: 19701989.13,
                avg_units_per_order_item: 1.13,
                avg_sales_per_order_item: 127.88,
                snapshot_time: new Date().toISOString()
            };
            salesSnapshotsData.push(storeSnapshot);
            require('fs-extra').writeJsonSync(filePath, salesSnapshotsData, { spaces: 2 });
        }
        const response = {
            success: true,
            data: storeSnapshot,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Sales snapshot error:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch sales snapshot data', 500);
    }
}));
router.put('/snapshot/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    const { total_order_items, units_ordered, ordered_product_sales, avg_units_per_order_item, avg_sales_per_order_item, snapshot_time } = req.body;
    try {
        const filePath = require('path').join(__dirname, '../../data/sales_snapshots.json');
        const salesSnapshotsData = require('fs-extra').readJsonSync(filePath);
        const existingIndex = salesSnapshotsData.findIndex((snapshot) => snapshot.store_id === storeId);
        const updatedSnapshot = {
            id: existingIndex >= 0 ? salesSnapshotsData[existingIndex].id : require('crypto').randomUUID(),
            store_id: storeId,
            total_order_items: parseInt(total_order_items) || 0,
            units_ordered: parseInt(units_ordered) || 0,
            ordered_product_sales: parseFloat(ordered_product_sales) || 0,
            avg_units_per_order_item: parseFloat(avg_units_per_order_item) || 0,
            avg_sales_per_order_item: parseFloat(avg_sales_per_order_item) || 0,
            snapshot_time: snapshot_time || new Date().toISOString()
        };
        if (existingIndex >= 0) {
            salesSnapshotsData[existingIndex] = updatedSnapshot;
        }
        else {
            salesSnapshotsData.push(updatedSnapshot);
        }
        require('fs-extra').writeJsonSync(filePath, salesSnapshotsData, { spaces: 2 });
        const response = {
            success: true,
            data: updatedSnapshot,
            message: 'Sales snapshot data updated successfully',
        };
        res.json(response);
    }
    catch (error) {
        console.error('Sales snapshot update error:', error);
        throw (0, errorHandler_1.createError)('Failed to update sales snapshot data', 500);
    }
}));
module.exports = router;
