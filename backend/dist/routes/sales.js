"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const dataService_1 = require("../services/dataService");
const index_1 = require("../types/index");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
const toUtcDate = (date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
const addDaysUtc = (date, days) => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
};
const formatDate = (date) => date.toISOString().split('T')[0];
const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
};
const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};
const createRng = (seed) => {
    let state = seed >>> 0;
    return () => {
        state |= 0;
        state = (state + 0x6D2B79F5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
const buildWeights = (start, days, rng) => {
    const weights = [];
    for (let i = 0; i < days; i++) {
        const date = addDaysUtc(start, i);
        const dayOfWeek = date.getUTCDay();
        const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.9 : 1;
        const r1 = rng();
        const r2 = rng();
        const r3 = rng();
        const r4 = rng();
        const base = 0.05 + r1 * 4.95;
        const tail = Math.pow(r2, 1.8);
        const spread = 0.05 + tail * 12;
        const spike = r3 > 0.92 ? 6.2 : r3 < 0.1 ? 0.05 : 1;
        const dip = r4 > 0.88 ? 0.4 : 1;
        const r5 = rng();
        const nearZero = r5 < 0.06 ? 0.02 : 1;
        const weight = base * spread * spike * dip * nearZero * weekendFactor;
        weights.push(Math.max(0.002, Math.min(18, weight)));
    }
    return weights;
};
const allocateTotals = (total, weights) => {
    if (total <= 0 || weights.length === 0) {
        return weights.map(() => 0);
    }
    const sumWeights = weights.reduce((sum, w) => sum + w, 0);
    const raw = weights.map(w => (w / sumWeights) * total);
    const floors = raw.map(value => Math.floor(value));
    let remainder = total - floors.reduce((sum, value) => sum + value, 0);
    const fractions = raw
        .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
        .sort((a, b) => b.fraction - a.fraction);
    let cursor = 0;
    while (remainder > 0 && fractions.length > 0) {
        floors[fractions[cursor].index] += 1;
        remainder -= 1;
        cursor = (cursor + 1) % fractions.length;
    }
    return floors;
};
const generateDailySeries = (storeId, totalUnits, totalSales, days = 365) => {
    const end = toUtcDate(new Date());
    const start = addDaysUtc(end, -(days - 1));
    const seedBase = hashString(storeId || 'store');
    const randomSeed = (Date.now() ^ Math.floor(Math.random() * 1e9) ^ seedBase) >>> 0;
    const unitRng = createRng(randomSeed);
    const salesRng = createRng(randomSeed + 1013904223);
    const lastYearUnitRng = createRng(randomSeed + 2027808447);
    const lastYearSalesRng = createRng(randomSeed + 3101313841);
    const unitWeights = buildWeights(start, days, unitRng);
    const salesWeights = buildWeights(start, days, salesRng);
    const units = allocateTotals(Math.max(0, Math.round(totalUnits)), unitWeights);
    const sales = allocateTotals(Math.max(0, Math.round(totalSales)), salesWeights);
    const lastYearUnitsScale = 0.45 + lastYearUnitRng() * 0.45;
    const lastYearSalesScale = 0.4 + lastYearSalesRng() * 0.5;
    const lastYearUnitWeights = buildWeights(start, days, lastYearUnitRng);
    const lastYearSalesWeights = buildWeights(start, days, lastYearSalesRng);
    const lastYearUnits = allocateTotals(Math.max(0, Math.round(totalUnits * lastYearUnitsScale)), lastYearUnitWeights.map(w => w * (0.3 + lastYearUnitRng() * 2.2)));
    const lastYearSales = allocateTotals(Math.max(0, Math.round(totalSales * lastYearSalesScale)), lastYearSalesWeights.map(w => w * (0.3 + lastYearSalesRng() * 2.2)));
    const entries = [];
    for (let i = 0; i < days; i++) {
        const date = addDaysUtc(start, i);
        entries.push({
            date: formatDate(date),
            units: units[i],
            sales: sales[i],
            lastYearUnits: lastYearUnits[i],
            lastYearSales: lastYearSales[i],
        });
    }
    return { start, end, entries };
};
const saveChartDataForStore = (storeId, entries) => {
    const filePath = require('path').join(__dirname, '../../data/chart_data.json');
    const crypto = require('crypto');
    const fs = require('fs-extra');
    let chartData = [];
    try {
        chartData = fs.readJsonSync(filePath);
    }
    catch (error) {
        console.log('Creating new chart data file');
    }
    chartData = chartData.filter((item) => item.store_id !== storeId);
    const nowIso = new Date().toISOString();
    const newEntries = entries.map(item => ({
        id: crypto.randomUUID(),
        store_id: storeId,
        date: item.date,
        units: item.units,
        sales: item.sales,
        lastYearUnits: item.lastYearUnits,
        lastYearSales: item.lastYearSales,
        created_at: nowIso,
        updated_at: nowIso,
    }));
    chartData.push(...newEntries);
    fs.writeJsonSync(filePath, chartData, { spaces: 2 });
    return newEntries.length;
};
const saveDailySalesForStore = async (storeId, entries) => {
    const crypto = require('crypto');
    const existingData = await dataService_1.dataService.readData('daily_sales');
    const filteredData = existingData.filter(item => item.store_id !== storeId);
    const newEntries = entries.map(item => ({
        id: crypto.randomUUID(),
        store_id: storeId,
        sale_date: item.date,
        units_ordered: item.units,
        sales_amount: item.sales,
    }));
    await dataService_1.dataService.writeData('daily_sales', [...filteredData, ...newEntries]);
    return newEntries.length;
};
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
    try {
        const { entries } = generateDailySeries(storeId, snapshot.units_ordered || 0, snapshot.ordered_product_sales || 0);
        saveChartDataForStore(storeId, entries);
        await saveDailySalesForStore(storeId, entries);
    }
    catch (error) {
        console.error('Failed to generate Business Reports chart data:', error);
        throw (0, errorHandler_1.createError)('Failed to generate Business Reports chart data', 500);
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
        }
        catch (error) {
            console.log('No admin chart data file found, using fallback generation');
        }
        if (chartData.length && chartData.length < 300) {
            const snapshots = await dataService_1.dataService.findByStoreId('sales_snapshots', storeId);
            const snapshot = snapshots[0];
            const totalUnits = snapshot?.units_ordered ?? 192260;
            const totalSales = snapshot?.ordered_product_sales ?? 18657478;
            const { entries } = generateDailySeries(storeId, totalUnits, totalSales);
            saveChartDataForStore(storeId, entries);
            await saveDailySalesForStore(storeId, entries);
            chartData = entries.map(entry => ({
                date: entry.date,
                units: entry.units,
                sales: entry.sales,
                lastYearUnits: entry.lastYearUnits,
                lastYearSales: entry.lastYearSales,
            }));
        }
        if (!chartData.length) {
            const snapshots = await dataService_1.dataService.findByStoreId('sales_snapshots', storeId);
            const snapshot = snapshots[0];
            const totalUnits = snapshot?.units_ordered ?? 192260;
            const totalSales = snapshot?.ordered_product_sales ?? 18657478;
            const { entries } = generateDailySeries(storeId, totalUnits, totalSales);
            saveChartDataForStore(storeId, entries);
            await saveDailySalesForStore(storeId, entries);
            chartData = entries.map(entry => ({
                date: entry.date,
                units: entry.units,
                sales: entry.sales,
                lastYearUnits: entry.lastYearUnits,
                lastYearSales: entry.lastYearSales,
            }));
        }
        if (startDate && endDate) {
            chartData = chartData.filter((item) => {
                const itemDate = new Date(item.date);
                return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
            });
        }
        const hasLastYear = chartData.some((item) => (item.lastYearUnits || 0) > 0 || (item.lastYearSales || 0) > 0);
        if (startDate && endDate && !hasLastYear) {
            chartData = chartData.map((item) => {
                const currentUnits = item.units || 0;
                const currentSales = item.sales || 0;
                const seed = new Date(item.date).getTime();
                const lastYearMultiplier = 0.85 + (seededRandom(seed) - 0.5) * 0.3;
                return {
                    ...item,
                    lastYearUnits: Math.max(0, Math.round(currentUnits * lastYearMultiplier)),
                    lastYearSales: Math.max(0, Math.round(currentSales * lastYearMultiplier)),
                };
            });
        }
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
        const snapshots = await dataService_1.dataService.findByStoreId('sales_snapshots', storeId);
        const snapshot = snapshots[0];
        const totalUnits = snapshot?.units_ordered ?? 192260;
        const totalSales = snapshot?.ordered_product_sales ?? 18657478;
        const { entries } = generateDailySeries(storeId, totalUnits, totalSales);
        saveChartDataForStore(storeId, entries);
        await saveDailySalesForStore(storeId, entries);
        const response = {
            success: true,
            message: `Generated ${entries.length} sample data entries`
        };
        res.json(response);
    }
    catch (error) {
        console.error('Generate sample data error:', error);
        throw (0, errorHandler_1.createError)('Failed to generate sample data', 500);
    }
}));
module.exports = router;
