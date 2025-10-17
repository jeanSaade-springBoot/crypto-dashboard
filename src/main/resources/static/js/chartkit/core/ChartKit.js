/****************************************************
 * ChartKit Core (Plain JavaScript version)
 ****************************************************/
(function (global) {
  const { $, byId, deepMerge, fmtNum, formatForInterval } = global.ChartKitUtils;
  const BinanceOHLCSource = global.BinanceOHLCSource;

  class ChartKit {
    // -----------------------------------------------------
    // === Static Registry =================================
    // -----------------------------------------------------
    static registry = new Map();

    static create(cfg) {
      const inst = new ChartKit(cfg);
      ChartKit.registry.set(inst.key, inst);
      inst.init();
      return inst;
    }

    static get(key) {
      return ChartKit.registry.get(key);
    }

    // -----------------------------------------------------
    // === Constructor =====================================
    // -----------------------------------------------------
    constructor(cfg) {
      if (!cfg.key) throw new Error("ChartKit.create requires a unique 'key'");
      if (!cfg.containerId)
        throw new Error("ChartKit.create requires 'containerId'");

      this.key = cfg.key;
      this.containerId = cfg.containerId;
      this.spinnerId = cfg.spinnerId || null;
      this.loadedLabelId = cfg.loadedLabelId || null;
      this.windowSize = cfg.windowSize ?? 120;

      this.seriesDefs = (cfg.series || []).map((s, i) => ({
        id: i,
        name: s.name ?? `S${i + 1}`,
        type: s.type,
        color: s.color,
        dataSource: s.dataSource || null,
        data: Array.isArray(s.data) ? s.data.slice() : [],
        ohlcPill: s.ohlcPill || null,
      }));

      this.selectedInterval =
        cfg.series?.find(
          (s) => s.dataSource instanceof BinanceOHLCSource
        )?.dataSource?.interval || "1h";

      this.apexOptions = this.makeDefaultApexOptions();
      if (cfg.apex) this.apexOptions = deepMerge(this.apexOptions, cfg.apex);

      this.xTooltipFormat =
        cfg.xTooltipFormat ||
        ((val, opts) => {
          let iso = val;
          const i = opts?.dataPointIndex;
          if (Number.isInteger(i) && i >= 0) {
            for (const s of this.seriesDefs) {
              const p = s.data[i];
              if (p?.x) {
                iso = p.x;
                break;
              }
            }
          }
          return formatForInterval(iso, this.selectedInterval);
        });

      this.chart = null;
      this.isFetching = false;
      this.panDir = 0;
      this.prefetchToken = { id: 0, dir: 0 };
      this.idleTimer = null;
      this.hoverActive = false;
    }

    // -----------------------------------------------------
    // === DOM Helpers =====================================
    // -----------------------------------------------------
    showSpinner() {
      const el = byId(this.spinnerId);
      if (el) el.classList.remove("hidden");
    }

    hideSpinner() {
      const el = byId(this.spinnerId);
      if (el) el.classList.add("hidden");
    }

    setLoadedText(txt) {
      const el = byId(this.loadedLabelId);
      if (el) el.textContent = txt;
    }

    // -----------------------------------------------------
    // === Default Apex Options ============================
    // -----------------------------------------------------
    makeDefaultApexOptions() {
      const self = this;
      return {
        chart: {
          type: "candlestick",
          height: 350,
          animations: { enabled: false },
          id: `chart-${self.key}`,
          group: `chart-${self.key}`,
          zoom: { enabled: true, type: "x" },
          toolbar: {
            show: false,
            autoSelected: "pan",
            tools: {
              download: false,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
            },
          },
          events: {
            scrolled: (_ctx, p) => self.onRangeEvent(p),
            selection: (_ctx, p) => self.onRangeEvent(p),
            zoomed: (_ctx, p) => self.onRangeEvent(p),
            dataPointMouseEnter: (evt, _ctx, { seriesIndex, dataPointIndex, w }) => {
              self.hoverActive = true;
              self.maybeUpdateOHLCFromIndex(seriesIndex, dataPointIndex, w);
            },
            dataPointMouseLeave: () => {
              self.hoverActive = false;
              self.showLatestOHLCForAll();
            },
          },
        },
        colors: this.seriesDefs.map((s) => s.color).filter(Boolean),
        xaxis: {
          type: "category",
          labels: {
            show: false,
            style: {
              colors: "#fff",
              fontSize: "0.70rem",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 400,
            },
          },
          tickAmount: 5,
          stepSize: 10,
          min: 0,
          max: 0,
          crosshairs: {
            show: true,
            width: 1,
            position: "front",
            stroke: { color: "#fff", width: 1, dashArray: 3 },
          },
          axisTicks: { show: false },
          axisBorder: { show: true },
          tooltip: {
            enabled: true,
            formatter: (val, opts) => self.xTooltipFormat(val, opts, self),
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#fff",
              fontSize: "0.70rem",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 400,
            },
            formatter: (v) => fmtNum(v),
          },
          crosshairs: {
            show: true,
            width: 1,
            position: "front",
            stroke: { color: "#fff", width: 1, dashArray: 3 },
          },
          tooltip: { enabled: true },
          min: 0,
          max: 1,
        },
        tooltip: {
          enabled: true,
          theme: "dark",
          custom: () => "",
          style: { fontSize: "0px" },
          marker: { show: false },
          y: { show: false },
          x: { show: false },
        },
        grid: {
          show: true,
          borderColor: "#3d4258",
          strokeDashArray: 0,
          position: "back",
          xaxis: { lines: { show: true } },
          yaxis: { lines: { show: true } },
        },
        plotOptions: {
          candlestick: {
            colors: { upward: "#00E396", downward: "#FF4560" },
            wick: { useFillColor: true },
          },
        },
        series: [],
      };
    }

    // -----------------------------------------------------
    // === Public API ======================================
    // -----------------------------------------------------
    async changeTimeframe(tf) {
      this.selectedInterval = tf;
      this.seriesDefs.forEach((s) => {
        if (s.dataSource instanceof BinanceOHLCSource) s.dataSource.setInterval(tf);
      });
      await this.reload();
    }

    async changeSymbolFor(seriesIdx, symbol) {
      const s = this.seriesDefs[seriesIdx];
      if (s?.dataSource instanceof BinanceOHLCSource) {
        s.dataSource.symbol = (symbol || "BTCUSDT").toUpperCase();
        await this.reload();
      }
    }

    destroy() {
      try {
        this.chart?.destroy();
      } catch {}
      ChartKit.registry.delete(this.key);
    }

    // -----------------------------------------------------
    // === Initialization ==================================
    // -----------------------------------------------------
    async init() {
      await this.initialLoad();
    }

    async initialLoad() {
      this.showSpinner();
      try {
        this.apexOptions.series = this.seriesDefs.map((s) => ({
          name: s.name,
          type: s.type,
          data: [],
        }));

        await this.fetchOnePageForAll();

        this.apexOptions.series = this.seriesDefs.map((s) => ({
          name: s.name,
          type: s.type,
          data: s.data,
        }));

        const total = this.maxLength();
        const min = Math.max(0, total - this.windowSize);
        const max = total;
        const yL = this.calcYLimits(min, max, 10);

        this.apexOptions.xaxis = { ...this.apexOptions.xaxis, min, max };
        this.apexOptions.yaxis = { ...this.apexOptions.yaxis, min: yL.min, max: yL.max };

        const container = document.getElementById(this.containerId);
        if (!container || typeof ApexCharts === "undefined") return;

        this.chart = new ApexCharts(container, this.apexOptions);
        await this.chart.render();

        this.refreshLatestOHLCLabels();
        this.updateLoadedLabel(min, max);
      } catch (e) {
        console.error(`[${this.key}] initial load failed:`, e);
      } finally {
        this.hideSpinner();
      }
    }

    async reload() {
      this.showSpinner();
      try {
        this.seriesDefs.forEach((s) => {
          s.data = [];
          if (s.dataSource instanceof BinanceOHLCSource) s.dataSource.cursorMs = null;
        });

        await this.fetchOnePageForAll();

        const total = this.maxLength();
        const min = Math.max(0, total - this.windowSize);
        const max = total;
        const yL = this.calcYLimits(min, max, 10);

        await this.chart.updateOptions(
          {
            series: this.seriesDefs.map((s) => ({
              name: s.name,
              type: s.type,
              data: s.data,
            })),
            xaxis: { ...this.apexOptions.xaxis, min, max },
            yaxis: { ...this.apexOptions.yaxis, min: yL.min, max: yL.max },
          },
          true,
          false
        );

        this.refreshLatestOHLCLabels();
        this.updateLoadedLabel(min, max);
      } catch (e) {
        console.error(`[${this.key}] reload failed:`, e);
      } finally {
        this.hideSpinner();
      }
    }

    // -----------------------------------------------------
    // === Fetch Helpers ===================================
    // -----------------------------------------------------
    async fetchOnePageForAll() {
      const tasks = this.seriesDefs.map(async (s) => {
        if (!s.dataSource) return;
        const resp = await s.dataSource.fetchOlder(s.dataSource.pageSize);
        s.data = (resp.points || []).concat(s.data);
      });
      await Promise.all(tasks);
    }

    async prefetchOlderSilent() {
      if (this.isFetching) return 0;
      this.isFetching = true;
      this.showSpinner();

      try {
        let addedMax = 0;

        for (const s of this.seriesDefs) {
          if (!s.dataSource) continue;
          const before = s.data.length;
          const resp = await s.dataSource.fetchOlder(s.dataSource.pageSize);
          const incoming = resp.points || [];
          if (incoming.length) {
            s.data = incoming.concat(s.data);
            addedMax = Math.max(addedMax, s.data.length - before);
          }
        }

        if (addedMax > 0) {
          const newMin = (this.apexOptions.xaxis.min ?? 0) + addedMax;
          const newMax = (this.apexOptions.xaxis.max ?? 0) + addedMax;

          this.apexOptions.xaxis = { ...this.apexOptions.xaxis, min: newMin, max: newMax };
          const seriesPayload = this.seriesDefs.map((s) => ({
            name: s.name,
            type: s.type,
            data: s.data,
          }));
          await this.chart.updateOptions({ series: seriesPayload, xaxis: this.apexOptions.xaxis }, false, false);

          const yL = this.calcYLimits(newMin, newMax, 10);
          const yaxis = {
            ...this.apexOptions.yaxis,
            min: yL.min,
            max: yL.max,
            labels: {
              ...this.apexOptions.yaxis.labels,
              formatter: (v) => fmtNum(v),
              style: { ...(this.apexOptions.yaxis.labels?.style || {}), colors: "#fff" },
            },
          };
          this.apexOptions.yaxis = yaxis;
          await this.chart.updateOptions({ yaxis }, false, false);

          this.refreshLatestOHLCLabels();
          this.updateLoadedLabel(newMin, newMax);
        }

        return addedMax;
      } catch (e) {
        console.error(`[${this.key}] prefetch failed:`, e);
        return 0;
      } finally {
        this.hideSpinner();
        this.isFetching = false;
      }
    }

    // -----------------------------------------------------
    // === OHLC Labels =====================================
    // -----------------------------------------------------
    setOHLCColors(ids, bullish) {
      const pos = "text-success",
        neg = "text-danger";
      ["open", "high", "low", "close"].forEach((k) => {
        const el = byId(ids[k]);
        if (!el) return;
        el.classList.remove(pos, neg);
        el.classList.add(bullish ? pos : neg);
      });
    }

    writeOHLC(ids, candle, interval) {
      if (!ids || !candle) return;
      const [O, H, L, C] = candle.y;
      const setTxt = (id, v) => {
        const el = byId(id);
        if (el) el.textContent = v;
      };

      setTxt(ids.date, formatForInterval(candle.x, interval));
      setTxt(ids.open, fmtNum(O));
      setTxt(ids.high, fmtNum(H));
      setTxt(ids.low, fmtNum(L));
      setTxt(ids.close, fmtNum(C));

      this.setOHLCColors(ids, C >= O);
      const pill = byId(ids.pillId);
      if (pill) pill.classList.remove("d-none");
    }

    maybeUpdateOHLCFromIndex(seriesIndex, dataPointIndex, w) {
      const sDef = this.seriesDefs[seriesIndex];
      if (!sDef || sDef.type !== "candlestick" || !sDef.ohlcPill) return;

      try {
        const X = w.config.series[seriesIndex].data[dataPointIndex].x;
        const O = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
        const H = w.globals.seriesCandleH[seriesIndex][dataPointIndex];
        const L = w.globals.seriesCandleL[seriesIndex][dataPointIndex];
        const C = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
        this.writeOHLC(sDef.ohlcPill, { x: X, y: [O, H, L, C] }, this.selectedInterval);
      } catch {
        const c = sDef.data[dataPointIndex];
        if (c) this.writeOHLC(sDef.ohlcPill, c, this.selectedInterval);
      }
    }

    showLatestOHLCForAll() {
      for (const s of this.seriesDefs) {
        if (s.type !== "candlestick" || !s.ohlcPill) continue;
        const idx = s.data.length - 1;
        if (idx >= 0) this.writeOHLC(s.ohlcPill, s.data[idx], this.selectedInterval);
      }
    }

    refreshLatestOHLCLabels() {
      if (!this.hoverActive) this.showLatestOHLCForAll();
    }

    // -----------------------------------------------------
    // === Range & Prefetch Logic ==========================
    // -----------------------------------------------------
    onRangeEvent({ xaxis }) {
      if (!xaxis) return;

      const prevCenter = ((this.apexOptions.xaxis.min ?? 0) + (this.apexOptions.xaxis.max ?? 0)) / 2;
      const nowCenter = (xaxis.min + xaxis.max) / 2;
      const delta = nowCenter - prevCenter;

      if (this.panDir === 0) {
        if (delta > 0.5) this.panDir = +1;
        else if (delta < -0.5) this.panDir = -1;
      }

      let minIdx = Math.max(0, Math.floor(xaxis.min));
      let maxIdx = Math.min(this.maxLength(), Math.ceil(xaxis.max));
      if (maxIdx <= minIdx) maxIdx = Math.min(this.maxLength(), minIdx + Math.max(1, this.windowSize));

      this.apexOptions.xaxis = { ...this.apexOptions.xaxis, min: minIdx, max: maxIdx };
      this.chart.updateOptions({ xaxis: this.apexOptions.xaxis }, false, false);

      const hasSource = this.seriesDefs.some((s) => !!s.dataSource);
      if (hasSource && this.panDir === -1 && this.isNearLeftIndex(minIdx, maxIdx)) {
        this.startPrefetchLoop(-1, { min: minIdx, max: maxIdx });
      }

      this.scheduleIdle();
    }

    scheduleIdle() {
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => this.onIdle(), 140);
    }

    async onIdle() {
      const minIdx = this.apexOptions.xaxis.min ?? 0;
      const maxIdx = this.apexOptions.xaxis.max ?? this.maxLength();

      if (!Number.isFinite(minIdx) || !Number.isFinite(maxIdx) || maxIdx <= minIdx) {
        this.panDir = 0;
        this.cancelPrefetchLoop();
        return;
      }

      const hasSource = this.seriesDefs.some((s) => !!s.dataSource);
      if (hasSource && this.panDir === -1 && this.isNearLeftIndex(minIdx, maxIdx)) {
        const added = await this.prefetchOlderSilent();
        if (added > 0) {
          this.apexOptions.xaxis = {
            ...this.apexOptions.xaxis,
            min: minIdx + added,
            max: maxIdx + added,
          };
          this.chart.updateOptions({ xaxis: this.apexOptions.xaxis }, false, false);
        }
      }

      const yL = this.calcYLimits(this.apexOptions.xaxis.min, this.apexOptions.xaxis.max, 10);
      const yaxis = {
        ...this.apexOptions.yaxis,
        min: yL.min,
        max: yL.max,
        labels: {
          ...this.apexOptions.yaxis.labels,
          formatter: (v) => fmtNum(v),
          style: { ...(this.apexOptions.yaxis.labels?.style || {}), colors: "#fff" },
        },
      };
      this.apexOptions.yaxis = yaxis;
      await this.chart.updateOptions({ yaxis }, true, false);

      this.panDir = 0;
      this.cancelPrefetchLoop();
    }

    cancelPrefetchLoop() {
      this.prefetchToken.id++;
      this.prefetchToken.dir = 0;
    }

    async startPrefetchLoop(direction, currentRange) {
      const token = { id: ++this.prefetchToken.id, dir: direction };
      this.prefetchToken = token;
      const MAX_STEPS = 4;
      const COOLDOWN = 80;
      let steps = 0;

      while (steps < MAX_STEPS && token.id === this.prefetchToken.id && token.dir === direction) {
        const nearLeft = this.isNearLeftIndex(currentRange.min, currentRange.max);
        if (!(direction === -1 && nearLeft)) break;

        const added = await this.prefetchOlderSilent();
        if (added <= 0) break;

        currentRange.min += added;
        currentRange.max += added;

        steps++;
        await new Promise((r) => setTimeout(r, COOLDOWN));
      }
    }

    // -----------------------------------------------------
    // === Helpers =========================================
    // -----------------------------------------------------
    isNearLeftIndex(iMin, iMax) {
      const EDGE_RATIO = 0.12;
      const EDGE_MIN = 5;
      const span = Math.max(1, iMax - iMin);
      return iMin <= Math.max(EDGE_MIN, Math.floor(span * EDGE_RATIO));
    }

    maxLength() {
      return this.seriesDefs.reduce((m, s) => Math.max(m, s.data.length), 0);
    }

    calcYLimits(iMin, iMax, marginPct) {
      const i0 = Math.max(0, Math.floor(iMin));
      const i1 = Math.min(this.maxLength(), Math.ceil(iMax));
      if (i1 <= i0) return { min: 0, max: 1 };

      let yMin = Infinity,
        yMax = -Infinity;
      for (const s of this.seriesDefs) {
        for (let i = i0; i < Math.min(i1, s.data.length); i++) {
          const pt = s.data[i];
          if (!pt) continue;

          if (s.type === "candlestick" && Array.isArray(pt.y)) {
            yMin = Math.min(yMin, pt.y[2]);
            yMax = Math.max(yMax, pt.y[1]);
          } else {
            const v = typeof pt === "number" ? pt : Array.isArray(pt.y) ? pt.y[3] : pt.y;
            yMin = Math.min(yMin, v);
            yMax = Math.max(yMax, v);
          }
        }
      }
      if (!isFinite(yMin) || !isFinite(yMax) || yMax <= yMin) return { min: 0, max: 1 };
      const pad = Math.abs((yMax - yMin) * (marginPct / 100));
      return { min: yMin - pad, max: yMax + pad };
    }

    updateLoadedLabel(min, max) {
      if (!this.loadedLabelId) return;
      const firstISO = this.seriesDefs.find((s) => s.data[min]?.x)?.data[min]?.x;
      const lastISO = this.seriesDefs.find((s) => s.data[max - 1]?.x)?.data[max - 1]?.x;
      if (!firstISO || !lastISO) return;
      this.setLoadedText(
        `${formatForInterval(firstISO, this.selectedInterval)} … ${formatForInterval(
          lastISO,
          this.selectedInterval
        )} (len ${this.maxLength()})`
      );
    }
  }

  // -----------------------------------------------------
  // === Global Export ===================================
  // -----------------------------------------------------
  global.ChartKit = ChartKit;
})(window);
