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
    // First try to load from admin-configured chart data
    const chartDataPath = require('path').join(__dirname, '../../data/chart_data.json');
    let chartData = [];
    
    try {
      const allChartData = require('fs-extra').readJsonSync(chartDataPath);
      chartData = allChartData.filter((item: any) => item.store_id === storeId);
      
      // Filter by date range if provided
      if (startDate && endDate && chartData.length > 0) {
        chartData = chartData.filter((item: any) => {
          const itemDate = new Date(item.date);
          return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        });
      }
      
      if (chartData.length > 0) {
        console.log(`Using admin-configured chart data for store ${storeId}: ${chartData.length} entries`);
        
        // Sort by date and return
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
        return;
      }
    } catch (error) {
      console.log('No admin chart data file found, using fallback generation');
    }
    
    // Fallback: Try to load from daily_sales data
    let dailySales = await dataService.findByStoreId<DailySales>('daily_sales', storeId);
    
    // If no daily sales data or insufficient data, generate spiky chart data
    if (!dailySales || dailySales.length < 100) {
      console.log('Generating spiky chart data for store:', storeId);
      
      // Generate 13 months of daily data for spiky appearance
      const chartData = [];
      const startGenDate = new Date('2025-01-01');
      const endGenDate = new Date('2026-01-31');
      let currentDate = new Date(startGenDate);
      
      while (currentDate <= endGenDate) {
        // Random "spiky" data with high variation
        const baseUnit = 500;
        const baseSales = 50000;
        const variance = 1.2;
        
        // Create dramatic spikes randomly (10% chance of big spike)
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
      
      const response: ApiResponse = {
        success: true,
        data: chartData,
      };
      
      res.json(response);
      return;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      dailySales = dailySales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
      });
    }
    
    // Sort by date and format for charts
    const formattedChartData = dailySales
      .sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime())
      .map(sale => ({
        date: sale.sale_date,
        units: sale.units_ordered,
        sales: sale.sales_amount,
        // Generate comparison data (mock last year data)
        lastYearUnits: Math.round(sale.units_ordered * (0.9 + Math.random() * 0.2)),
        lastYearSales: Math.round(sale.sales_amount * (0.9 + Math.random() * 0.2)),
      }));
    
    const response: ApiResponse = {
      success: true,
      data: formattedChartData,
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