
import { DashboardState, Marketplace } from '../types';
import { useStore } from '../store';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getMarketplaceSpecificData = (marketplace: Marketplace, baseData: DashboardState): DashboardState => {
  const multipliers: Record<Marketplace, number> = {
    'United States': 1,
    'Japan': 148.5,
    'United Kingdom': 0.79,
    'Germany': 0.92,
    'Europe': 0.92,
  };
  
  const m = multipliers[marketplace] || 1;
  
  return {
    ...baseData,
    salesToday: baseData.salesToday * m,
    inventory: baseData.inventory.map(item => ({
      ...item,
      price: item.price * m
    })),
    salesHistory: baseData.salesHistory.map(h => ({
      ...h,
      today: h.today * m,
      lastYear: h.lastYear * m
    })),
    orders: baseData.orders.map(o => ({
      ...o,
      total: o.total * m
    }))
  };
};

export const fetchDashboardData = async (): Promise<DashboardState> => {
  const { session, dashboard } = useStore.getState();
  await delay(600);
  return getMarketplaceSpecificData(session.marketplace, dashboard);
};

export const fetchInventory = async (): Promise<DashboardState['inventory']> => {
  const { session, dashboard } = useStore.getState();
  await delay(500);
  return getMarketplaceSpecificData(session.marketplace, dashboard).inventory;
};

export const fetchOrders = async (): Promise<DashboardState['orders']> => {
  const { session, dashboard } = useStore.getState();
  await delay(500);
  return getMarketplaceSpecificData(session.marketplace, dashboard).orders;
};

export const parseCSV = (csvText: string): Partial<DashboardState> => {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 2) return {};
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const values = lines[1].split(',').map(v => v.trim());
  
  const result: any = {};
  
  headers.forEach((header, index) => {
    const val = values[index];
    if (!val) return;
    
    if (header === 'salestoday') result.salesToday = parseFloat(val);
    if (header === 'openorders') result.openOrders = parseInt(val);
    if (header === 'messages') result.messages = parseInt(val);
  });
  
  return result;
};
