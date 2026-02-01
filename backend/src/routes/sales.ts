import express from 'express';
import { dataService } from '../services/dataService';
import { 
  SalesSnapshotSchema,
  DailySalesSchema,
  type SalesSnapshot, 
  type DailySales,
  type ApiResponse,
  type SalesDateRange
} from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

const toUtcDate = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const addDaysUtc = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const buildWeights = (start: Date, days: number, seedBase: number) => {
  const weights: number[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDaysUtc(start, i);
    const dayOfWeek = date.getUTCDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1;
    const seasonal =
      1 +
      Math.sin((i + seedBase) * (Math.PI * 2 / 30)) * 0.18 +
      Math.sin((i + seedBase) * (Math.PI * 2 / 90)) * 0.12;
    const noise = 1 + (seededRandom(seedBase + i) - 0.5) * 0.35;
    weights.push(Math.max(0.05, seasonal * weekendFactor * noise));
  }
  return weights;
};

const allocateTotals = (total: number, weights: number[]) => {
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

const generateDailySeries = (storeId: string, totalUnits: number, totalSales: number, days = 365) => {
  const end = toUtcDate(new Date());
  const start = addDaysUtc(end, -(days - 1));
  const seedBase = hashString(storeId || 'store');

  const unitWeights = buildWeights(start, days, seedBase);
  const salesWeights = buildWeights(start, days, seedBase + 1337);

  const units = allocateTotals(Math.max(0, Math.round(totalUnits)), unitWeights);
  const sales = allocateTotals(Math.max(0, Math.round(totalSales)), salesWeights);

  const lastYearUnits = allocateTotals(
    Math.max(0, Math.round(totalUnits * 0.85)),
    unitWeights.map((w, i) => w * (0.9 + seededRandom(seedBase + i) * 0.2))
  );
  const lastYearSales = allocateTotals(
    Math.max(0, Math.round(totalSales * 0.85)),
    salesWeights.map((w, i) => w * (0.9 + seededRandom(seedBase + 999 + i) * 0.2))
  );

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

const saveChartDataForStore = (
  storeId: string,
  entries: Array<{ date: string; units: number; sales: number; lastYearUnits: number; lastYearSales: number }>
) => {
  const filePath = require('path').join(__dirname, '../../data/chart_data.json');
  const crypto = require('crypto');
  const fs = require('fs-extra');

  let chartData: any[] = [];
  try {
    chartData = fs.readJsonSync(filePath);
  } catch (error) {
    console.log('Creating new chart data file');
  }

  chartData = chartData.filter((item: any) => item.store_id !== storeId);

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

const saveDailySalesForStore = async (
  storeId: string,
  entries: Array<{ date: string; units: number; sales: number }>
) => {
  const crypto = require('crypto');
  const existingData = await dataService.readData<DailySales>('daily_sales');
  const filteredData = existingData.filter(item => item.store_id !== storeId);

  const newEntries = entries.map(item => ({
    id: crypto.randomUUID(),
    store_id: storeId,
    sale_date: item.date,
    units_ordered: item.units,
    sales_amount: item.sales,
  }));

  await dataService.writeData('daily_sales', [...filteredData, ...newEntries]);
  return newEntries.length;
};

// GET /api/sales?store_id=:storeId - Get sales data by store (for admin compatibility)
router.get('/', asyncHandler(async (req, res) => {
  const { store_id } = req.query;
  
  if (!store_id) {
    throw createError('store_id query parameter is required', 400);
  }
  
  // Redirect to snapshot endpoint for now
  let snapshots = await dataService.findByStoreId<SalesSnapshot>('sales_snapshots', store_id as string);
  let snapshot = snapshots[0];
  
  // Create default snapshot if none exists
  if (!snapshot) {
    snapshot = await dataService.create<SalesSnapshot>('sales_snapshots', {
      store_id: store_id as string,
      total_order_items: 248,
      units_ordered: 192260,
      ordered_product_sales: 18657478,
      avg_units_per_order: 1.14,
      avg_sales_per_order: 110.29,
      snapshot_time: new Date().toISOString(),
    });
  }
  
  const response: ApiResponse<SalesSnapshot> = {
    success: true,
    data: snapshot,
  };
  
  res.json(response);
}));

// GET /api/sales/snapshot/:storeId - Get sales snapshot
router.get('/snapshot/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  let snapshots = await dataService.findByStoreId<SalesSnapshot>('sales_snapshots', storeId);
  let snapshot = snapshots[0];
  
  // Create default snapshot if none exists
  if (!snapshot) {
    snapshot = await dataService.create<SalesSnapshot>('sales_snapshots', {
      store_id: storeId,
      total_order_items: 248,
      units_ordered: 192260,
      ordered_product_sales: 18657478,
      avg_units_per_order: 1.14,
      avg_sales_per_order: 110.29,
      snapshot_time: new Date().toISOString(),
    });
  }
  
  const response: ApiResponse<SalesSnapshot> = {
    success: true,
    data: snapshot,
  };
  
  res.json(response);
}));

// PUT /api/sales/snapshot/:storeId - Update sales snapshot
router.put('/snapshot/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  const updateData = SalesSnapshotSchema.partial().parse({
    ...req.body,
    snapshot_time: new Date().toISOString(),
  });
  
  let snapshots = await dataService.findByStoreId<SalesSnapshot>('sales_snapshots', storeId);
  let snapshot = snapshots[0];
  
  if (!snapshot) {
    // Create new snapshot with default values
    snapshot = await dataService.create<SalesSnapshot>('sales_snapshots', {
      store_id: storeId,
      total_order_items: updateData.total_order_items || 0,
      units_ordered: updateData.units_ordered || 0,
      ordered_product_sales: updateData.ordered_product_sales || 0,
      avg_units_per_order: updateData.avg_units_per_order || 0,
      avg_sales_per_order: updateData.avg_sales_per_order || 0,
      snapshot_time: new Date().toISOString(),
    });
  } else {
    // Update existing snapshot
    const updatedSnapshot = await dataService.update<SalesSnapshot>('sales_snapshots', snapshot.id, updateData);
    if (!updatedSnapshot) {
      throw createError('Failed to update sales snapshot', 500);
    }
    snapshot = updatedSnapshot;
  }
  
  if (!snapshot) {
    throw createError('Failed to update sales snapshot', 500);
  }

  try {
    const { entries } = generateDailySeries(
      storeId,
      snapshot.units_ordered || 0,
      snapshot.ordered_product_sales || 0
    );
    saveChartDataForStore(storeId, entries);
    await saveDailySalesForStore(storeId, entries);
  } catch (error) {
    console.error('Failed to generate Business Reports chart data:', error);
    throw createError('Failed to generate Business Reports chart data', 500);
  }
  
  const response: ApiResponse<SalesSnapshot> = {
    success: true,
    data: snapshot,
    message: 'Sales snapshot updated successfully',
  };
  
  res.json(response);
}));

