import express from 'express';
import { dataService } from '../services/dataService';
import { 
  SalesSnapshotSchema,
  DailySalesSchema,
  type GlobalSnapshot,
  type SalesSnapshot, 
  type DailySales,
  type ApiResponse,
  type SalesDateRange
} from '../types/index';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

type HourlyPoint = { hour: number; units: number; sales: number };
type HourlySeries = { date: string; hours: HourlyPoint[] };
type DailyPoint = {
  date: string;
  units: number;
  sales: number;
  lastYearUnits?: number;
  lastYearSales?: number;
};
type SalesTimeSeries = {
  id?: string;
  store_id: string;
  updated_at?: string;
  day: {
    today?: HourlySeries;
    yesterday?: HourlySeries;
    sameDayLastWeek?: HourlySeries;
    sameDayLastYear?: HourlySeries;
  };
  week: {
    startDate: string;
    endDate: string;
    current: DailyPoint[];
    lastWeek: DailyPoint[];
    lastYear: DailyPoint[];
  };
  month: {
    startDate: string;
    endDate: string;
    current: DailyPoint[];
    lastMonth: DailyPoint[];
    lastYear: DailyPoint[];
  };
  year: {
    startDate: string;
    endDate: string;
    days: DailyPoint[];
  };
};

type CompareColumn = { key: string; label: string; lines: string[] };
type CompareSeriesPoint = {
  xIndex: number;
  units: number;
  sales: number;
  hourLabel?: string;
  date?: string;
  weekLabel?: string;
};
type CompareSeries = { key: string; label: string; data: CompareSeriesPoint[] };

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

const computeSnapshotAverages = (totalOrderItems: number, unitsOrdered: number, orderedProductSales: number) => {
  const safeTotal = totalOrderItems > 0 ? totalOrderItems : 0;
  const avgUnits = safeTotal > 0 ? unitsOrdered / safeTotal : 0;
  const avgSales = safeTotal > 0 ? orderedProductSales / safeTotal : 0;
  return {
    avgUnits: Number(avgUnits.toFixed(2)),
    avgSales: Number(avgSales.toFixed(2)),
  };
};

