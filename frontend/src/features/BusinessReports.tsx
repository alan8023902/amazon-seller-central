import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useStore } from '../store';
import { apiGet } from '../config/api';
import { Copy, Check } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '../utils/cn';
import styles from './BusinessReports.module.css';
import CustomDateDropdown from '../components/CustomDateDropdown';
import DatePicker from '../components/DatePicker';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatUnitsTick = (v: number) => {
  if (v === 0) return '0';
  if (v >= 1000 && v % 1000 === 0) return `${v / 1000}k`;
  return `${Math.round(v)}`;
};

const formatSalesTick = (v: number) => {
  if (v === 0) return '0';
  if (v >= 1000 && v % 1000 === 0) return `${v / 1000}k`;
  return `${Math.round(v)}`;
};

const formatDateForAPI = (dateStr: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  const [month, day, year] = parts;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const parseISODate = (dateStr: string) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
};

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
};

const diffDays = (start: Date, end: Date) =>
  Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);

const formatMonthLabel = (date: Date) => {
  const monthName = MONTH_NAMES[date.getUTCMonth()];
  const yearShort = date.getUTCFullYear().toString().slice(2);
  return `${monthName} '${yearShort}`;
};

const buildMonthTicks = (start: Date, end: Date) => {
  const ticks: number[] = [];
  const labels = new Map<number, string>();

  ticks.push(0);
  labels.set(0, formatMonthLabel(start));

  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  while (cursor <= end) {
    const index = diffDays(start, cursor);
    ticks.push(index);
    labels.set(index, formatMonthLabel(cursor));
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }

  return { ticks, labels };
};

