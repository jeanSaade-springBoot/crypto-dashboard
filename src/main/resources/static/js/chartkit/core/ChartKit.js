/****************************************************
 * ChartKit Core (Datetime + Scroll + Drag + Auto Y Axis)
 ****************************************************/
(function (global) {
  const { $, byId, deepMerge, fmtNum, formatForInterval } = global.ChartKitUtils;
  const BinanceOHLCSource = global.BinanceOHLCSource;

  class ChartKit {
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

    constructor(cfg) {
      if (!cfg.key) throw new Error("ChartKit.create requires a unique 'key'");
      if (!cfg.containerId) throw new Error("ChartKit.create requires 'containerId'");

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
        cfg.series?.find((s) => s.dataSource instanceof BinanceOHLCSource)?.dataSource?.interval ||
        "1h";

      this.apexOptions = this.makeDefaultApexOptions();
      if (cfg.apex) this.apexOptions = deepMerge(this.apexOptions, cfg.apex);

      this.xTooltipFormat =
        cfg.xTooltipFormat ||
        ((val, opts) => formatForInterval(val, this.selectedInterval));

      this.chart = null;
      this.isFetching = false;
      this.hoverActive = false;
    }

    // ---------------------------------------------------
    // === DOM Utilities =================================
    // ---------------------------------------------------
    showSpinner() { const el = byId(this.spinnerId); if (el) el.classList.remove("hidden"); }
    hideSpinner() { const el = byId(this.spinnerId); if (el) el.classList.add("hidden"); }
    setLoadedText(txt) { const el = byId(this.loadedLabelId); if (el) el.textContent = txt; }

    // ---------------------------------------------------
    // === Apex Options ==================================
    // ---------------------------------------------------
    makeDefaultApexOptions() {
      const self = this;
      return {
        chart: {
          type: "candlestick",
          height: 350,
          animations: { enabled: false },
          id: `chart-${self.key}`,
          group: `chart-${self.key}`,
          zoom: { enabled: true, type: "x", autoScaleYaxis: false },
          toolbar: { show: false },
          panning: { enabled: false },
          events: {
            zoomed: (_ctx, p) => self.onZoomOrScroll(p),
            scrolled: (_ctx, p) => self.onZoomOrScroll(p),
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
          type: "datetime",
          labels: { show: true, datetimeUTC: false, style: { colors: "#fff", fontSize: "0.7rem" } },
          tooltip: { enabled: true, formatter: (val, opts) => self.xTooltipFormat(val, opts, self) },
          crosshairs: { show: true, stroke: { color: "#fff", width: 1, dashArray: 3 } },
        },
        yaxis: {
          labels: { style: { colors: "#fff", fontSize: "0.7rem" }, formatter: (v) => fmtNum(v) },
          tooltip: { enabled: true },
        },
        grid: {
          show: true,
          borderColor: "#3d4258",
          xaxis: { lines: { show: true } },
          yaxis: { lines: { show: true } },
        },
        plotOptions: {
          candlestick: {
            colors: { upward: "#00E396", downward: "#FF4560" },
            wick: { useFillColor: true },
          },
        },
        tooltip: { theme: "dark" },
        series: [],
      };
    }

    // ---------------------------------------------------
    // === Public API ====================================
    // ---------------------------------------------------
    async changeTimeframe(tf) {
      this.selectedInterval = tf;
      this.seriesDefs.forEach((s) => {
        if (s.dataSource instanceof BinanceOHLCSource) s.dataSource.setInterval(tf);
      });

      await this.reload();

      // Recalculate Y-axis after data reload
      const allX = this.seriesDefs.flatMap((s) => s.data.map((p) => p.x)).sort((a, b) => a - b);
      if (allX.length) {
        const min = allX[Math.max(0, allX.length - this.windowSize)];
        const max = allX[allX.length - 1];
        await this.updateYAxisForRange(min, max);
        this.updateLoadedLabel(min, max);
      }
    }

    async changeSymbolFor(seriesIdx, symbol) {
      const s = this.seriesDefs[seriesIdx];
      if (s?.dataSource instanceof BinanceOHLCSource) {
        s.dataSource.symbol = (symbol || "BTCUSDT").toUpperCase();
        await this.reload();

        // Recalculate Y-axis after symbol change
        const allX = this.seriesDefs.flatMap((s) => s.data.map((p) => p.x)).sort((a, b) => a - b);
        if (allX.length) {
          const min = allX[Math.max(0, allX.length - this.windowSize)];
          const max = allX[allX.length - 1];
          await this.updateYAxisForRange(min, max);
          this.updateLoadedLabel(min, max);
        }
      }
    }

    // ---------------------------------------------------
    // === Init & Reload =================================
    // ---------------------------------------------------
    async init() { 
		await this.initialLoad(); this.attachDragHandlers(); 
		
		const btn = document.getElementById(`go-latest-${this.key}`);
		if (btn) btn.addEventListener("click", () => this.goToLatest());
	}
   // ---------------------------------------------------
	// === Navigation ====================================
	// ---------------------------------------------------
	async goToLatest() {
	  if (!this.seriesDefs.length) return;
	
	  // Find overall range
	  const allX = this.seriesDefs.flatMap((s) => s.data.map((p) => p.x));
	  if (!allX.length) return;
	
	  const max = Math.max(...allX);
	  const min = max - this.windowSize * (allX.length > this.windowSize ? (allX[1] - allX[0]) : 1);
	
	  this.apexOptions.xaxis.min = min;
	  this.apexOptions.xaxis.max = max;
	
	  await this.chart.updateOptions(
	    { xaxis: this.apexOptions.xaxis },
	    false, // animate
	    false
	  );
	
	  await this.updateYAxisForRange(min, max);
	  this.updateLoadedLabel(min, max);
	}
    async initialLoad() {
      this.showSpinner();
      try {
        this.apexOptions.series = this.seriesDefs.map((s) => ({
          name: s.name, type: s.type, data: [],
        }));
        await this.fetchOnePageForAll();

        const allX = this.seriesDefs.flatMap((s) => s.data.map((p) => p.x)).sort((a, b) => a - b);
        const min = allX[Math.max(0, allX.length - this.windowSize)];
        const max = allX[allX.length - 1];
        await this.updateYAxisForRange(min, max);

        this.apexOptions.series = this.seriesDefs.map((s) => ({
          name: s.name, type: s.type, data: s.data,
        }));
        this.apexOptions.xaxis.min = min;
        this.apexOptions.xaxis.max = max;

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

        const allX = this.seriesDefs.flatMap((s) => s.data.map((p) => p.x)).sort((a, b) => a - b);
        const min = allX[Math.max(0, allX.length - this.windowSize)];
        const max = allX[allX.length - 1];
        await this.updateYAxisForRange(min, max);

        await this.chart.updateOptions(
          {
            series: this.seriesDefs.map((s) => ({
              name: s.name, type: s.type, data: s.data,
            })),
            xaxis: { ...this.apexOptions.xaxis, min, max },
            yaxis: this.apexOptions.yaxis,
          },
          true, false
        );
        this.refreshLatestOHLCLabels();
        this.updateLoadedLabel(min, max);
      } catch (e) {
        console.error(`[${this.key}] reload failed:`, e);
      } finally {
        this.hideSpinner();
      }
    }

    // ---------------------------------------------------
    // === Drag / Scroll =================================
    // ---------------------------------------------------
    attachDragHandlers() {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      let isDragging = false, dragStartX = 0, dragStartMin = 0, dragStartMax = 0;

      container.addEventListener("mousedown", (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartMin = this.apexOptions.xaxis.min;
        dragStartMax = this.apexOptions.xaxis.max;
      });

      container.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const chart = this.chart, w = chart?.w;
        if (!w) return;
        const deltaPx = e.clientX - dragStartX;
        const xRange = dragStartMax - dragStartMin;
        const pxPerMs = xRange / w.globals.gridWidth;
        const deltaMs = -deltaPx * pxPerMs;
        const newMin = dragStartMin + deltaMs;
        const newMax = dragStartMax + deltaMs;
        this.apexOptions.xaxis.min = newMin;
        this.apexOptions.xaxis.max = newMax;
        chart.updateOptions({ xaxis: this.apexOptions.xaxis }, false, false);
      });

      container.addEventListener("mouseup", async () => {
        if (!isDragging) return;
        isDragging = false;
        const min = this.apexOptions.xaxis.min;
        const max = this.apexOptions.xaxis.max;
        if (this.isNearLeftEdge(min, max) && this.seriesDefs.some((s) => s.dataSource)) {
          await this.prefetchOlderSilent();
        }
        await this.updateYAxisForRange(min, max);
        this.updateLoadedLabel(min, max);
      });

      container.addEventListener("mouseleave", () => { isDragging = false; });
    }

    async onZoomOrScroll({ xaxis }) {
      if (!xaxis) return;
      const min = xaxis.min, max = xaxis.max;
      this.apexOptions.xaxis.min = min;
      this.apexOptions.xaxis.max = max;
      await this.updateYAxisForRange(min, max);
      if (this.seriesDefs.some((s) => s.dataSource) && this.isNearLeftEdge(min, max)) {
        this.prefetchOlderSilent();
      }
    }

    // ---------------------------------------------------
    // === Data Fetch ====================================
    // ---------------------------------------------------
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
        let added = 0;
        for (const s of this.seriesDefs) {
          if (!s.dataSource) continue;
          const resp = await s.dataSource.fetchOlder(s.dataSource.pageSize);
          const incoming = resp.points || [];
          if (incoming.length) { s.data = incoming.concat(s.data); added += incoming.length; }
        }
        if (added > 0) {
          const allX = this.seriesDefs.flatMap((s) => s.data.map((p) => p.x));
          const min = Math.min(...allX), max = Math.max(...allX);
          await this.chart.updateOptions({
            series: this.seriesDefs.map((s) => ({
              name: s.name, type: s.type, data: s.data,
            })),
          });
          await this.updateYAxisForRange(min, max);
          this.refreshLatestOHLCLabels();
          this.updateLoadedLabel(min, max);
        }
        return added;
      } catch (e) {
        console.error(`[${this.key}] prefetch failed:`, e);
        return 0;
      } finally {
        this.hideSpinner(); this.isFetching = false;
      }
    }

    // ---------------------------------------------------
    // === OHLC Display ==================================
    // ---------------------------------------------------
    setOHLCColors(ids, bullish) {
      const pos = "text-success", neg = "text-danger";
      ["open", "high", "low", "close"].forEach((k) => {
        const el = byId(ids[k]); if (!el) return;
        el.classList.remove(pos, neg); el.classList.add(bullish ? pos : neg);
      });
    }

    writeOHLC(ids, candle, interval) {
      if (!ids || !candle) return;
      const [O, H, L, C] = candle.y;
      const setTxt = (id, v) => { const el = byId(id); if (el) el.textContent = v; };
      setTxt(ids.date, formatForInterval(candle.x, interval));
      setTxt(ids.open, fmtNum(O));
      setTxt(ids.high, fmtNum(H));
      setTxt(ids.low, fmtNum(L));
      setTxt(ids.close, fmtNum(C));
      this.setOHLCColors(ids, C >= O);
      const pill = byId(ids.pillId); if (pill) pill.classList.remove("d-none");
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

    refreshLatestOHLCLabels() { if (!this.hoverActive) this.showLatestOHLCForAll(); }

    // ---------------------------------------------------
    // === Helpers =======================================
    // ---------------------------------------------------
    isNearLeftEdge(xMin, xMax) {
      const span = Math.max(1, xMax - xMin);
      const EDGE_RATIO = 0.12;
      const firstX = Math.min(...this.seriesDefs.flatMap((s) => s.data.map((p) => p.x)));
      return xMin <= firstX + span * EDGE_RATIO;
    }

    calcYLimits(xMin, xMax, marginPct) {
      let yMin = Infinity, yMax = -Infinity;
      for (const s of this.seriesDefs) {
        for (const pt of s.data) {
          if (!pt || pt.x < xMin || pt.x > xMax) continue;
          if (s.type === "candlestick" && Array.isArray(pt.y)) {
            yMin = Math.min(yMin, pt.y[2]); yMax = Math.max(yMax, pt.y[1]);
          } else {
            const v = Array.isArray(pt.y) ? pt.y[3] : pt.y;
            yMin = Math.min(yMin, v); yMax = Math.max(yMax, v);
          }
        }
      }
      if (!isFinite(yMin) || !isFinite(yMax) || yMax <= yMin) return { min: 0, max: 1 };
      const pad = Math.abs((yMax - yMin) * (marginPct / 100));
      return { min: yMin - pad, max: yMax + pad };
    }

    async updateYAxisForRange(min, max) {
      const yL = this.calcYLimits(min, max, 2.5);
      this.apexOptions.yaxis.min = yL.min;
      this.apexOptions.yaxis.max = yL.max;
      await this.chart?.updateOptions(
        { yaxis: { ...this.apexOptions.yaxis, min: yL.min, max: yL.max } },
        false, false
      );
    }

    updateLoadedLabel(min, max) {
      if (!this.loadedLabelId) return;
      this.setLoadedText(
        `${formatForInterval(min, this.selectedInterval)} … ${formatForInterval(
          max, this.selectedInterval
        )} (len ${this.seriesDefs[0]?.data.length || 0})`
      );
    }
  }

  global.ChartKit = ChartKit;
})(window);