// GET /api/sales/daily/:storeId - Get daily sales data
router.get('/daily/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { startDate, endDate } = req.query as unknown as SalesDateRange;
  
  let dailySales = await dataService.findByStoreId<DailySales>('daily_sales', storeId);
  
  // Filter by date range if provided
  if (startDate && endDate) {
    dailySales = dailySales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
    });
  }
  
  // Sort by date
  dailySales.sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime());
  
  const response: ApiResponse<DailySales[]> = {
    success: true,
    data: dailySales,
  };
  
  res.json(response);
}));

// POST /api/sales/generate-daily/:storeId - Generate daily sales data
router.post('/generate-daily/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { startDate, endDate, totalSales, totalUnits, volatility = 0.3 } = req.body;
  
  if (!startDate || !endDate || !totalSales || !totalUnits) {
    throw createError('Missing required parameters: startDate, endDate, totalSales, totalUnits', 400);
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Clear existing data for this date range
  const existingData = await dataService.findByStoreId<DailySales>('daily_sales', storeId);
  const filteredData = existingData.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return saleDate < start || saleDate > end;
  });
  
  // Generate new daily data
  const avgSales = totalSales / days;
  const avgUnits = totalUnits / days;
  const generatedData: DailySales[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    // Add some randomness based on volatility
    const salesMultiplier = 1 + (Math.random() - 0.5) * volatility;
    const unitsMultiplier = 1 + (Math.random() - 0.5) * volatility;
    
    const dailySale = await dataService.create<DailySales>('daily_sales', {
      store_id: storeId,
      sale_date: date.toISOString().split('T')[0],
      sales_amount: Math.round(avgSales * salesMultiplier),
      units_ordered: Math.round(avgUnits * unitsMultiplier),
    });
    
    generatedData.push(dailySale);
  }
  
  // Save all data back
  const allData = [...filteredData, ...generatedData];
  await dataService.writeData('daily_sales', allData);
  
  const response: ApiResponse<DailySales[]> = {
    success: true,
    data: generatedData,
    message: `Generated ${generatedData.length} days of sales data`,
  };
  
  res.json(response);
}));

