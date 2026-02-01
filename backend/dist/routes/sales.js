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
    try {
        const chartDataPath = require('path').join(__dirname, '../../data/chart_data.json');
        let chartData = [];
        try {
            const allChartData = require('fs-extra').readJsonSync(chartDataPath);
            chartData = allChartData.filter((item) => item.store_id === storeId);
        }
        catch (error) {
            console.log('No chart data file found');
        }
        let snapshot;
        if (chartData.length > 0) {
            const totalUnits = chartData.reduce((sum, item) => sum + (item.units || 0), 0);
            const totalSales = chartData.reduce((sum, item) => sum + (item.sales || 0), 0);
            const totalOrders = chartData.length;
            snapshot = {
                store_id: storeId,
                total_order_items: Math.floor(totalUnits * 0.8),
                units_ordered: totalUnits,
                ordered_product_sales: totalSales,
                avg_units_per_order: totalOrders > 0 ? Number((totalUnits / totalOrders).toFixed(2)) : 0,
                avg_sales_per_order: totalOrders > 0 ? Number((totalSales / totalOrders).toFixed(2)) : 0,
                snapshot_time: new Date().toISOString(),
            };
            console.log(`Calculated snapshot from chart data for store ${storeId}:`, {
                totalUnits,
                totalSales,
                totalOrders,
                snapshot
            });
        }
        else {
            let snapshots = await dataService_1.dataService.findByStoreId('sales_snapshots', storeId);
            snapshot = snapshots[0];
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
        }
        const response = {
            success: true,
            data: snapshot,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Snapshot calculation error:', error);
        throw (0, errorHandler_1.createError)('Failed to calculate sales snapshot', 500);
    }
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
    const calculateYAxisTicks = (maxValue, defaultMax, defaultInterval) => {
        if (maxValue <= defaultMax) {
            const ticks = [];
            for (let i = 0; i <= 3; i++) {
                ticks.push(i * defaultInterval);
            }
            return {
                ticks,
                domain: [0, defaultMax]
            };
        }
        else {
            const targetMax = Math.ceil(maxValue * 1.1);
            const interval = Math.ceil(targetMax / 3);
            let niceInterval;
            if (interval <= 1000) {
                niceInterval = Math.ceil(interval / 100) * 100;
            }
            else if (interval <= 10000) {
                niceInterval = Math.ceil(interval / 1000) * 1000;
            }
            else {
                niceInterval = Math.ceil(interval / 10000) * 10000;
            }
            return {
                ticks: [0, niceInterval, niceInterval * 2, niceInterval * 3],
                domain: [0, niceInterval * 3]
            };
        }
    };
    try {
        const chartDataPath = require('path').join(__dirname, '../../data/chart_data.json');
        let chartData = [];
        try {
            const allChartData = require('fs-extra').readJsonSync(chartDataPath);
            chartData = allChartData.filter((item) => item.store_id === storeId);
            if (startDate && endDate && chartData.length > 0) {
                const filteredData = chartData.filter((item) => {
                    const itemDate = new Date(item.date);
                    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
                });
                const dataWithLastYear = filteredData.map((item) => {
                    const currentUnits = item.units || 0;
                    const currentSales = item.sales || 0;
                    const seed = new Date(item.date).getTime();
                    const seededRandom = (seed) => {
                        const x = Math.sin(seed) * 10000;
                        return x - Math.floor(x);
                    };
                    const lastYearMultiplier = 0.85 + (seededRandom(seed) - 0.5) * 0.3;
                    return {
                        ...item,
                        lastYearUnits: Math.max(250, Math.round(currentUnits * lastYearMultiplier)),
                        lastYearSales: Math.max(12000, Math.round(currentSales * lastYearMultiplier))
                    };
                });
                const thirteenMonthsStructure = [];
                const now = new Date();
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                for (let i = 12; i >= 0; i--) {
                    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const month = targetDate.getMonth();
                    const year = targetDate.getFullYear();
                    const yearShort = year.toString().slice(2);
                    const monthName = monthNames[month];
                    const monthLabel = `${monthName} '${yearShort}`;
                    const monthData = dataWithLastYear.find((item) => {
                        const itemDate = new Date(item.date);
                        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
                    });
                    if (monthData) {
                        thirteenMonthsStructure.push({
                            ...monthData,
                            name: monthLabel
                        });
                    }
                    else {
                        thirteenMonthsStructure.push({
                            name: monthLabel,
                            date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
                            units: 0,
                            sales: 0,
                            lastYearUnits: 0,
                            lastYearSales: 0
                        });
                    }
                }
                chartData = thirteenMonthsStructure;
            }
            if (chartData.length > 0) {
                console.log(`Using admin-configured chart data for store ${storeId}: ${chartData.length} entries`);
                const sortedData = chartData
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((item) => ({
                    date: item.date,
                    name: item.name,
                    units: item.units,
                    sales: item.sales,
                    lastYearUnits: item.lastYearUnits,
                    lastYearSales: item.lastYearSales,
                }));
                const maxUnits = Math.max(...sortedData.map((d) => Math.max(d.units || 0, d.lastYearUnits || 0)));
                const maxSales = Math.max(...sortedData.map((d) => Math.max(d.sales || 0, d.lastYearSales || 0)));
                const yAxisConfig = {
                    unitsConfig: calculateYAxisTicks(maxUnits, 7500, 2500),
                    salesConfig: calculateYAxisTicks(maxSales, 150000, 50000)
                };
                const response = {
                    success: true,
                    data: sortedData,
                    yAxisConfig,
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
            console.log('Generating daily chart data for store:', storeId);
            const chartData = [];
            const now = new Date();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const thirteenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
            const currentDate = new Date(thirteenMonthsAgo);
            while (currentDate <= now) {
                const month = currentDate.getMonth();
                const year = currentDate.getFullYear();
                const day = currentDate.getDate();
                const yearShort = year.toString().slice(2);
                const monthName = monthNames[month];
                const seed = year * 10000 + month * 100 + day;
                const seededRandom = (seed) => {
                    const x = Math.sin(seed) * 10000;
                    return x - Math.floor(x);
                };
                const baseUnits = 2000 + Math.sin(seed * 0.001) * 1500;
                const baseSales = 60000 + Math.sin(seed * 0.0008) * 35000;
                const unitsNoise = (seededRandom(seed) - 0.5) * 1500;
                const salesNoise = (seededRandom(seed + 1) - 0.5) * 40000;
                const spikeChance = seededRandom(seed + 2) < 0.15 ? (1.3 + seededRandom(seed + 3) * 0.7) : 1;
                const dayOfWeek = currentDate.getDay();
                const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
                const midWeekBoost = (dayOfWeek === 2 || dayOfWeek === 3) ? 1.2 : 1.0;
                const displayName = day === 1 ? `${monthName} '${yearShort}` : '';
                const currentUnits = Math.max(300, Math.round((baseUnits + unitsNoise) * spikeChance * weekendMultiplier * midWeekBoost));
                const currentSales = Math.max(15000, Math.round((baseSales + salesNoise) * spikeChance * weekendMultiplier * midWeekBoost));
                const lastYearSeed = (year - 1) * 10000 + month * 100 + day;
                const lastYearBaseUnits = 2000 + Math.sin(lastYearSeed * 0.001) * 1500;
                const lastYearBaseSales = 60000 + Math.sin(lastYearSeed * 0.0008) * 35000;
                const lastYearUnitsNoise = (seededRandom(lastYearSeed) - 0.5) * 1500;
                const lastYearSalesNoise = (seededRandom(lastYearSeed + 1) - 0.5) * 40000;
                const lastYearSpikeChance = seededRandom(lastYearSeed + 2) < 0.15 ? (1.3 + seededRandom(lastYearSeed + 3) * 0.7) : 1;
                const lastYearUnits = Math.max(250, Math.round((lastYearBaseUnits + lastYearUnitsNoise) * lastYearSpikeChance * weekendMultiplier * midWeekBoost));
                const lastYearSales = Math.max(12000, Math.round((lastYearBaseSales + lastYearSalesNoise) * lastYearSpikeChance * weekendMultiplier * midWeekBoost));
                chartData.push({
                    name: displayName,
                    date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                    units: currentUnits,
                    sales: currentSales,
                    lastYearUnits: lastYearUnits,
                    lastYearSales: lastYearSales
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            if (startDate && endDate) {
                const filteredData = chartData.filter((item) => {
                    const itemDate = new Date(item.date);
                    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
                });
                const dataWithLastYear = filteredData.map((item) => {
                    const currentUnits = item.units || 0;
                    const currentSales = item.sales || 0;
                    const seed = new Date(item.date).getTime();
                    const seededRandom = (seed) => {
                        const x = Math.sin(seed) * 10000;
                        return x - Math.floor(x);
                    };
                    const lastYearMultiplier = 0.85 + (seededRandom(seed) - 0.5) * 0.3;
                    return {
                        ...item,
                        lastYearUnits: Math.max(250, Math.round(currentUnits * lastYearMultiplier)),
                        lastYearSales: Math.max(12000, Math.round(currentSales * lastYearMultiplier))
                    };
                });
                const thirteenMonthsStructure = [];
                const now = new Date();
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                for (let i = 12; i >= 0; i--) {
                    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const month = targetDate.getMonth();
                    const year = targetDate.getFullYear();
                    const yearShort = year.toString().slice(2);
                    const monthName = monthNames[month];
                    const monthLabel = `${monthName} '${yearShort}`;
                    const monthData = dataWithLastYear.find((item) => {
                        const itemDate = new Date(item.date);
                        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
                    });
                    if (monthData) {
                        thirteenMonthsStructure.push({
                            ...monthData,
                            name: monthLabel
                        });
                    }
                    else {
                        thirteenMonthsStructure.push({
                            name: monthLabel,
                            date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
                            units: 0,
                            sales: 0,
                            lastYearUnits: 0,
                            lastYearSales: 0
                        });
                    }
                }
                const maxUnits = Math.max(...dataWithLastYear.map(d => Math.max(d.units || 0, d.lastYearUnits || 0)));
                const maxSales = Math.max(...dataWithLastYear.map(d => Math.max(d.sales || 0, d.lastYearSales || 0)));
                const yAxisConfigWithLastYear = {
                    unitsConfig: calculateYAxisTicks(maxUnits, 7500, 2500),
                    salesConfig: calculateYAxisTicks(maxSales, 150000, 50000)
                };
                console.log(`Filtered data for date range ${startDate} to ${endDate}: ${dataWithLastYear.length} entries, maintaining 13-month structure`);
                const response = {
                    success: true,
                    data: thirteenMonthsStructure,
                    yAxisConfig: yAxisConfigWithLastYear,
                };
                res.json(response);
                return;
            }
            const maxUnits = Math.max(...chartData.map(d => d.units || 0));
            const maxSales = Math.max(...chartData.map(d => d.sales || 0));
            const yAxisConfig = {
                unitsConfig: calculateYAxisTicks(maxUnits, 7500, 2500),
                salesConfig: calculateYAxisTicks(maxSales, 150000, 50000)
            };
            const response = {
                success: true,
                data: chartData,
                yAxisConfig,
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
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        for (let i = 12; i >= 0; i--) {
            const targetDate = new Date(currentYear, currentMonth - i, 1);
            const month = targetDate.getMonth();
            const year = targetDate.getFullYear();
            const baseUnit = 2000 + Math.sin(i * 0.3) * 1000;
            const baseSales = 60000 + Math.sin(i * 0.4) * 30000;
            const shouldExceedDefault = Math.random() < 0.1;
            const unitsMultiplier = shouldExceedDefault ? (2.5 + Math.random() * 2) : (0.8 + Math.random() * 0.4);
            const salesMultiplier = shouldExceedDefault ? (2.2 + Math.random() * 1.8) : (0.9 + Math.random() * 0.2);
            const newEntry = {
                id: require('crypto').randomUUID(),
                store_id: storeId,
                date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
                units: Math.floor(baseUnit * unitsMultiplier),
                sales: Math.floor(baseSales * salesMultiplier),
                lastYearUnits: Math.floor(baseUnit * 0.9 * unitsMultiplier),
                lastYearSales: Math.floor(baseSales * 0.9 * salesMultiplier),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            chartData.push(newEntry);
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
