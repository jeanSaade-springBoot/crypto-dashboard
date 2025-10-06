/****************************************************
 * dashboard1.js — Binance-only (clean grouping + 2dp)
 * - Candlestick with index-based X
 * - Prefetch older while panning near left edge
 * - Freeze Y during motion; recompute Y once on idle
 * - OHLC pill: bullish=green, bearish=red (ALL O/H/L/C)
 * - Date format:
 *     1d / 1w -> yyyy/MM/dd
 *     other   -> yyyy/MM/dd hh:mm (UTC)
 * - Number format (OHLC + Y-axis): 125,031.34 (no left zeros)
 ****************************************************/

/* ---------- Small DOM helpers ---------- */
function byId(id) { return document.getElementById(id); }
function showSpinner(){ const s = byId('loading-spinner'); if (s) s.classList.remove('hidden'); }
function hideSpinner(){ const s = byId('loading-spinner'); if (s) s.classList.add('hidden'); }

/* ---------- Number formatting (no left padding) ---------- */
const fmtNum = (n) =>
  (n == null || !isFinite(n))
    ? "-"
    : new Intl.NumberFormat("en-US", {
        useGrouping: true,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(n));

/* ---------- Date helpers ---------- */
function pad2(n){ return String(n).padStart(2,'0'); }
function toISO_utc(date) {
  return date.getUTCFullYear() + "-" +
    pad2(date.getUTCMonth() + 1) + "-" +
    pad2(date.getUTCDate()) + "T" +
    pad2(date.getUTCHours()) + ":" +
    pad2(date.getUTCMinutes()) + ":00Z";
}
function formatISO_ymd_hm_utc(iso){
  const d = new Date(iso);
  return `${d.getUTCFullYear()}/${pad2(d.getUTCMonth()+1)}/${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}
function formatISO_ymd_utc(iso){
  const d = new Date(iso);
  return `${d.getUTCFullYear()}/${pad2(d.getUTCMonth()+1)}/${pad2(d.getUTCDate())}`;
}
function formatForInterval(iso, interval){
  const tf = (interval || '').toLowerCase();
  if (tf === '1d' || tf === '1w' || tf === '1wk' || tf === '1week') return formatISO_ymd_utc(iso);
  return formatISO_ymd_hm_utc(iso);
}

/* ---------- State ---------- */
let chart;
let now = new Date();
let todayMidnight = new Date(Date.UTC(
  now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0
));
let yesterdayMidnight = new Date(todayMidnight);
yesterdayMidnight.setUTCDate(yesterdayMidnight.getUTCDate() - 5);

let fromdate = toISO_utc(yesterdayMidnight);
let todate   = toISO_utc(todayMidnight);

let page = 0;
const size = 250;
let totalPages = Infinity;
let windowSize = 120;
let allData = [];                 // [{x: ISO, y:[o,h,l,c]}]
let isFetching = false;

let selectedInterval = '1h';      // default
const DEFAULT_SYMBOL = 'BTCUSDT'; // no <select id="symbol"> in HTML

// Hover/latest control
let hoverActive = false;
let latestIndex = -1;

/* ---------- Binance adapter ---------- */
const BINANCE_BASE = 'https://api.binance.com/api/v3/klines';
let BINANCE_CURSOR_MS = null;
function resolveBinanceSymbol() { return DEFAULT_SYMBOL; }

function klinesToContent(klines) {
  return klines.map(k => ({
    x: new Date(k[0]).toISOString(),
    y: [ +k[1], +k[2], +k[3], +k[4] ] // [open, high, low, close]
  }));
}

async function fetchBinanceChunk({ symbol, interval, size, toDateISO }) {
  let endTimeMs = Number.isFinite(BINANCE_CURSOR_MS)
    ? BINANCE_CURSOR_MS - 1
    : (toDateISO ? Date.parse(toDateISO) : Date.now());
  const limit = Math.max(1, Math.min(1000, size || 100));

  const url = new URL(BINANCE_BASE);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('endTime', String(endTimeMs));

  let res;
  try { res = await fetch(url.toString(), { mode: 'cors' }); }
  catch (err) { throw new Error(`Network/CORS error calling Binance: ${err?.message || err}`); }

  if (!res.ok) {
    if (res.status === 429) throw new Error("Binance rate limit (429). Slow down requests.");
    throw new Error(`Binance ${res.status} ${res.statusText}`);
  }
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) return [];
  BINANCE_CURSOR_MS = arr[0][0]; // oldest point time
  return klinesToContent(arr);
}

async function getCandles(dataParam) {
  if (dataParam.page === 0) {
    BINANCE_CURSOR_MS = dataParam.toDate ? Date.parse(dataParam.toDate) : Date.now();
  }
  const content = await fetchBinanceChunk({
    symbol: resolveBinanceSymbol(),
    interval: dataParam.interval || selectedInterval || '1h',
    size: dataParam.size || size,
    toDateISO: dataParam.toDate || null
  });
  return { content, totalPages: Infinity };
}

/* ---------- Axis & chart options ---------- */
const baseXAxis = {
  labels: { show: false, style: {  colors: '#fff', fontSize: '0.70rem', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, cssClass: 'fill-white' } },
  tooltip: {
    enabled: true,
    formatter: (val, opts) => {
      // val may be the ISO string or an index; be defensive
      let iso = val;
      const i = opts?.dataPointIndex;
      if (Number.isInteger(i) && i >= 0 && i < allData.length) {
        iso = allData[i]?.x ?? val;
      }
      return formatForInterval(iso, selectedInterval); // <- your formatter
    }
  },
  type: 'category',
  tickAmount: 5,
  crosshairs: { show: true, width: 1, position: "front", stroke: { color: "#ffffff", width: 1, dashArray: 3 } },
  axisTicks: { show: false },
  axisBorder: { show: true },
  stepSize: 10,
  min: 0,
  max: 0
};
const baseYAxis = {
  labels: {
    style: {colors: '#fff',  fontSize: '0.70rem', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, cssClass: 'fill-white' },
    formatter: (val) => fmtNum(val) // format Y-axis labels
  },
  crosshairs: { show: true, width: 1, position: "front", stroke: { color: "#ffffff", width: 1, dashArray: 3 } },
  tooltip: { enabled: true },
  min: 0,
  max: 1
};

let options = {
  chart: {
    animations: { enabled: false },
    id: 'chart2',
    group: 'candle',
    zoom: { enabled: true, type: 'x' },
    toolbar: {
      show: false,
      autoSelected: 'pan',
      tools: { download: false, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true, customIcons: [] }
    },
    type: 'candlestick',
    height: 350,
    events: {
      scrolled: (_ctx, payload) => onRangeEvent(payload),
      selection: (_ctx, payload) => onRangeEvent(payload),
      zoomed:   (_ctx, payload) => onRangeEvent(payload),

      // Hover a candle => OHLC for that candle
      dataPointMouseEnter: function (_event, _ctx, { dataPointIndex, w }) {
        hoverActive = true;
        updateOHLCFromIndex(dataPointIndex, w);
      },
      // Leave => revert to latest candle values
      dataPointMouseLeave: function () {
        hoverActive = false;
        showLatestOHLC();
      }
    }
  },
  plotOptions: {
    candlestick: { colors: { upward: "#00E396", downward: "#FF4560" }, wick: { useFillColor: true } }
  },
  title: { align: 'left' },
  xaxis: { ...baseXAxis },
  yaxis: { ...baseYAxis },
  tooltip: { enabled: true,   theme: 'dark', custom: () => '', style: { fontSize: '0px' }, marker: { show: false }, y: { show: false }, x: { show: false } },
  grid: {
    show: true,
    borderColor: '#3d4258',
    strokeDashArray: 0,
    position: 'back',
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } }
  },
  series: [{ data: [] }]
};

/* ---------- OHLC pill helpers (ALL fields colored) ---------- */
function setOHLCColors(bullish) {
  const ids = ['open','high','low','close'];
  const pos = 'text-success';
  const neg = 'text-danger';
  ids.forEach(id => {
    const el = byId(id);
    if (el) { el.classList.remove(pos); el.classList.remove(neg); }
  });
  ids.forEach(id => { const el = byId(id); if (el) el.classList.add(bullish ? pos : neg); });
}
function writeOHLC(candle) {
  if (!candle) return;
  const [O,H,L,C] = candle.y;
  const setText = (id, v) => { const el = byId(id); if (el) el.textContent = v; };

  const dateStr = formatForInterval(candle.x, selectedInterval);
  setText('date',  dateStr);
  setText('open',  fmtNum(O));
  setText('high',  fmtNum(H));
  setText('low',   fmtNum(L));
  setText('close', fmtNum(C));

  setOHLCColors(C >= O);
  const info = byId('ohlc-info'); if (info) info.classList.remove('d-none');
}
function updateOHLCFromIndex(idx, w) {
  try {
    const X = w.config.series[0].data[idx].x;
    const O = w.globals.seriesCandleO[0][idx];
    const H = w.globals.seriesCandleH[0][idx];
    const L = w.globals.seriesCandleL[0][idx];
    const C = w.globals.seriesCandleC[0][idx];
    writeOHLC({ x: X, y: [O,H,L,C] });
  } catch (_) {
    const c = allData[idx];
    if (c) writeOHLC(c);
  }
}
function showLatestOHLC() {
  if (latestIndex < 0 || latestIndex >= allData.length) return;
  writeOHLC(allData[latestIndex]);
}
function refreshLatestIndexAndMaybeUpdatePill() {
  latestIndex = allData.length - 1;
  if (!hoverActive) showLatestOHLC();
}

/* ---------- Y limits from visible index window ---------- */
function calculateYLimitsCandleSticks(data, iMin, iMax, marginPct) {
  const i0 = Math.max(0, Math.floor(iMin));
  const i1 = Math.min(data.length, Math.ceil(iMax));
  if (i1 <= i0) return { min: 0, max: 1 };
  let yMin = Number.POSITIVE_INFINITY, yMax = Number.NEGATIVE_INFINITY;
  for (let i = i0; i < i1; i++) {
    const y = data[i].y;
    if (Array.isArray(y)) { if (y[2] < yMin) yMin = y[2]; if (y[1] > yMax) yMax = y[1]; }
    else { if (y < yMin) yMin = y; if (y > yMax) yMax = y; }
  }
  if (!isFinite(yMin) || !isFinite(yMax) || yMax <= yMin) return { min: 0, max: 1 };
  const pad = Math.abs((yMax - yMin) * (marginPct / 100));
  return { min: yMin - pad, max: yMax + pad };
}

/* ---------- Edge detection & prefetch control ---------- */
const EDGE_RATIO = 0.12, EDGE_MIN = 5;
function isNearLeftIndex(iMin, iMax) {
  const span = Math.max(1, iMax - iMin);
  return iMin <= Math.max(EDGE_MIN, Math.floor(span * EDGE_RATIO));
}
let panDir = 0, idleTimer = null;
const PAN_IDLE_MS = 140;
let prefetchToken = { id: 0, dir: 0 };
const PREFETCH_MAX_STEPS = 4, PREFETCH_COOLDOWN = 80;
function cancelPrefetchLoop() { prefetchToken.id++; prefetchToken.dir = 0; }

/* ---------- Core: recompute Y for current X window ---------- */
async function recomputeYForCurrentWindow(applyAnim = true) {
  if (!chart || !allData.length) return;
  const minIdx = options.xaxis.min ?? 0;
  const maxIdx = options.xaxis.max ?? allData.length;
  const yL = calculateYLimitsCandleSticks(allData, minIdx, maxIdx, 10);

  options.yaxis = {
    ...options.yaxis,
    min: yL.min,
    max: yL.max,
    labels: { ...options.yaxis.labels, formatter: (v) => fmtNum(v) ,
        style: { ...(options.yaxis.labels?.style || {}), colors: '#fff' }  
		}
  };
  await chart.updateOptions({ yaxis: options.yaxis }, applyAnim, false);
}

/* ---------- Prefetch (prepend) ---------- */
async function prefetchOlderSilent() {
  if (isFetching) return 0;
  isFetching = true;
  showSpinner();
  try {
    const resp = await getCandles({
      symbol: resolveBinanceSymbol(),
      interval: selectedInterval,
      fromDate: fromdate, toDate: new Date(BINANCE_CURSOR_MS || Date.now()).toISOString(),
      downsample: "auto", tableName: 'cr_btc_high_low',
      page, size, asc: false
    });
    page++;

    const before = allData.length;
    const incoming = resp.content || [];
    if (!incoming.length) return 0;

    allData = incoming.concat(allData);
    const added = allData.length - before;

    const newMin = (options.xaxis.min ?? 0) + added;
    const newMax = (options.xaxis.max ?? before) + added;
    options.xaxis = { ...options.xaxis, min: newMin, max: newMax };

    chart.updateSeries([{ data: allData }], false);
    chart.updateOptions({ xaxis: options.xaxis }, false, false);

    refreshLatestIndexAndMaybeUpdatePill();
    updateLoadedLabel();
    return added;
  } catch (e) {
    console.error('Fetch older failed:', e);
    return 0;
  } finally {
    hideSpinner();
    isFetching = false;
  }
}

/* ---------- Range handlers ---------- */
function onRangeEvent({ xaxis }) {
  if (!xaxis) return;

  const prevC = ((options.xaxis.min ?? 0) + (options.xaxis.max ?? 0)) / 2;
  const nowC  = (xaxis.min + xaxis.max) / 2;
  const d = nowC - prevC;
  if (panDir === 0) { if (d > 0.5) panDir = +1; else if (d < -0.5) panDir = -1; }

  let minIdx = Math.max(0, Math.floor(xaxis.min));
  let maxIdx = Math.min(allData.length, Math.ceil(xaxis.max));
  if (maxIdx <= minIdx) maxIdx = Math.min(allData.length, minIdx + Math.max(1, windowSize));

  options.xaxis = { ...options.xaxis, min: minIdx, max: maxIdx };
  if (chart) chart.updateOptions({ xaxis: options.xaxis }, false, false);

  if (panDir === -1 && isNearLeftIndex(minIdx, maxIdx)) {
    startPrefetchLoop(-1, { min: minIdx, max: maxIdx });
  }
  scheduleIdle();
}
function scheduleIdle(){ clearTimeout(idleTimer); idleTimer = setTimeout(onIdle, PAN_IDLE_MS); }
async function onIdle() {
  const minIdx = options.xaxis.min ?? 0;
  const maxIdx = options.xaxis.max ?? allData.length;
  if (!(Number.isFinite(minIdx) && Number.isFinite(maxIdx)) || maxIdx <= minIdx) { panDir = 0; cancelPrefetchLoop(); return; }

  if (panDir === -1 && isNearLeftIndex(minIdx, maxIdx)) {
    const added = await prefetchOlderSilent();
    if (added > 0) {
      options.xaxis = { ...options.xaxis, min: minIdx + added, max: maxIdx + added };
      chart.updateOptions({ xaxis: options.xaxis }, false, false);
    }
  }
  await recomputeYForCurrentWindow(true);
  panDir = 0; cancelPrefetchLoop();
}

/* ---------- Labels / OHLC pill ---------- */
function updateLoadedLabel() {
  const el = byId('loadedLbl');
  if (!el) return;
  if (!allData.length) { el.textContent = '-'; return; }
  const firstISO = allData[0].x, lastISO = allData[allData.length - 1].x;
  el.textContent = `${formatForInterval(firstISO, selectedInterval)} … ${formatForInterval(lastISO, selectedInterval)} (len ${allData.length})`;
}

/* ---------- Reload (timeframe change) ---------- */
async function reloadFromBinance() {
  showSpinner();
  try {
    page = 0; allData = []; panDir = 0; cancelPrefetchLoop();
    BINANCE_CURSOR_MS = null;

    const resp = await getCandles({
      symbol: resolveBinanceSymbol(),
      interval: selectedInterval,
      fromDate: todate, toDate: new Date().toISOString(),
      downsample: "auto", tableName: 'cr_btc_high_low',
      page, size, asc: false
    });
    totalPages = resp.totalPages; page++;
    allData = (resp.content || []).concat(allData);

    const total = allData.length;
    const min = Math.max(0, total - windowSize);
    const max = total;

    options.series = [{ data: allData }];
    options.xaxis = { ...options.xaxis, min: min, max: max };

    const yL = calculateYLimitsCandleSticks(allData, min, max, 10);
    options.yaxis = {
      ...options.yaxis,
      min: yL.min,
      max: yL.max,
      labels: { ...options.yaxis.labels, formatter: (v) => fmtNum(v) }
    };

    if (!chart) {
      if (typeof ApexCharts === "undefined") { console.error("ApexCharts not loaded"); hideSpinner(); return; }
      const container = document.querySelector("#main-chart");
      if (!container) { console.warn("#main-chart not found"); hideSpinner(); return; }
      chart = new ApexCharts(container, options);
      await chart.render();
    } else {
      await chart.updateOptions({
        series: [{ data: allData }],
        xaxis: options.xaxis,
        yaxis: options.yaxis
      }, true, false);
    }

    refreshLatestIndexAndMaybeUpdatePill();
    updateLoadedLabel();
  } catch (e) {
    console.error('Reload failed:', e);
  } finally {
    hideSpinner();
  }
}

/* ---------- PUBLIC: timeframe buttons ---------- */
window.changeTimeframe = async function(tf) {
  const group = document.querySelector('.btn-group');
  if (group) {
    group.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    const btn = Array.from(group.querySelectorAll('.btn'))
      .find(b => (b.textContent || '').trim().toLowerCase() === tf.toLowerCase());
    if (btn) btn.classList.add('active');
  }
  selectedInterval = tf;
  await reloadFromBinance();
};

/* ---------- Bootstrap ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  showSpinner();
  try {
    const active = document.querySelector('.btn-group .btn.active');
    if (active) selectedInterval = (active.textContent || '1h').trim();

    page = 0;
    const resp = await getCandles({
      symbol: resolveBinanceSymbol(),
      interval: selectedInterval,
      fromDate: fromdate,
      toDate: todate,
      downsample: "auto",
      tableName: 'cr_btc_high_low',
      page: 0,
      size: size,
      asc: false
    });
    totalPages = resp.totalPages;
    page++;

    allData = (resp.content || []).concat(allData);

    const total = allData.length;
    const min = Math.max(0, total - windowSize);
    const max = total;

    options.series = [{ data: allData }];
    options.xaxis  = { ...baseXAxis, min: min, max: max };
    const yL = calculateYLimitsCandleSticks(allData, min, max, 10);
    options.yaxis  = { ...baseYAxis, min: yL.min, max: yL.max };

    if (typeof ApexCharts === "undefined") { console.error("ApexCharts not loaded"); hideSpinner(); return; }
    const container = document.querySelector("#main-chart");
    if (!container) { console.warn("#main-chart not found"); hideSpinner(); return; }

    chart = new ApexCharts(container, options);
    await chart.render();

    refreshLatestIndexAndMaybeUpdatePill();
    updateLoadedLabel();
  } catch (e) {
    console.error('Initial load failed:', e);
  } finally {
    hideSpinner();
  }
});

/* ---------- Prefetch orchestrator ---------- */
async function startPrefetchLoop(direction, currentRange) {
  const token = { id: ++prefetchToken.id, dir: direction };
  prefetchToken = token;
  let steps = 0;
  while (steps < PREFETCH_MAX_STEPS && token.id === prefetchToken.id && token.dir === direction) {
    const nearLeft = isNearLeftIndex(currentRange.min, currentRange.max);
    if (!(direction === -1 && nearLeft)) break;

    const added = await prefetchOlderSilent();
    if (added <= 0) break;

    currentRange.min += added;
    currentRange.max += added;

    chart.updateSeries([{ data: allData }], false);
    chart.updateOptions({ xaxis: options.xaxis }, false, false);

    steps++;
    await new Promise(r => setTimeout(r, PREFETCH_COOLDOWN));
  }
}
