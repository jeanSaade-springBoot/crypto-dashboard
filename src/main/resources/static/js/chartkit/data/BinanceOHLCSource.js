/****************************************************
 * ChartKit BinanceOHLCSource
 ****************************************************/
(function (global) {
  class BinanceOHLCSource extends global.ChartDataSource {
    constructor({ symbol = "BTCUSDT", interval = "1h", pageSize = 250 }) {
      super();
      this.symbol = symbol.toUpperCase();
      this.interval = interval;
      this.pageSize = pageSize;
      this.cursorMs = null;
      this._base = "https://api.binance.com/api/v3/klines";
    }

    setInterval(interval) {
      this.interval = interval;
      this.cursorMs = null;
    }

    async fetchOlder(limit = this.pageSize) {
      const endTimeMs = Number.isFinite(this.cursorMs)
        ? this.cursorMs - 1
        : Date.now();

      const url = new URL(this._base);
      url.searchParams.set("symbol", this.symbol);
      url.searchParams.set("interval", this.interval);
      url.searchParams.set("limit", String(Math.max(1, Math.min(1000, limit))));
      url.searchParams.set("endTime", String(endTimeMs));

      let res;
      try {
        res = await fetch(url.toString(), { mode: "cors" });
      } catch (err) {
        throw new Error(`Binance fetch error: ${err?.message || err}`);
      }

      if (!res.ok) {
        if (res.status === 429) throw new Error("Binance rate limit (429).");
        throw new Error(`Binance ${res.status} ${res.statusText}`);
      }

      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) return { points: [] };

      const points = arr.map((k) => ({
        x: k[0], 
        y: [+k[1], +k[2], +k[3], +k[4]],
        volume: +k[5],
      }));

      this.cursorMs = arr[0][0];
      return { points, cursorMs: this.cursorMs };
    }
  }

  global.BinanceOHLCSource = BinanceOHLCSource;
})(window);