const deriveRangeFromData = (data: any[]) => {
  const dates = data
    .map(item => parseISODate(item.date))
    .filter((value): value is Date => value !== null);

  if (!dates.length) return null;
  const times = dates.map(date => date.getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  return {
    start: new Date(minTime),
    end: new Date(maxTime),
  };
};

const attachXIndex = (data: any[], rangeStart: Date) =>
  data.map(item => {
    const parsed = parseISODate(item.date);
    return {
      ...item,
      xIndex: parsed ? diffDays(rangeStart, parsed) : 0,
    };
  });

const formatHourLabel = (hour: number) => {
  const normalized = hour % 24;
  const suffix = normalized < 12 ? 'AM' : 'PM';
  const display = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${display}${suffix}`;
};

const buildHourTicks = () => {
  const ticks = Array.from({ length: 24 }, (_, i) => i);
  const labels = new Map<number, string>();
  ticks.forEach(hour => {
    labels.set(hour, formatHourLabel(hour));
  });
  return { ticks, labels };
};

const allocateTotalsToBuckets = (total: number, weights: number[]) => {
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

const buildHourlySeries = (
  dateISO: string,
  totalUnits: number,
  totalSales: number,
  lastYearUnits: number,
  lastYearSales: number
) => {
  const hourWeights = Array.from({ length: 24 }, () => 0.1 + Math.random() * 1.9);
  const salesWeights = Array.from({ length: 24 }, () => 0.1 + Math.random() * 1.9);
  const lastYearUnitWeights = Array.from({ length: 24 }, () => 0.1 + Math.random() * 1.9);
  const lastYearSalesWeights = Array.from({ length: 24 }, () => 0.1 + Math.random() * 1.9);

  const units = allocateTotalsToBuckets(Math.max(0, Math.round(totalUnits)), hourWeights);
  const sales = allocateTotalsToBuckets(Math.max(0, Math.round(totalSales)), salesWeights);
  const lastUnits = allocateTotalsToBuckets(Math.max(0, Math.round(lastYearUnits)), lastYearUnitWeights);
  const lastSales = allocateTotalsToBuckets(Math.max(0, Math.round(lastYearSales)), lastYearSalesWeights);

  return Array.from({ length: 24 }, (_, hour) => ({
    date: dateISO,
    hour,
    hourLabel: formatHourLabel(hour),
    xIndex: hour,
    units: units[hour],
    sales: sales[hour],
    lastYearUnits: lastUnits[hour],
    lastYearSales: lastSales[hour],
  }));
};

type CompareColumn = {
  key: string;
  label: string;
  lines: string[];
};

type CompareSeriesPoint = {
  xIndex: number;
  units: number;
  sales: number;
  hourLabel?: string;
  date?: string;
  weekLabel?: string;
};

type CompareSeries = {
  key: string;
  label: string;
  data: CompareSeriesPoint[];
};

const BusinessReports: React.FC = () => {
  const { t, formatCurrency, formatNumber } = useI18n();
  const { currentStore } = useStore();

  const [activeView, setActiveView] = useState<'graph' | 'table'>('graph');
  const formatDateISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return formatDateISO(today);
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return formatDateISO(today);
  });
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [chartMode, setChartMode] = useState<'daily' | 'hourly' | 'week' | 'month'>('daily');
  const [compareColumns, setCompareColumns] = useState<CompareColumn[]>([]);
  const [compareSeries, setCompareSeries] = useState<CompareSeries[]>([]);
  const [compareVisibility, setCompareVisibility] = useState<Record<string, boolean>>({});

  const [chartData, setChartData] = useState<any[]>([]);
  const [yAxisConfig, setYAxisConfig] = useState({
    unitsConfig: { ticks: [0, 2500, 5000, 7500], domain: [0, 7500] },
    salesConfig: { ticks: [0, 50000, 100000, 150000], domain: [0, 150000] }
  });
  const [snapshotData, setSnapshotData] = useState({
    totalOrderItems: '0',
    unitsOrdered: '0',
    orderedProductSales: '$0.00',
    avgUnitsPerOrder: '0.00',
    avgSalesPerOrder: '$0.00',
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  });

  const [appliedDateRange, setAppliedDateRange] = useState({
    startDate: '',
    endDate: '',
    isApplied: false
  });
  const [loading, setLoading] = useState(false);
  const [baseRange, setBaseRange] = useState<{ start: Date; end: Date } | null>(null);

  const showComparison = appliedDateRange.isApplied;
  const isHourlyView = chartMode === 'hourly';
  const hourTickData = useMemo(() => buildHourTicks(), []);

  const getCompareColor = (key: string) => {
    if (key === 'current') return '#008296';
    if (key === 'yesterday' || key === 'dayBeforeYesterday') return '#d73027';
    if (key === 'sameDayLastWeek' || key === 'lastWeek' || key === 'lastMonth') return '#FDA465';
    if (key === 'sameDayLastYear' || key === 'sameWeekLastYear' || key === 'sameMonthLastYear') return '#8a8a8a';
    return '#565959';
  };

  const addDaysToISO = (dateStr: string, delta: number) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return '';
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + delta);
    return formatDateISO(date);
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = (day + 6) % 7; // Monday = 0
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const monthTickData = useMemo(() => {
    if (!baseRange) {
      return { ticks: [], labels: new Map<number, string>() };
    }
    return buildMonthTicks(baseRange.start, baseRange.end);
  }, [baseRange]);

  const weekTickData = useMemo(() => {
    if (chartMode !== 'week') {
      return { ticks: [], labels: new Map<number, string>() };
    }
    const labels = new Map<number, string>();
    const ticks: number[] = [];
    chartData.forEach((item: any) => {
      if (typeof item.xIndex === 'number') {
        ticks.push(item.xIndex);
        labels.set(item.xIndex, item.weekLabel || '');
      }
    });
    return { ticks, labels };
  }, [chartMode, chartData]);

  const monthDayTickData = useMemo(() => {
    if (chartMode !== 'month') {
      return { ticks: [], labels: new Map<number, string>() };
    }
    const ticks: number[] = [];
    const labels = new Map<number, string>();
    chartData.forEach((item: any) => {
      if (typeof item.xIndex === 'number') {
        ticks.push(item.xIndex);
        labels.set(item.xIndex, String(item.xIndex));
      }
    });
    return { ticks, labels };
  }, [chartMode, chartData]);

  const xDomain = useMemo(() => {
    if (!baseRange) return undefined;
    return [0, diffDays(baseRange.start, baseRange.end)] as [number, number];
  }, [baseRange]);

  // ✅ 生成固定的13个月标签
  // ===== 动态Y轴刻度系统 - 根据数据动态计算3个坐标 =====
  const calculateYAxisConfiguration = (
    maxUnits: number,
    maxSales: number,
    mode: 'daily' | 'hourly' | 'week' | 'month' = 'daily'
  ) => {
    const calculateYAxisTicks = (
      maxValue: number,
      defaultMax: number,
      defaultInterval: number,
      roundInterval: boolean
    ) => {
      if (maxValue <= defaultMax) {
        const ticks = [];
        for (let i = 0; i <= 3; i++) {
          ticks.push(i * defaultInterval);
        }
        return {
          ticks,
          domain: [0, defaultMax] as [number, number]
        };
      } else {
        if (!roundInterval) {
          const interval = Math.ceil(maxValue / 3);
          return {
            ticks: [0, interval, interval * 2, interval * 3],
            domain: [0, interval * 3] as [number, number]
          };
        }

        const targetMax = Math.ceil(maxValue * 1.1);
        const interval = Math.ceil(targetMax / 3);

        let niceInterval: number;
        if (interval <= 1000) {
          niceInterval = Math.ceil(interval / 100) * 100;
        } else if (interval <= 10000) {
          niceInterval = Math.ceil(interval / 1000) * 1000;
        } else {
          niceInterval = Math.ceil(interval / 10000) * 10000;
        }

        return {
          ticks: [0, niceInterval, niceInterval * 2, niceInterval * 3],
          domain: [0, niceInterval * 3] as [number, number]
        };
      }
    };

    const unitDefaults = mode === 'hourly'
      ? { max: 75, interval: 25, round: false }
      : mode === 'week' || mode === 'month'
        ? { max: 3000, interval: 1000, round: false }
        : { max: 7500, interval: 2500, round: true };
    const salesDefaults = mode === 'hourly'
      ? { max: 3000, interval: 1000, round: false }
      : mode === 'week'
        ? { max: 60000, interval: 20000, round: false }
        : mode === 'month'
          ? { max: 75000, interval: 25000, round: false }
          : { max: 150000, interval: 50000, round: true };

    return {
      unitsConfig: calculateYAxisTicks(maxUnits, unitDefaults.max, unitDefaults.interval, unitDefaults.round),
      salesConfig: calculateYAxisTicks(maxSales, salesDefaults.max, salesDefaults.interval, salesDefaults.round)
    };
  };

  const updateSnapshotFromTotals = (totalUnits: number, totalSales: number) => {
    const totalOrderItems = totalUnits;
    setSnapshotData(prev => ({
      ...prev,
      totalOrderItems: new Intl.NumberFormat('en-US').format(totalOrderItems),
      unitsOrdered: new Intl.NumberFormat('en-US').format(totalUnits),
      orderedProductSales: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSales),
      avgUnitsPerOrder: totalOrderItems > 0 ? (totalUnits / totalOrderItems).toFixed(2) : '0.00',
      avgSalesPerOrder: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        totalOrderItems > 0 ? totalSales / totalOrderItems : 0
      ),
      timestamp: prev.timestamp
    }));
  };
  const generateFallbackChartData = () => {
    // ✅ 生成13个月的按天数据，但X轴只显示月份标签
    const now = new Date();
    const data: any[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // ✅ 计算13个月前的日期
    const thirteenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    const currentDate = new Date(thirteenMonthsAgo);
    
    let dayIndex = 0; // 用于X轴定位的索引
    
    // ✅ 按天生成数据，从13个月前到今天
    while (currentDate <= now) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const day = currentDate.getDate();
      const yearShort = year.toString().slice(2);
      const monthName = monthNames[month];
      
      // ✅ 使用日期作为随机种子，确保同一日期的数据固定
      const seed = year * 10000 + month * 100 + day;
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // ✅ 基于日期的固定数据生成
      const baseUnits = 2000 + Math.sin(seed * 0.001) * 1500;
      const baseSales = 60000 + Math.sin(seed * 0.0008) * 35000;
      
      // ✅ 固定的随机波动 - 增加波动幅度创造锯齿效果
      const unitsNoise = (seededRandom(seed) - 0.5) * 1500;
      const salesNoise = (seededRandom(seed + 1) - 0.5) * 40000;
      
      // ✅ 偶尔的尖峰（基于日期固定）
      const spikeChance = seededRandom(seed + 2) < 0.15 ? (1.3 + seededRandom(seed + 3) * 0.7) : 1;
      
      // ✅ 增加日间变化模式
      const dayOfWeek = currentDate.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
      const midWeekBoost = (dayOfWeek === 2 || dayOfWeek === 3) ? 1.2 : 1.0;
      
      // ✅ 只在月初显示月份标签，其他日期为空
      const displayName = day === 1 ? `${monthName} '${yearShort}` : '';
      
      data.push({
        name: displayName,
        xIndex: dayIndex, // ✅ 用于X轴定位
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        units: Math.max(300, Math.round((baseUnits + unitsNoise) * spikeChance * weekendMultiplier * midWeekBoost)),
        sales: Math.max(15000, Math.round((baseSales + salesNoise) * spikeChance * weekendMultiplier * midWeekBoost)),
        // ✅ 默认不显示同期数据，只有Apply后才显示
        lastYearUnits: 0,
        lastYearSales: 0
      });
      
      dayIndex++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const range = deriveRangeFromData(data);
    if (range) {
      setBaseRange(range);
      setChartData(attachXIndex(data, range.start));
    } else {
      setChartData(data);
    }
    
    // ✅ 计算并设置Y轴配置
    const maxUnits = Math.max(...data.map(d => d.units || 0));
    const maxSales = Math.max(...data.map(d => d.sales || 0));
    
    const yAxisConfig = calculateYAxisConfiguration(maxUnits, maxSales, 'daily');
    setYAxisConfig(yAxisConfig);
  };

  const loadChartData = async (
    start?: string,
    end?: string,
    viewMode: 'daily' | 'hourly' | 'week' | 'month' = 'daily',
    dimension?: string
  ) => {
    if (!currentStore?.id) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (dimension) params.append('dimension', dimension);

      const response = await apiGet(`/api/sales/chart-data/${currentStore.id}?${params.toString()}`);
      if (response.success && response.data && response.data.length > 0) {
        const resolvedMode: 'daily' | 'hourly' | 'week' | 'month' =
          viewMode === 'hourly' || viewMode === 'week' || viewMode === 'month'
            ? viewMode
            : 'daily';
        setChartMode(resolvedMode);
        const incomingColumns = response.compare?.columns || [];
        setCompareColumns(incomingColumns);
        setCompareSeries(response.compare?.series || []);
        setCompareVisibility(prev => {
          if (!incomingColumns.length) return {};
          const next: Record<string, boolean> = {};
          incomingColumns.forEach((column: CompareColumn) => {
            next[column.key] = prev[column.key] ?? true;
          });
          return next;
        });

        const rawData = response.data;
        if (resolvedMode === 'hourly') {
          setChartData(rawData);
          setBaseRange(null);

          const maxUnits = Math.max(...rawData.map((d: any) => Math.max(d.units || 0, d.lastYearUnits || 0)));
          const maxSales = Math.max(...rawData.map((d: any) => Math.max(d.sales || 0, d.lastYearSales || 0)));
          setYAxisConfig(calculateYAxisConfiguration(maxUnits, maxSales, 'hourly'));

          const totalUnits = rawData.reduce((sum: number, item: any) => sum + (item.units || 0), 0);
          const totalSales = rawData.reduce((sum: number, item: any) => sum + (item.sales || 0), 0);
          updateSnapshotFromTotals(totalUnits, totalSales);

          return;
        }

        if (resolvedMode === 'week') {
          setChartData(rawData);
          setBaseRange(null);

          const maxUnits = Math.max(...rawData.map((d: any) => Math.max(d.units || 0, d.lastYearUnits || 0)));
          const maxSales = Math.max(...rawData.map((d: any) => Math.max(d.sales || 0, d.lastYearSales || 0)));
          setYAxisConfig(calculateYAxisConfiguration(maxUnits, maxSales, 'week'));

          const totalUnits = rawData.reduce((sum: number, item: any) => sum + (item.units || 0), 0);
          const totalSales = rawData.reduce((sum: number, item: any) => sum + (item.sales || 0), 0);
          updateSnapshotFromTotals(totalUnits, totalSales);

          return;
        }

        if (resolvedMode === 'month') {
          setChartData(rawData);
          setBaseRange(null);

          const maxUnits = Math.max(...rawData.map((d: any) => Math.max(d.units || 0, d.lastYearUnits || 0)));
          const maxSales = Math.max(...rawData.map((d: any) => Math.max(d.sales || 0, d.lastYearSales || 0)));
          setYAxisConfig(calculateYAxisConfiguration(maxUnits, maxSales, 'month'));

          const totalUnits = rawData.reduce((sum: number, item: any) => sum + (item.units || 0), 0);
          const totalSales = rawData.reduce((sum: number, item: any) => sum + (item.sales || 0), 0);
          updateSnapshotFromTotals(totalUnits, totalSales);

          return;
        }

        let range = baseRange;

        if (!range || (!start && !end)) {
          const derivedRange = deriveRangeFromData(rawData);
          if (derivedRange) {
            range = derivedRange;
            setBaseRange(derivedRange);
          }
        }

        const chartData = range ? attachXIndex(rawData, range.start) : rawData;
        setChartData(chartData);

        const maxUnits = Math.max(...chartData.map((d: any) => Math.max(d.units || 0, d.lastYearUnits || 0)));
        const maxSales = Math.max(...chartData.map((d: any) => Math.max(d.sales || 0, d.lastYearSales || 0)));
        const yAxisConfig = calculateYAxisConfiguration(maxUnits, maxSales, 'daily');
        setYAxisConfig(yAxisConfig);

        if (start && end && chartData.length > 0) {
          const totalUnits = chartData.reduce((sum: any, item: any) => sum + (item.units || 0), 0);
          const totalSales = chartData.reduce((sum: any, item: any) => sum + (item.sales || 0), 0);
          const totalOrders = chartData.filter((item: any) => (item.units || 0) > 0).length;

          setSnapshotData(prev => ({
            ...prev,
            totalOrderItems: new Intl.NumberFormat('en-US').format(Math.floor(totalUnits * 0.8)),
            unitsOrdered: new Intl.NumberFormat('en-US').format(totalUnits),
            orderedProductSales: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSales),
            avgUnitsPerOrder: totalOrders > 0 ? (totalUnits / totalOrders).toFixed(2) : '0.00',
            avgSalesPerOrder: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              totalOrders > 0 ? totalSales / totalOrders : 0
            ),
            timestamp: new Date().toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles',
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short'
            })
          }));
        }
      } else {
        setChartData([]);
        setCompareColumns([]);
        setCompareSeries([]);
        setCompareVisibility({});
      }
    } catch (e) {
      console.error('Chart data loading error:', e);
      setChartData([]);
      setCompareColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    const apiStartDate = formatDateForAPI(startDate);
    const apiEndDate = formatDateForAPI(endDate);

    console.log('Apply filters:', { startDate, endDate, apiStartDate, apiEndDate });

    const viewMode: 'daily' | 'hourly' | 'week' | 'month' =
      selectedDateRange === 'today' || selectedDateRange === 'yesterday'
        ? 'hourly'
        : selectedDateRange === 'week'
          ? 'week'
          : selectedDateRange === 'month'
            ? 'month'
            : 'daily';
    setChartMode(viewMode);
    await loadChartData(apiStartDate, apiEndDate, viewMode, selectedDateRange);

    setAppliedDateRange({
      startDate,
      endDate,
      isApplied: true
    });
  };

  const handleDateRangeChange = (value: string) => {
    setSelectedDateRange(value);
    setCompareColumns([]);
    setCompareSeries([]);
    setCompareVisibility({});
    setAppliedDateRange({
      startDate: '',
      endDate: '',
      isApplied: false
    });

    const today = new Date();
    let newStartDate = '';
    let newEndDate = '';

    const fmt = (d: Date) => formatDateISO(d);
    const addMonths = (date: Date, delta: number) => {
      const year = date.getFullYear();
      const month = date.getMonth() + delta;
      const day = date.getDate();
      const firstOfMonth = new Date(year, month, 1);
      const daysInMonth = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
      const clampedDay = Math.min(day, daysInMonth);
      return new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), clampedDay);
    };
    const addYears = (date: Date, delta: number) => addMonths(date, delta * 12);

    switch (value) {
      case 'today':
        newStartDate = newEndDate = fmt(today);
        break;
      case 'yesterday': {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        newStartDate = newEndDate = fmt(y);
        break;
      }
      case 'week': {
        const weekStart = getWeekStart(today);
        newStartDate = fmt(weekStart);
        newEndDate = fmt(today);
        break;
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        newStartDate = fmt(monthStart);
        newEndDate = fmt(today);
        break;
      }
      case 'year': {
        const yearStart = addYears(today, -1);
        newStartDate = fmt(yearStart);
        newEndDate = fmt(today);
        break;
      }
      case 'custom':
      default:
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  useEffect(() => {
    // ✅ 初次加载不应用日期范围，只是设置状态
    setAppliedDateRange({
      startDate: '',
      endDate: '',
      isApplied: false
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadSnapshotData = async () => {
      if (!currentStore?.id) return;
      try {
        const response = await apiGet(`/api/sales/snapshot/${currentStore.id}`);
        if (response.success && response.data) {
          const data = response.data;
          const totalOrderItems = data.total_order_items || 0;
          const unitsOrdered = data.units_ordered || 0;
          const orderedProductSales = data.ordered_product_sales || 0;
          const avgUnits =
            data.avg_units_per_order_item ??
            (totalOrderItems > 0 ? unitsOrdered / totalOrderItems : 0);
          const avgSales =
            data.avg_sales_per_order_item ??
            (totalOrderItems > 0 ? orderedProductSales / totalOrderItems : 0);
          const snapshotTime = data.snapshot_time ? new Date(data.snapshot_time) : new Date();
          const formattedTimestamp = snapshotTime.toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
          });

          setSnapshotData({
            totalOrderItems: new Intl.NumberFormat('en-US').format(totalOrderItems),
            unitsOrdered: new Intl.NumberFormat('en-US').format(unitsOrdered),
            orderedProductSales: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              orderedProductSales
            ),
            avgUnitsPerOrder: avgUnits.toFixed(2),
            avgSalesPerOrder: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              avgSales
            ),
            timestamp: formattedTimestamp
          });
        }
      } catch (e) {
        console.error('Failed to load sales snapshot data:', e);
      }
    };

    loadSnapshotData();
    // ✅ 默认加载当天24小时数据，不显示对比
    loadChartData(undefined, undefined, 'hourly', 'today');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore]);

  const xAxisTicks = isHourlyView
    ? hourTickData.ticks
    : chartMode === 'week'
      ? weekTickData.ticks
      : chartMode === 'month'
        ? monthDayTickData.ticks
        : monthTickData.ticks;
  const xAxisDomain = isHourlyView
    ? ([0, 23] as [number, number])
    : chartMode === 'week'
      ? ([0, 6] as [number, number])
      : chartMode === 'month'
        ? ([1, monthDayTickData.ticks.length || 31] as [number, number])
        : xDomain;
  const xAxisTickFormatter = (value: number) => {
    if (isHourlyView) return hourTickData.labels.get(Number(value)) || '';
    if (chartMode === 'week') return weekTickData.labels.get(Number(value)) || '';
    if (chartMode === 'month') return String(value);
    return monthTickData.labels.get(Number(value)) || '';
  };

  const chartDataWithCompare = useMemo(() => {
    if (!compareSeries.length) return chartData;
    const seriesMaps = new Map<string, Map<number, CompareSeriesPoint>>();
    compareSeries.forEach(series => {
      const map = new Map<number, CompareSeriesPoint>();
      series.data.forEach(point => {
        map.set(point.xIndex, point);
      });
      seriesMaps.set(series.key, map);
    });

    return chartData.map((item: any) => {
      const next = { ...item };
      compareSeries.forEach(series => {
        const match = seriesMaps.get(series.key)?.get(Number(item.xIndex));
        next[`compare_${series.key}_units`] = match ? match.units : 0;
        next[`compare_${series.key}_sales`] = match ? match.sales : 0;
      });
      return next;
    });
  }, [chartData, compareSeries]);

  const visibleCompareSeries = useMemo(
    () => compareSeries.filter(series => compareVisibility[series.key] !== false),
    [compareSeries, compareVisibility]
  );

  const isCurrentVisible = !showComparison || compareVisibility.current !== false;

  const hasCustomCompare = showComparison && compareColumns.length > 0;

  const renderCompareColumn = (column: CompareColumn) => {
    const isChecked = compareVisibility[column.key] !== false;
    const lineColor = getCompareColor(column.key);
    return (
      <div className={styles.compareCheckbox}>
        <button
          type="button"
          onClick={() =>
            setCompareVisibility(prev => ({
              ...prev,
              [column.key]: prev[column.key] === false
            }))
          }
          className="w-4 h-4 border-2 rounded-[2px] flex items-center justify-center mt-1 bg-white"
          style={{
            borderColor: '#007185',
            backgroundColor: isChecked ? '#007185' : '#ffffff'
          }}
          aria-label={`${column.label} toggle`}
        >
          {isChecked && <Check size={12} className="text-white" />}
        </button>
        <div>
          <span className={styles.checkboxLabel} style={{ color: lineColor }}>
            {column.label}
          </span>
          {isChecked && (
            <div className={styles.checkboxValues}>
              {column.lines.map((line, idx) => (
                <span key={idx} style={(line.includes('Units') || line.includes('$')) ? { color: lineColor } : undefined}>
                  {line}
                  {idx < column.lines.length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(styles.businessReports, styles.pageContainer)}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div className="flex items-center">
          <h1 className={styles.pageTitle}>{t('salesDashboardTitle')}</h1>
          <a href="#" className={styles.learnMoreLink}>Learn more</a>
        </div>

        <div className={styles.headerButtons}>
          <button className={styles.btnRefresh}>{t('refresh')}</button>
          <button className={styles.btnDownload}>{t('download')}</button>

          {/* ✅ Notification bell */}
          <button className={styles.bellBtn} aria-label="Notifications">
            <svg className={styles.bellSolid} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19ZM12 22C10.9 22 10 21.1 10 20H14C14 21.1 13.1 22 12 22Z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className={styles.insightsCard}>
        <div className={styles.insightsHeader}>
          {/* ✅ 大四角星 + 右上小四角星，且同 teal */}
          <svg width="20" height="20" viewBox="0 0 24 24" className={styles.sparkleIcon} aria-hidden="true">
            <path
              d="M8 3l2.2 6.2L16.5 11l-6.3 1.8L8 19l-2.2-6.2L-.5 11l6.3-1.8L8 3z"
              fill="#008296"
            />
            <path
              d="M18.3 4.2l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9.9-2.5z"
              fill="#008296"
            />
          </svg>

          <div className={styles.insightsContent}>
            <h2 className={styles.insightsTitle}>{t('businessPerformanceInsights')}</h2>
            <p className={styles.insightsText}>{t('allCaughtUp')}</p>
          </div>
        </div>

        <div className={styles.feedbackSection}>
          <span className={styles.feedbackText}>{t('helpImproveExperience')}</span>
          <div className={styles.feedbackIcons}>
            {/* ✅ 实心点赞图标 */}
            <svg className={styles.feedbackIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
            </svg>
            {/* ✅ 实心踩图标 */}
            <svg className={styles.feedbackIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
            </svg>
            <div className={styles.separator} />
            <Copy className={styles.feedbackIcon} />
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className={styles.filtersContainer}>
        <div className={styles.filtersCard}>
          <div className={styles.filtersInner}>
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t('date')}</label>

                <div className={styles.datePicker}>
                  <CustomDateDropdown value={selectedDateRange} onChange={handleDateRangeChange} />

                  {selectedDateRange === 'custom' && (
                    <div className={styles.dateInputsRow}>
                      <DatePicker value={startDate} onChange={setStartDate} />
                      <DatePicker value={endDate} onChange={setEndDate} />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t('salesBreakdown')}</label>
                <select className={styles.filterSelect}>
                  <option>{t('marketplaceTotal')}</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>{t('fulfillmentChannel')}</label>
                <select className={styles.filterSelect}>
                  <option>{t('bothAmazonAndSeller')}</option>
                </select>
              </div>

              <div className={styles.applyWrap}>
                <button className={styles.btnApply} onClick={handleApplyFilters}>
                  {t('apply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SNAPSHOT */}
      <div className={styles.snapshotSection}>
        <div className={styles.snapshotHeader}>
          <h2 className={styles.snapshotTitle}>{t('salesSnapshot')}</h2>
          <span className={styles.snapshotTimestamp}>
            {t('takenAt')} {snapshotData.timestamp}
          </span>
        </div>

        <div className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>{t('totalOrderItems')}</div>
            <div className={styles.metricValue}>{snapshotData.totalOrderItems}</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>{t('unitsOrdered')}</div>
            <div className={styles.metricValue}>{snapshotData.unitsOrdered}</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>{t('orderedProductSales')}</div>
            <div className={styles.metricValue}>{snapshotData.orderedProductSales}</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>{t('avgUnitsOrderItem')}</div>
            <div className={styles.metricValue}>{snapshotData.avgUnitsPerOrder}</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>{t('avgSalesOrderItem')}</div>
            <div className={styles.metricValue}>{snapshotData.avgSalesPerOrder}</div>
          </div>
        </div>
      </div>

      {/* COMPARE */}
      <div className={styles.compareSection}>
        <div className={styles.compareHeader}>
          <h2 className={styles.compareTitle}>{t('compareSales')}</h2>

          <div className={styles.viewToggle}>
            <button
              className={cn(styles.viewBtn, activeView === 'graph' && styles.viewBtnActive)}
              onClick={() => setActiveView('graph')}
            >
              {t('graphView')}
            </button>
            <button
              className={cn(styles.viewBtn, activeView === 'table' && styles.viewBtnActive)}
              onClick={() => setActiveView('table')}
            >
              {t('tableView')}
            </button>
          </div>
        </div>

        {activeView === 'graph' ? (
          <div className={styles.chartsFrame}>
            {/* Units Chart */}
            <div className={styles.chartWrapper}>
              <div className={styles.yAxisTitle}>Units ordered</div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataWithCompare} margin={{ top: 18, right: 20, left: 12, bottom: isHourlyView ? 20 : 8 }}>
                  <CartesianGrid vertical={false} stroke="#e7e7e7" strokeWidth={1} />
                  <XAxis
                    dataKey="xIndex"
                    type="number"
                    domain={xAxisDomain}
                    ticks={xAxisTicks}
                    axisLine={{ stroke: '#d5d9d9' }}
                    tickLine={{ stroke: '#d5d9d9', strokeWidth: 0.5 }}
                    tick={{
                      fontSize: 10,
                      fill: '#565959',
                      angle: isHourlyView ? -45 : 0,
                      textAnchor: isHourlyView ? 'end' : 'middle'
                    }}
                    interval={0}
                    tickFormatter={xAxisTickFormatter}
                    height={isHourlyView ? 50 : 30}
                    padding={{ left: 5, right: 5 }}
                  />
                  <YAxis
                    ticks={yAxisConfig.unitsConfig.ticks}
                    domain={yAxisConfig.unitsConfig.domain}
                    tickFormatter={formatUnitsTick}
                    tick={{ fontSize: 9, fill: '#565959', dx: -5 }}
                    axisLine={false}
                    tickLine={{ stroke: '#d5d9d9' }}
                  />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      const showLastYear = showComparison && (d.lastYearUnits || 0) > 0;
                      const date = isHourlyView
                        ? `${new Date(d.date).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          })} ${d.hourLabel || ''}`
                        : new Date(d.date).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                      return (
                        <div style={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                          padding: '8px 12px',
                          fontSize: 12,
                          lineHeight: 1.4,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          minWidth: 160
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 4, color: '#333' }}>{date}</div>
                          <div style={{ color: '#008296', marginBottom: showLastYear ? 2 : 0 }}>
                            {formatNumber(d.units)} Units {formatCurrency(d.sales)}
                          </div>
                          {showLastYear && (
                            <div style={{ color: '#d73027' }}>
                              {formatNumber(d.lastYearUnits)} Units {formatCurrency(d.lastYearSales)}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  {isCurrentVisible && (
                    <Line type="linear" dataKey="units" stroke="#008296" strokeWidth={1} dot={false} activeDot={false} />
                  )}
                  {showComparison && visibleCompareSeries.map(series => (
                    <Line
                      key={`units-${series.key}`}
                      type="linear"
                      dataKey={`compare_${series.key}_units`}
                      stroke={getCompareColor(series.key)}
                      strokeWidth={1}
                      dot={false}
                      activeDot={false}
                    />
                  ))}
                  {!visibleCompareSeries.length && showComparison && chartData.some(d => (d.lastYearUnits || 0) > 0) && (
                    <Line type="linear" dataKey="lastYearUnits" stroke="#d73027" strokeWidth={1} dot={false} activeDot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Vertical Divider */}
            <div className={styles.chartDivider} />

            {/* Sales Chart */}
            <div className={styles.chartWrapper}>
              <div className={styles.yAxisTitle}>Ordered product sales</div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataWithCompare} margin={{ top: 18, right: 20, left: 12, bottom: isHourlyView ? 20 : 8 }}>
                  <CartesianGrid vertical={false} stroke="#e7e7e7" strokeWidth={1} />
                  <XAxis
                    dataKey="xIndex"
                    type="number"
                    domain={xAxisDomain}
                    ticks={xAxisTicks}
                    axisLine={{ stroke: '#d5d9d9' }}
                    tickLine={{ stroke: '#d5d9d9', strokeWidth: 0.5 }}
                    tick={{
                      fontSize: 10,
                      fill: '#565959',
                      angle: isHourlyView ? -45 : 0,
                      textAnchor: isHourlyView ? 'end' : 'middle'
                    }}
                    interval={0}
                    tickFormatter={xAxisTickFormatter}
                    height={isHourlyView ? 50 : 30}
                    padding={{ left: 5, right: 5 }}
                  />
                  <YAxis
                    ticks={yAxisConfig.salesConfig.ticks}
                    domain={yAxisConfig.salesConfig.domain}
                    tickFormatter={formatSalesTick}
                    tick={{ fontSize: 9, fill: '#565959', dx: -5 }}
                    axisLine={false}
                    tickLine={{ stroke: '#d5d9d9' }}
                  />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      const showLastYear = showComparison && (d.lastYearSales || 0) > 0;
                      const date = isHourlyView
                        ? `${new Date(d.date).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          })} ${d.hourLabel || ''}`
                        : new Date(d.date).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                      return (
                        <div style={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                          padding: '8px 12px',
                          fontSize: 12,
                          lineHeight: 1.4,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          minWidth: 160
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 4, color: '#333' }}>{date}</div>
                          <div style={{ color: '#008296', marginBottom: showLastYear ? 2 : 0 }}>
                            {formatNumber(d.units)} Units {formatCurrency(d.sales)}
                          </div>
                          {showLastYear && (
                            <div style={{ color: '#d73027' }}>
                              {formatNumber(d.lastYearUnits)} Units {formatCurrency(d.lastYearSales)}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  {isCurrentVisible && (
                    <Line type="linear" dataKey="sales" stroke="#008296" strokeWidth={1} dot={false} activeDot={false} />
                  )}
                  {showComparison && visibleCompareSeries.map(series => (
                    <Line
                      key={`sales-${series.key}`}
                      type="linear"
                      dataKey={`compare_${series.key}_sales`}
                      stroke={getCompareColor(series.key)}
                      strokeWidth={1}
                      dot={false}
                      activeDot={false}
                    />
                  ))}
                  {!visibleCompareSeries.length && showComparison && chartData.some(d => (d.lastYearSales || 0) > 0) && (
                    <Line type="linear" dataKey="lastYearSales" stroke="#d73027" strokeWidth={1} dot={false} activeDot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-[3px] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-[#565959] font-bold">Date</th>
                  <th className="px-4 py-2 text-right text-[#565959] font-bold">Units</th>
                  <th className="px-4 py-2 text-right text-[#565959] font-bold">Sales</th>
                  <th className="px-4 py-2 text-right text-[#565959] font-bold">Last Year Units</th>
                  <th className="px-4 py-2 text-right text-[#565959] font-bold">Last Year Sales</th>
                </tr>
              </thead>
              <tbody>
                {chartData.length ? (
                  chartData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-[#0F1111]">{row.date}</td>
                      <td className="px-4 py-2 text-right text-[#0F1111]">{formatNumber(row.units)}</td>
                      <td className="px-4 py-2 text-right text-[#0F1111]">{formatCurrency(row.sales)}</td>
                      <td className="px-4 py-2 text-right text-[#0F1111]">{formatNumber(row.lastYearUnits)}</td>
                      <td className="px-4 py-2 text-right text-[#0F1111]">{formatCurrency(row.lastYearSales)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#565959]">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* LEGEND */}
        <div className={styles.compareLegend}>
          <div className={styles.compareLeft}>
            <span className={styles.compareLabel}>{t('compare')}</span>
            <a href="#" className={styles.whatsThisLink}>{t('whatsThis')}</a>
          </div>

          <div className="w-px bg-[#ddd] ml-12 mr-6 self-stretch" />

          <div className={styles.compareContent}>
            {hasCustomCompare ? (
              <div className={styles.compareColumns}>
                {compareColumns.map((column, idx) => (
                  <React.Fragment key={`${column.label}-${idx}`}>
                    {renderCompareColumn(column)}
                    {idx < compareColumns.length - 1 && (
                      <div className="w-px bg-[#ddd] ml-4 mr-4 self-stretch" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <>
                <div className={styles.compareCheckbox}>
                  <div className="w-4 h-4 border-2 border-[#007185] rounded-[2px] bg-[#007185] flex items-center justify-center mt-1">
                    <Check size={12} className="text-white" />
                  </div>
                  <div>
                    <span className={styles.checkboxLabel}>{t('selectedDateRange')}</span>
                    <div className={styles.checkboxValues}>
                      <span style={{ color: '#008296' }}>{snapshotData.unitsOrdered} {t('units')}</span>
                      <br />
                      <span style={{ color: '#008296' }}>{snapshotData.orderedProductSales}</span>
                    </div>
                  </div>
                </div>

                <div className="w-px bg-[#ddd] ml-4 mr-8 self-stretch" />

                {showComparison && chartData.some(d => (d.lastYearUnits || 0) > 0 || (d.lastYearSales || 0) > 0) && (
                  <div className={styles.compareCheckbox}>
                    <div className="w-4 h-4 border-2 border-[#007185] rounded-[2px] bg-[#007185] flex items-center justify-center mt-1">
                      <Check size={12} className="text-white" />
                    </div>
                    <div>
                      <span className={styles.checkboxLabel}>{t('sameDateRangeOneYearAgo')}</span>
                      <div className={styles.checkboxValues}>
                        <span style={{ color: '#d73027' }}>
                          {new Intl.NumberFormat('en-US').format(
                            chartData.reduce((sum, item) => sum + (item.lastYearUnits || 0), 0)
                          )} {t('units')}
                        </span>
                        <br />
                        <span style={{ color: '#d73027' }}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                            chartData.reduce((sum, item) => sum + (item.lastYearSales || 0), 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 真实：Compare 下方标题 */}
      <h2 className={styles.deepDiveTitle}>{t('deepDiveAsinPerformance')}</h2>
      <p className={styles.deepDiveSubtitle}>{t('diveDeeperPerformanceSpecificAsins')}</p>
    </div>
  );
};

export default BusinessReports;