const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const buildWeights = (start: Date, days: number, rng: () => number) => {
  const weights: number[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDaysUtc(start, i);
    const dayOfWeek = date.getUTCDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.9 : 1;
    const r1 = rng();
    const r2 = rng();
    const r3 = rng();
    const r4 = rng();
    const base = 0.02 + r1 * 6.5; // 0.02 - 6.52
    const tail = Math.pow(r2, 2.1); // heavier tail
    const spread = 0.05 + tail * 24; // 0.05 - 24.05
    const spike = r3 > 0.9 ? 8 + r3 * 10 : r3 < 0.08 ? 0.04 : 1;
    const dip = r4 > 0.85 ? 0.25 : 1;
    const r5 = rng();
    const nearZero = r5 < 0.1 ? 0.01 : 1;
    const weight = base * spread * spike * dip * nearZero * weekendFactor;
    weights.push(Math.max(0.001, Math.min(35, weight)));
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

const formatHourLabel = (hour: number) => {
  const normalized = hour % 24;
  const suffix = normalized < 12 ? 'AM' : 'PM';
  const display = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${display}${suffix}`;
};

const buildHourlyWeights = (rng: () => number) => {
  const weights: number[] = [];
  for (let i = 0; i < 24; i++) {
    const r1 = rng();
    const r2 = rng();
    const r3 = rng();
    const r4 = rng();
    const base = 0.05 + r1 * 2.5; // 0.05 - 2.55
    const tail = Math.pow(r2, 2.2);
    const spread = 0.1 + tail * 18; // 0.1 - 18.1
    const spike = r3 > 0.88 ? 6 + r3 * 8 : 1;
    const dip = r4 < 0.12 ? 0.12 : 1;
    const weight = base * spread * spike * dip;
    weights.push(Math.max(0.002, Math.min(40, weight)));
  }
  return weights;
};

const buildHourlySeries = (
  dateIso: string,
  totalUnits: number,
  totalSales: number,
  rng: () => number
): HourlySeries => {
  const unitWeights = buildHourlyWeights(rng);
  const salesWeights = buildHourlyWeights(rng);
  const units = allocateTotals(Math.max(0, Math.round(totalUnits)), unitWeights);
  const sales = allocateTotals(Math.max(0, Math.round(totalSales)), salesWeights);

  const hours: HourlyPoint[] = [];
  for (let hour = 0; hour < 24; hour++) {
    hours.push({
      hour,
      units: units[hour],
      sales: sales[hour],
    });
  }
  return { date: dateIso, hours };
};

const hourlyToChartData = (series: HourlySeries, lastYear?: HourlySeries) => {
  const lastYearMap = new Map<number, HourlyPoint>();
  if (lastYear) {
    lastYear.hours.forEach(item => lastYearMap.set(item.hour, item));
  }

  return series.hours.map(item => {
    const last = lastYearMap.get(item.hour);
    return {
      date: series.date,
      hour: item.hour,
      hourLabel: formatHourLabel(item.hour),
      xIndex: item.hour,
      units: item.units,
      sales: item.sales,
      lastYearUnits: last?.units ?? 0,
      lastYearSales: last?.sales ?? 0,
    };
  });
};

const hourlyToSeriesData = (series: HourlySeries): CompareSeriesPoint[] =>
  series.hours.map(item => ({
    date: series.date,
    hour: item.hour,
    hourLabel: formatHourLabel(item.hour),
    xIndex: item.hour,
    units: item.units,
    sales: item.sales,
  }));

const weekToSeriesData = (entries: DailyPoint[]): CompareSeriesPoint[] =>
  entries.map((item, idx) => ({
    date: item.date,
    xIndex: idx,
    weekLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx],
    units: item.units,
    sales: item.sales,
  }));

const monthToSeriesData = (entries: DailyPoint[]): CompareSeriesPoint[] =>
  entries.map(item => ({
    date: item.date,
    xIndex: Number(item.date.split('-')[2]),
    units: item.units,
    sales: item.sales,
  }));

const getWeekStartUtc = (date: Date) => {
  const start = new Date(date);
  const day = start.getUTCDay();
  const diff = (day + 6) % 7;
  start.setUTCDate(start.getUTCDate() - diff);
  return toUtcDate(start);
};

const generateDailySeries = (storeId: string, totalUnits: number, totalSales: number, days = 365) => {
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

  const lastYearUnitsScale = 0.3 + lastYearUnitRng() * 0.9; // 0.30 - 1.20
  const lastYearSalesScale = 0.25 + lastYearSalesRng() * 0.95; // 0.25 - 1.20
  const lastYearUnitWeights = buildWeights(start, days, lastYearUnitRng);
  const lastYearSalesWeights = buildWeights(start, days, lastYearSalesRng);
  const lastYearUnits = allocateTotals(
    Math.max(0, Math.round(totalUnits * lastYearUnitsScale)),
    lastYearUnitWeights.map(w => w * (0.2 + lastYearUnitRng() * 3.0))
  );
  const lastYearSales = allocateTotals(
    Math.max(0, Math.round(totalSales * lastYearSalesScale)),
    lastYearSalesWeights.map(w => w * (0.2 + lastYearSalesRng() * 3.0))
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

const buildDailyMap = (entries: DailyPoint[]) => {
  const map = new Map<string, DailyPoint>();
  entries.forEach(entry => {
    map.set(entry.date, entry);
  });
  return map;
};

const normalizeDaily = (entry: DailyPoint | undefined, date: string): DailyPoint => ({
  date,
  units: entry?.units ?? 0,
  sales: entry?.sales ?? 0,
  lastYearUnits: entry?.lastYearUnits ?? 0,
  lastYearSales: entry?.lastYearSales ?? 0,
});

const buildWeekSeriesFromDaily = (dailyMap: Map<string, DailyPoint>, todayUtc: Date) => {
  const weekStart = getWeekStartUtc(todayUtc);
  const current: DailyPoint[] = [];
  const lastWeek: DailyPoint[] = [];
  const lastYear: DailyPoint[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = addDaysUtc(weekStart, i);
    const currentIso = formatDate(currentDate);
    const currentRecord = normalizeDaily(dailyMap.get(currentIso), currentIso);
    const isFuture = currentDate.getTime() > todayUtc.getTime();

    current.push({
      ...currentRecord,
      units: isFuture ? 0 : currentRecord.units,
      sales: isFuture ? 0 : currentRecord.sales,
      lastYearUnits: isFuture ? 0 : currentRecord.lastYearUnits,
      lastYearSales: isFuture ? 0 : currentRecord.lastYearSales,
    });

    const lastWeekDate = addDaysUtc(weekStart, i - 7);
    const lastWeekIso = formatDate(lastWeekDate);
    lastWeek.push(normalizeDaily(dailyMap.get(lastWeekIso), lastWeekIso));

    const lastYearDate = new Date(Date.UTC(
      currentDate.getUTCFullYear() - 1,
      currentDate.getUTCMonth(),
      currentDate.getUTCDate()
    ));
    const lastYearIso = formatDate(lastYearDate);
    lastYear.push({
      date: lastYearIso,
      units: currentRecord.lastYearUnits ?? 0,
      sales: currentRecord.lastYearSales ?? 0,
    });
  }

  return {
    startDate: formatDate(weekStart),
    endDate: formatDate(addDaysUtc(weekStart, 6)),
    current,
    lastWeek,
    lastYear,
  };
};

const buildMonthSeriesFromDaily = (dailyMap: Map<string, DailyPoint>, todayUtc: Date) => {
  const monthStart = toUtcDate(new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), 1)));
  const daysInMonth = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() + 1, 0)).getUTCDate();
  const current: DailyPoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = toUtcDate(new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), day)));
    const iso = formatDate(date);
    const record = normalizeDaily(dailyMap.get(iso), iso);
    const isFuture = date.getTime() > todayUtc.getTime();
    current.push({
      ...record,
      units: isFuture ? 0 : record.units,
      sales: isFuture ? 0 : record.sales,
      lastYearUnits: isFuture ? 0 : record.lastYearUnits,
      lastYearSales: isFuture ? 0 : record.lastYearSales,
    });
  }

  const lastMonthStart = toUtcDate(new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() - 1, 1)));
  const daysInLastMonth = new Date(Date.UTC(lastMonthStart.getUTCFullYear(), lastMonthStart.getUTCMonth() + 1, 0)).getUTCDate();
  const lastMonth: DailyPoint[] = [];
  for (let day = 1; day <= daysInLastMonth; day++) {
    const date = toUtcDate(new Date(Date.UTC(lastMonthStart.getUTCFullYear(), lastMonthStart.getUTCMonth(), day)));
    const iso = formatDate(date);
    lastMonth.push(normalizeDaily(dailyMap.get(iso), iso));
  }

  const lastYear: DailyPoint[] = current.map(item => {
    const baseDate = new Date(item.date);
    const lastYearDate = new Date(Date.UTC(
      baseDate.getUTCFullYear() - 1,
      baseDate.getUTCMonth(),
      baseDate.getUTCDate()
    ));
    return {
      date: formatDate(lastYearDate),
      units: item.lastYearUnits ?? 0,
      sales: item.lastYearSales ?? 0,
    };
  });

  return {
    startDate: formatDate(monthStart),
    endDate: formatDate(addDaysUtc(monthStart, daysInMonth - 1)),
    current,
    lastMonth,
    lastYear,
  };
};

const buildDaySeriesFromDaily = (storeId: string, dailyMap: Map<string, DailyPoint>, todayUtc: Date) => {
  const todayIso = formatDate(todayUtc);
  const yesterdayIso = formatDate(addDaysUtc(todayUtc, -1));
  const lastWeekIso = formatDate(addDaysUtc(todayUtc, -7));
  const todayRecord = normalizeDaily(dailyMap.get(todayIso), todayIso);
  const yesterdayRecord = normalizeDaily(dailyMap.get(yesterdayIso), yesterdayIso);
  const lastWeekRecord = normalizeDaily(dailyMap.get(lastWeekIso), lastWeekIso);

  const seedBase = (Date.now() ^ hashString(storeId) ^ Math.floor(Math.random() * 1e9)) >>> 0;
  const rngYesterday = createRng(seedBase + 17);
  const rngLastWeek = createRng(seedBase + 73);
  const rngLastYear = createRng(seedBase + 131);

  const lastYearDate = new Date(Date.UTC(
    todayUtc.getUTCFullYear() - 1,
    todayUtc.getUTCMonth(),
    todayUtc.getUTCDate()
  ));
  const lastYearIso = formatDate(lastYearDate);

  return {
    yesterday: buildHourlySeries(yesterdayIso, yesterdayRecord.units, yesterdayRecord.sales, rngYesterday),
    sameDayLastWeek: buildHourlySeries(lastWeekIso, lastWeekRecord.units, lastWeekRecord.sales, rngLastWeek),
    sameDayLastYear: buildHourlySeries(
      lastYearIso,
      todayRecord.lastYearUnits ?? 0,
      todayRecord.lastYearSales ?? 0,
      rngLastYear
    ),
  };
};

const buildTimeSeriesFromDaily = (
  storeId: string,
  entries: DailyPoint[],
  existingToday?: HourlySeries
): SalesTimeSeries => {
  const todayUtc = toUtcDate(new Date());
  const dailyMap = buildDailyMap(entries);

  const day = buildDaySeriesFromDaily(storeId, dailyMap, todayUtc);
  const week = buildWeekSeriesFromDaily(dailyMap, todayUtc);
  const month = buildMonthSeriesFromDaily(dailyMap, todayUtc);

  return {
    store_id: storeId,
    updated_at: new Date().toISOString(),
    day: {
      today: existingToday,
      ...day,
    },
    week,
    month,
    year: {
      startDate: entries.length ? entries[0].date : formatDate(addDaysUtc(todayUtc, -364)),
      endDate: entries.length ? entries[entries.length - 1].date : formatDate(todayUtc),
      days: entries,
    },
  };
};

const loadTimeSeriesForStore = async (storeId: string) => {
  const series = await dataService.findByStoreId<SalesTimeSeries>('sales_time_series', storeId);
  return series[0] || null;
};

const upsertTimeSeries = async (storeId: string, series: SalesTimeSeries) => {
  const existing = await loadTimeSeriesForStore(storeId);
  if (existing) {
    const updated = await dataService.update<SalesTimeSeries>('sales_time_series', existing.id as string, {
      ...series,
      store_id: storeId,
      updated_at: new Date().toISOString(),
    });
    return updated ?? { ...series, store_id: storeId };
  }
  return dataService.create<SalesTimeSeries>('sales_time_series', {
    ...series,
    store_id: storeId,
    updated_at: new Date().toISOString(),
  });
};

const fillTodaySeriesFromGlobalSnapshot = async (storeId: string, series: SalesTimeSeries) => {
  const snapshots = await dataService.findByStoreId<GlobalSnapshot>('global_snapshots', storeId);
  const snapshot = snapshots[0];
  if (!snapshot) return series;

  const totalUnits = snapshot.open_orders || 0;
  const totalSales = snapshot.sales_amount || 0;
  const todayIso = formatDate(toUtcDate(new Date()));
  const seedBase = hashString(`${storeId}-${todayIso}-${totalUnits}-${totalSales}`);
  const todaySeries = buildHourlySeries(todayIso, totalUnits, totalSales, createRng(seedBase + 29));

  return {
    ...series,
    day: {
      ...(series.day || {}),
      today: todaySeries,
    }
  };
};

const ensureTimeSeries = async (storeId: string) => {
  const existing = await loadTimeSeriesForStore(storeId);
  if (existing && existing.year?.days?.length) {
    const filled = await fillTodaySeriesFromGlobalSnapshot(storeId, existing);
    if (filled !== existing) {
      return upsertTimeSeries(storeId, filled);
    }
    return existing;
  }

  const snapshots = await dataService.findByStoreId<SalesSnapshot>('sales_snapshots', storeId);
  const snapshot = snapshots[0];
  const totalUnits = snapshot?.units_ordered ?? 192260;
  const totalSales = snapshot?.ordered_product_sales ?? 18657478;

  const { entries } = generateDailySeries(storeId, totalUnits, totalSales);
  saveChartDataForStore(storeId, entries);
  await saveDailySalesForStore(storeId, entries);

  const nextSeries = buildTimeSeriesFromDaily(storeId, entries, existing?.day?.today);
  const filled = await fillTodaySeriesFromGlobalSnapshot(storeId, nextSeries);
  return upsertTimeSeries(storeId, filled);
};

const formatUnitsLine = (value: number) =>
  `${new Intl.NumberFormat('en-US').format(Math.round(value))} Units`;
const formatSalesLine = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const sumHourly = (series?: HourlySeries) => {
  if (!series) return { units: 0, sales: 0 };
  return series.hours.reduce(
    (acc, item) => {
      acc.units += item.units;
      acc.sales += item.sales;
      return acc;
    },
    { units: 0, sales: 0 }
  );
};

const sumDaily = (entries?: DailyPoint[]) => {
  if (!entries || !entries.length) return { units: 0, sales: 0 };
  return entries.reduce(
    (acc, item) => {
      acc.units += item.units;
      acc.sales += item.sales;
      return acc;
    },
    { units: 0, sales: 0 }
  );
};

const buildSeriesResponse = (
  series: SalesTimeSeries,
  dimension: string | undefined,
  startDate?: string,
  endDate?: string
) => {
  const dailyEntries = series.year?.days ?? [];
  const dailyMap = buildDailyMap(dailyEntries);
  const todayUtc = toUtcDate(new Date());
  const todayIso = formatDate(todayUtc);
  const yesterdayIso = formatDate(addDaysUtc(todayUtc, -1));
  const lastWeekIso = formatDate(addDaysUtc(todayUtc, -7));

  const weekSeries = series.week?.current?.length
    ? series.week
    : buildWeekSeriesFromDaily(dailyMap, todayUtc);
  const monthSeries = series.month?.current?.length
    ? series.month
    : buildMonthSeriesFromDaily(dailyMap, todayUtc);

  const buildHourlyFromTotals = (dateIso: string, units: number, sales: number, seed: number) =>
    buildHourlySeries(dateIso, units, sales, createRng(seed));

  const compare = { columns: [] as CompareColumn[], series: [] as CompareSeries[] };

  if (dimension === 'today') {
    const todayRecord = normalizeDaily(dailyMap.get(todayIso), todayIso);
    const yesterdayRecord = normalizeDaily(dailyMap.get(yesterdayIso), yesterdayIso);
    const lastWeekRecord = normalizeDaily(dailyMap.get(lastWeekIso), lastWeekIso);

    const seedBase = (Date.now() ^ hashString(series.store_id) ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const todaySeries =
      series.day?.today ??
      buildHourlyFromTotals(todayIso, todayRecord.units, todayRecord.sales, seedBase + 11);
    const yesterdaySeries =
      series.day?.yesterday ??
      buildHourlyFromTotals(yesterdayIso, yesterdayRecord.units, yesterdayRecord.sales, seedBase + 17);
    const lastWeekSeries =
      series.day?.sameDayLastWeek ??
      buildHourlyFromTotals(lastWeekIso, lastWeekRecord.units, lastWeekRecord.sales, seedBase + 23);

    const lastYearDate = new Date(Date.UTC(
      todayUtc.getUTCFullYear() - 1,
      todayUtc.getUTCMonth(),
      todayUtc.getUTCDate()
    ));
    const lastYearIso = formatDate(lastYearDate);
    const lastYearSeries =
      series.day?.sameDayLastYear ??
      buildHourlyFromTotals(
        lastYearIso,
        todayRecord.lastYearUnits ?? 0,
        todayRecord.lastYearSales ?? 0,
        seedBase + 37
      );

    const chartData = hourlyToChartData(todaySeries, lastYearSeries);

    const now = new Date();
    const hourString = now.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      hour12: false
    });
    const parsedHour = Number(hourString);
    const currentHour = Number.isNaN(parsedHour) ? now.getHours() : parsedHour;
    const todaySoFar = todaySeries.hours
      .filter(item => item.hour <= currentHour)
      .reduce((acc, item) => {
        acc.units += item.units;
        acc.sales += item.sales;
        return acc;
      }, { units: 0, sales: 0 });

    const yesterdayTotals = sumHourly(yesterdaySeries);
    const lastWeekTotals = sumHourly(lastWeekSeries);
    const lastYearTotals = sumHourly(lastYearSeries);

    compare.columns = [
      {
        key: 'current',
        label: 'Today so far',
        lines: [formatUnitsLine(todaySoFar.units), formatSalesLine(todaySoFar.sales)]
      },
      {
        key: 'yesterday',
        label: 'Yesterday',
        lines: ['By end of day', formatUnitsLine(yesterdayTotals.units), formatSalesLine(yesterdayTotals.sales)]
      },
      {
        key: 'sameDayLastWeek',
        label: 'Same day last week',
        lines: ['By end of day', formatUnitsLine(lastWeekTotals.units), formatSalesLine(lastWeekTotals.sales)]
      },
      {
        key: 'sameDayLastYear',
        label: 'Same day last year',
        lines: ['By end of day', formatUnitsLine(lastYearTotals.units), formatSalesLine(lastYearTotals.sales)]
      },
    ];

    compare.series = [
      { key: 'yesterday', label: 'Yesterday', data: hourlyToSeriesData(yesterdaySeries) },
      { key: 'sameDayLastWeek', label: 'Same day last week', data: hourlyToSeriesData(lastWeekSeries) },
      { key: 'sameDayLastYear', label: 'Same day last year', data: hourlyToSeriesData(lastYearSeries) },
    ];

    return { data: chartData, compare };
  }

  if (dimension === 'yesterday') {
    const yesterdayRecord = normalizeDaily(dailyMap.get(yesterdayIso), yesterdayIso);
    const dayBeforeIso = formatDate(addDaysUtc(todayUtc, -2));
    const dayBeforeRecord = normalizeDaily(dailyMap.get(dayBeforeIso), dayBeforeIso);
    const lastWeekFromYesterdayIso = formatDate(addDaysUtc(todayUtc, -8));
    const lastWeekRecord = normalizeDaily(dailyMap.get(lastWeekFromYesterdayIso), lastWeekFromYesterdayIso);

    const seedBase = (Date.now() ^ hashString(series.store_id) ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const yesterdaySeries =
      series.day?.yesterday ??
      buildHourlyFromTotals(yesterdayIso, yesterdayRecord.units, yesterdayRecord.sales, seedBase + 19);

    const lastYearDate = new Date(Date.UTC(
      todayUtc.getUTCFullYear() - 1,
      todayUtc.getUTCMonth(),
      todayUtc.getUTCDate() - 1
    ));
    const lastYearIso = formatDate(lastYearDate);
    const dayBeforeSeries = buildHourlyFromTotals(
      dayBeforeIso,
      dayBeforeRecord.units,
      dayBeforeRecord.sales,
      seedBase + 31
    );
    const lastWeekSeries = buildHourlyFromTotals(
      lastWeekFromYesterdayIso,
      lastWeekRecord.units,
      lastWeekRecord.sales,
      seedBase + 43
    );
    const lastYearSeries = buildHourlyFromTotals(
      lastYearIso,
      yesterdayRecord.lastYearUnits ?? 0,
      yesterdayRecord.lastYearSales ?? 0,
      seedBase + 41
    );

    const chartData = hourlyToChartData(yesterdaySeries, lastYearSeries);
    const yesterdayTotals = sumHourly(yesterdaySeries);

    compare.columns = [
      {
        key: 'current',
        label: 'Yesterday',
        lines: ['By end of day', formatUnitsLine(yesterdayTotals.units), formatSalesLine(yesterdayTotals.sales)]
      },
      {
        key: 'dayBeforeYesterday',
        label: 'Day before yesterday',
        lines: ['By end of day', formatUnitsLine(dayBeforeRecord.units), formatSalesLine(dayBeforeRecord.sales)]
      },
      {
        key: 'sameDayLastWeek',
        label: 'Same day last week',
        lines: ['By end of day', formatUnitsLine(lastWeekRecord.units), formatSalesLine(lastWeekRecord.sales)]
      },
      {
        key: 'sameDayLastYear',
        label: 'Same day last year',
        lines: ['By end of day', formatUnitsLine(yesterdayRecord.lastYearUnits ?? 0), formatSalesLine(yesterdayRecord.lastYearSales ?? 0)]
      },
    ];

    compare.series = [
      { key: 'dayBeforeYesterday', label: 'Day before yesterday', data: hourlyToSeriesData(dayBeforeSeries) },
      { key: 'sameDayLastWeek', label: 'Same day last week', data: hourlyToSeriesData(lastWeekSeries) },
      { key: 'sameDayLastYear', label: 'Same day last year', data: hourlyToSeriesData(lastYearSeries) },
    ];

    return { data: chartData, compare };
  }

  if (dimension === 'week') {
    const data = weekSeries.current.map((item, idx) => ({
      ...item,
      xIndex: idx,
      weekLabel: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx],
      lastYearUnits: weekSeries.lastYear[idx]?.units ?? item.lastYearUnits ?? 0,
      lastYearSales: weekSeries.lastYear[idx]?.sales ?? item.lastYearSales ?? 0,
    }));

    const currentTotals = sumDaily(weekSeries.current);
    const lastWeekTotals = sumDaily(weekSeries.lastWeek);
    const lastYearTotals = sumDaily(weekSeries.lastYear);

    compare.columns = [
      { key: 'current', label: 'This week so far', lines: [formatUnitsLine(currentTotals.units), formatSalesLine(currentTotals.sales)] },
      { key: 'lastWeek', label: 'Last week', lines: [formatUnitsLine(lastWeekTotals.units), formatSalesLine(lastWeekTotals.sales)] },
      { key: 'sameWeekLastYear', label: 'Same week last year', lines: [formatUnitsLine(lastYearTotals.units), formatSalesLine(lastYearTotals.sales)] },
    ];

    compare.series = [
      { key: 'lastWeek', label: 'Last week', data: weekToSeriesData(weekSeries.lastWeek) },
      { key: 'sameWeekLastYear', label: 'Same week last year', data: weekToSeriesData(weekSeries.lastYear) },
    ];

    return { data, compare };
  }

  if (dimension === 'month') {
    const data = monthSeries.current.map((item) => ({
      ...item,
      xIndex: Number(item.date.split('-')[2]),
      lastYearUnits: item.lastYearUnits ?? 0,
      lastYearSales: item.lastYearSales ?? 0,
    }));

    const currentTotals = sumDaily(monthSeries.current);
    const lastMonthTotals = sumDaily(monthSeries.lastMonth);
    const lastYearTotals = sumDaily(monthSeries.lastYear);

    compare.columns = [
      { key: 'current', label: 'This month so far', lines: [formatUnitsLine(currentTotals.units), formatSalesLine(currentTotals.sales)] },
      { key: 'lastMonth', label: 'Last month', lines: [formatUnitsLine(lastMonthTotals.units), formatSalesLine(lastMonthTotals.sales)] },
      { key: 'sameMonthLastYear', label: 'Same month last year', lines: [formatUnitsLine(lastYearTotals.units), formatSalesLine(lastYearTotals.sales)] },
    ];

    compare.series = [
      { key: 'lastMonth', label: 'Last month', data: monthToSeriesData(monthSeries.lastMonth) },
      { key: 'sameMonthLastYear', label: 'Same month last year', data: monthToSeriesData(monthSeries.lastYear) },
    ];

    return { data, compare };
  }

  const filtered = startDate && endDate
    ? dailyEntries.filter(item => item.date >= startDate && item.date <= endDate)
    : dailyEntries;

  return { data: filtered };
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
    const { avgUnits, avgSales } = computeSnapshotAverages(248, 192260, 18657478);
    snapshot = await dataService.create<SalesSnapshot>('sales_snapshots', {
      store_id: store_id as string,
      total_order_items: 248,
      units_ordered: 192260,
      ordered_product_sales: 18657478,
      avg_units_per_order_item: avgUnits,
      avg_sales_per_order_item: avgSales,
      avg_units_per_order: avgUnits,
      avg_sales_per_order: avgSales,
      snapshot_time: new Date().toISOString(),
    });
  }
  
  const { avgUnits: computedAvgUnits, avgSales: computedAvgSales } = computeSnapshotAverages(
    snapshot.total_order_items || 0,
    snapshot.units_ordered || 0,
    snapshot.ordered_product_sales || 0
  );

  const normalizedSnapshot = {
    ...snapshot,
    avg_units_per_order_item: snapshot.avg_units_per_order_item ?? computedAvgUnits,
    avg_sales_per_order_item: snapshot.avg_sales_per_order_item ?? computedAvgSales,
    avg_units_per_order: snapshot.avg_units_per_order ?? computedAvgUnits,
    avg_sales_per_order: snapshot.avg_sales_per_order ?? computedAvgSales,
  };

  const response: ApiResponse<SalesSnapshot> = {
    success: true,
    data: normalizedSnapshot,
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
    const { avgUnits, avgSales } = computeSnapshotAverages(248, 192260, 18657478);
    snapshot = await dataService.create<SalesSnapshot>('sales_snapshots', {
      store_id: storeId,
      total_order_items: 248,
      units_ordered: 192260,
      ordered_product_sales: 18657478,
      avg_units_per_order_item: avgUnits,
      avg_sales_per_order_item: avgSales,
      avg_units_per_order: avgUnits,
      avg_sales_per_order: avgSales,
      snapshot_time: new Date().toISOString(),
    });
  }
  
  const { avgUnits: computedAvgUnits, avgSales: computedAvgSales } = computeSnapshotAverages(
    snapshot.total_order_items || 0,
    snapshot.units_ordered || 0,
    snapshot.ordered_product_sales || 0
  );

  const normalizedSnapshot = {
    ...snapshot,
    avg_units_per_order_item: snapshot.avg_units_per_order_item ?? computedAvgUnits,
    avg_sales_per_order_item: snapshot.avg_sales_per_order_item ?? computedAvgSales,
    avg_units_per_order: snapshot.avg_units_per_order ?? computedAvgUnits,
    avg_sales_per_order: snapshot.avg_sales_per_order ?? computedAvgSales,
  };

  const response: ApiResponse<SalesSnapshot> = {
    success: true,
    data: normalizedSnapshot,
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
    const totalOrderItems = updateData.total_order_items || 0;
    const unitsOrdered = updateData.units_ordered || 0;
    const orderedProductSales = updateData.ordered_product_sales || 0;
    const { avgUnits, avgSales } = computeSnapshotAverages(totalOrderItems, unitsOrdered, orderedProductSales);

    snapshot = await dataService.create<SalesSnapshot>('sales_snapshots', {
      store_id: storeId,
      total_order_items: totalOrderItems,
      units_ordered: unitsOrdered,
      ordered_product_sales: orderedProductSales,
      avg_units_per_order_item: avgUnits,
      avg_sales_per_order_item: avgSales,
      avg_units_per_order: avgUnits,
      avg_sales_per_order: avgSales,
      snapshot_time: new Date().toISOString(),
    });
  } else {
    // Update existing snapshot
    const totalOrderItems = updateData.total_order_items ?? snapshot.total_order_items ?? 0;
    const unitsOrdered = updateData.units_ordered ?? snapshot.units_ordered ?? 0;
    const orderedProductSales = updateData.ordered_product_sales ?? snapshot.ordered_product_sales ?? 0;
    const { avgUnits, avgSales } = computeSnapshotAverages(totalOrderItems, unitsOrdered, orderedProductSales);

    const updatedSnapshot = await dataService.update<SalesSnapshot>('sales_snapshots', snapshot.id, {
      ...updateData,
      avg_units_per_order_item: avgUnits,
      avg_sales_per_order_item: avgSales,
      avg_units_per_order: avgUnits,
      avg_sales_per_order: avgSales,
    });
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
    const existingSeries = await loadTimeSeriesForStore(storeId);
    const nextSeries = buildTimeSeriesFromDaily(storeId, entries, existingSeries?.day?.today);
    await upsertTimeSeries(storeId, nextSeries);
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
  const { startDate, endDate, dimension } = req.query as unknown as SalesDateRange & { dimension?: string };
  
  try {
    if (dimension) {
      const series = await ensureTimeSeries(storeId);
      const responsePayload = buildSeriesResponse(series, dimension, startDate, endDate);
      const response: ApiResponse = {
        success: true,
        ...responsePayload,
      };
      res.json(response);
      return;
    }

    const chartDataPath = require('path').join(__dirname, '../../data/chart_data.json');
    let chartData: any[] = [];

    try {
      const allChartData = require('fs-extra').readJsonSync(chartDataPath);
      chartData = allChartData.filter((item: any) => item.store_id === storeId);
    } catch (error) {
      console.log('No admin chart data file found, using fallback generation');
    }

    if (chartData.length && chartData.length < 300) {
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
    const snapshots = await dataService.findByStoreId<SalesSnapshot>('sales_snapshots', storeId);
    const snapshot = snapshots[0];
    const totalUnits = snapshot?.units_ordered ?? 192260;
    const totalSales = snapshot?.ordered_product_sales ?? 18657478;

    const { entries } = generateDailySeries(storeId, totalUnits, totalSales);
    saveChartDataForStore(storeId, entries);
    await saveDailySalesForStore(storeId, entries);
    const existingSeries = await loadTimeSeriesForStore(storeId);
    const nextSeries = buildTimeSeriesFromDaily(storeId, entries, existingSeries?.day?.today);
    await upsertTimeSeries(storeId, nextSeries);
    
    const response: ApiResponse = {
      success: true,
      message: `Generated ${entries.length} sample data entries`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Generate sample data error:', error);
    throw createError('Failed to generate sample data', 500);
  }
}));

router.get('/admin/time-series/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  const series = await ensureTimeSeries(storeId);
  const response: ApiResponse = {
    success: true,
    data: series,
  };

  res.json(response);
}));

router.post('/admin/time-series/generate/:storeId', asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  const snapshots = await dataService.findByStoreId<SalesSnapshot>('sales_snapshots', storeId);
  const snapshot = snapshots[0];
  const totalUnits = snapshot?.units_ordered ?? 192260;
  const totalSales = snapshot?.ordered_product_sales ?? 18657478;

  const { entries } = generateDailySeries(storeId, totalUnits, totalSales);
  saveChartDataForStore(storeId, entries);
  await saveDailySalesForStore(storeId, entries);

  const existingSeries = await loadTimeSeriesForStore(storeId);
  const nextSeries = buildTimeSeriesFromDaily(storeId, entries, existingSeries?.day?.today);
  await upsertTimeSeries(storeId, nextSeries);

  const response: ApiResponse = {
    success: true,
    message: 'Sales time series regenerated successfully',
    data: nextSeries,
  };

  res.json(response);
}));



export = router;