// GET /api/sales/chart-data/:storeId - Get formatted chart data
router.get('/chart-data/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { startDate, endDate } = req.query as unknown as SalesDateRange;
  
  try {
    const chartDataPath = require('path').join(__dirname, '../../data/chart_data.json');
    let chartData: any[] = [];

    try {
      const allChartData = require('fs-extra').readJsonSync(chartDataPath);
      chartData = allChartData.filter((item: any) => item.store_id === storeId);
    } catch (error) {
      console.log('No admin chart data file found, using fallback generation');
    }

    if (!chartData.length) {
      const snapshots = await dataService.findByStoreId<SalesSnapshot>('sales_snapshots', storeId);
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
      chartData = chartData.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    }

    const hasLastYear = chartData.some(
      (item: any) => (item.lastYearUnits || 0) > 0 || (item.lastYearSales || 0) > 0
    );

    if (startDate && endDate && !hasLastYear) {
      chartData = chartData.map((item: any) => {
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
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item: any) => ({
        date: item.date,
        units: item.units,
        sales: item.sales,
        lastYearUnits: item.lastYearUnits,
        lastYearSales: item.lastYearSales,
      }));

    const response: ApiResponse = {
      success: true,
      data: sortedData,
    };

    res.json(response);
  } catch (error) {
    console.error('Chart data error:', error);
    throw createError('Failed to fetch chart data', 500);
  }
}));

// Admin endpoints for managing sales data
router.post('/admin/sales-data', asyncHandler(async (req, res) => {
  const { store_id, date, units, sales, lastYearUnits, lastYearSales } = req.body;
  
  if (!store_id || !date || units === undefined || sales === undefined) {
    throw createError('Missing required fields', 400);
  }
  
  try {
    // Read existing chart data
    const filePath = require('path').join(__dirname, '../../data/chart_data.json');
    let chartData = [];
    
    try {
      chartData = require('fs-extra').readJsonSync(filePath);
    } catch (error) {
      console.log('Creating new chart data file');
    }
    
    // Create new sales data entry
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
    
    // Save to file
    require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
    
    const response: ApiResponse = {
      success: true,
      data: newEntry,
      message: 'Sales data created successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Create sales data error:', error);
    throw createError('Failed to create sales data', 500);
  }
}));

router.put('/admin/sales-data/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { store_id, date, units, sales, lastYearUnits, lastYearSales } = req.body;
  
  try {
    const filePath = require('path').join(__dirname, '../../data/chart_data.json');
    let chartData = require('fs-extra').readJsonSync(filePath);
    
    const index = chartData.findIndex((item: any) => item.id === id);
    if (index === -1) {
      throw createError('Sales data not found', 404);
    }
    
    // Update the entry
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
    
    // Save to file
    require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
    
    const response: ApiResponse = {
      success: true,
      data: chartData[index],
      message: 'Sales data updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Update sales data error:', error);
    throw createError('Failed to update sales data', 500);
  }
}));

router.delete('/admin/sales-data/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const filePath = require('path').join(__dirname, '../../data/chart_data.json');
    let chartData = require('fs-extra').readJsonSync(filePath);
    
    const index = chartData.findIndex((item: any) => item.id === id);
    if (index === -1) {
      throw createError('Sales data not found', 404);
    }
    
    // Remove the entry
    chartData.splice(index, 1);
    
    // Save to file
    require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
    
    const response: ApiResponse = {
      success: true,
      message: 'Sales data deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Delete sales data error:', error);
    throw createError('Failed to delete sales data', 500);
  }
}));

router.post('/admin/sales-data/generate/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  
  try {
    const filePath = require('path').join(__dirname, '../../data/chart_data.json');
    let chartData = [];
    
    try {
      chartData = require('fs-extra').readJsonSync(filePath);
    } catch (error) {
      console.log('Creating new chart data file');
    }
    
    // Remove existing data for this store
    chartData = chartData.filter((item: any) => item.store_id !== storeId);
    
    // Generate 13 months of sample data
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2026-01-31');
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const baseUnit = 500;
      const baseSales = 50000;
      const variance = 1.2;
      
      // Create dramatic spikes randomly (10% chance of big spike)
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
    
    // Save to file
    require('fs-extra').writeJsonSync(filePath, chartData, { spaces: 2 });
    
    const response: ApiResponse = {
      success: true,
      message: `Generated ${chartData.filter((item: any) => item.store_id === storeId).length} sample data entries`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Generate sample data error:', error);
    throw createError('Failed to generate sample data', 500);
  }
}));



export = router;
