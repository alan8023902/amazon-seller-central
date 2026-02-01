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
    try {
        const chartDataPath = require('path').join(__dirname, '../../data/chart_data.json');
        let chartData = [];
        try {
            const allChartData = require('fs-extra').readJsonSync(chartDataPath);
            chartData = allChartData.filter((item) => item.store_id === storeId);
            if (startDate && endDate && chartData.length > 0) {
                chartData = chartData.filter((item) => {
                    const itemDate = new Date(item.date);
                    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
                });
            }
            if (chartData.length > 0) {
                console.log(`Using admin-configured chart data for store ${storeId}: ${chartData.length} entries`);
                const sortedData = chartData
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((item) => ({
                    date: item.date,
                    units: item.units,
                    sales: item.sales,
                    lastYearUnits: item.lastYearUnits,
                    lastYearSales: item.lastYearSales,
                }));
                const response = {
                    success: true,
                    data: sortedData,
                };
                res.json(response);
                return;
            }
        }
        catch (error) {
            console.log('No admin chart data file found, using fallback generation');
        }
        let dailySales = await dataService_1.dataService.findByStoreId('daily_sales', storeId);
        if (!dailySales || dailySales.length < 100) {
            console.log('Generating spiky chart data for store:', storeId);
            const chartData = [];
            const startGenDate = new Date('2025-01-01');
            const endGenDate = new Date('2026-01-31');
            let currentDate = new Date(startGenDate);
            while (currentDate <= endGenDate) {
                const baseUnit = 500;
                const baseSales = 50000;
                const variance = 1.2;
                const spikeMultiplier = Math.random() < 0.1 ? (2 + Math.random() * 2) : 1;
                chartData.push({
                    date: currentDate.toISOString().split('T')[0],
                    units: Math.floor(baseUnit * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                    sales: Math.floor(baseSales * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                    lastYearUnits: Math.floor(baseUnit * 0.9 * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                    lastYearSales: Math.floor(baseSales * 0.9 * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            const response = {
                success: true,
                data: chartData,
            };
            res.json(response);
            return;
        }
        if (startDate && endDate) {
            dailySales = dailySales.filter(sale => {
                const saleDate = new Date(sale.sale_date);
                return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
            });
        }
        const formattedChartData = dailySales
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
            data: formattedChartData,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Chart data error:', error);
        throw (0, errorHandler_1.createError)('Failed to fetch chart data', 500);
    }
}));
router.post('/admin/sales-data', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { store_id, date, units, sales, lastYearUnits, lastYearSales } = req.body;
    if (!store_id || !date || units === undefined || sales === undefined) {
        throw (0, errorHandler_1.createError)('Missing required fields', 400);
    }
    try {
        const filePath = require('path').join(__dirname, '../../data/chart_data.json');
        let chartData = [];
        try {
            chartData = require('fs-extra').readJsonSync(filePath);
        }
        catch (error) {
            console.log('Creating new chart data file');
        }
        const newEntry = {
            id: require('crypto').randomUUID(),
            store_id,
            date,
            units: Number(units),
            sales: Number(sales),
            lastYearUnits: Number(lastYearUnits || 0),
            lastYearSales: Number(lastYearSales || 0),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        chartData.push(newEntry);
        require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
        const response = {
            success: true,
            data: newEntry,
            message: 'Sales data created successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Create sales data error:', error);
        throw (0, errorHandler_1.createError)('Failed to create sales data', 500);
    }
}));
router.put('/admin/sales-data/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { store_id, date, units, sales, lastYearUnits, lastYearSales } = req.body;
    try {
        const filePath = require('path').join(__dirname, '../../data/chart_data.json');
        let chartData = require('fs-extra').readJsonSync(filePath);
        const index = chartData.findIndex((item) => item.id === id);
        if (index === -1) {
            throw (0, errorHandler_1.createError)('Sales data not found', 404);
        }
        chartData[index] = {
            ...chartData[index],
            store_id,
            date,
            units: Number(units),
            sales: Number(sales),
            lastYearUnits: Number(lastYearUnits || 0),
            lastYearSales: Number(lastYearSales || 0),
            updated_at: new Date().toISOString()
        };
        require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
        const response = {
            success: true,
            data: chartData[index],
            message: 'Sales data updated successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Update sales data error:', error);
        throw (0, errorHandler_1.createError)('Failed to update sales data', 500);
    }
}));
router.delete('/admin/sales-data/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    try {
        const filePath = require('path').join(__dirname, '../../data/chart_data.json');
        let chartData = require('fs-extra').readJsonSync(filePath);
        const index = chartData.findIndex((item) => item.id === id);
        if (index === -1) {
            throw (0, errorHandler_1.createError)('Sales data not found', 404);
        }
        chartData.splice(index, 1);
        require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
        const response = {
            success: true,
            message: 'Sales data deleted successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Delete sales data error:', error);
        throw (0, errorHandler_1.createError)('Failed to delete sales data', 500);
    }
}));
router.post('/admin/sales-data/generate/:storeId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { storeId } = req.params;
    try {
        const filePath = require('path').join(__dirname, '../../data/chart_data.json');
        let chartData = [];
        try {
            chartData = require('fs-extra').readJsonSync(filePath);
        }
        catch (error) {
            console.log('Creating new chart data file');
        }
        chartData = chartData.filter((item) => item.store_id !== storeId);
        const startDate = new Date('2025-01-01');
        const endDate = new Date('2026-01-31');
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const baseUnit = 500;
            const baseSales = 50000;
            const variance = 1.2;
            const spikeMultiplier = Math.random() < 0.1 ? (2 + Math.random() * 2) : 1;
            const newEntry = {
                id: require('crypto').randomUUID(),
                store_id: storeId,
                date: currentDate.toISOString().split('T')[0],
                units: Math.floor(baseUnit * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                sales: Math.floor(baseSales * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                lastYearUnits: Math.floor(baseUnit * 0.9 * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                lastYearSales: Math.floor(baseSales * 0.9 * (0.3 + Math.random() * variance * 2) * spikeMultiplier),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            chartData.push(newEntry);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
        const response = {
            success: true,
            message: `Generated ${chartData.filter((item) => item.store_id === storeId).length} sample data entries`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Generate sample data error:', error);
        throw (0, errorHandler_1.createError)('Failed to generate sample data', 500);
    }
}));
module.exports = router;
