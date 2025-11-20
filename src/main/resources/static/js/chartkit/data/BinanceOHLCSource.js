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
    }

  
  setInterval(tf) {
    this.interval = tf;
    this.cursorMs = null;
  }

  async fetchOlder() {
    const url = `/api/chart/ohlc?symbol=${this.symbol}&interval=${this.interval}&source=binance&includeIndicators=true`;

    const res = await fetch(url);
    const arr = await res.json();

    const points = arr.map(k => ({
      x: k.timestamp,
      y: [k.open, k.high, k.low, k.close],
      volume: k.volume,
      rsi: k.rsi // <--- add this
    }));

    this.cursorMs = points.length ? points[0].x : null;
    return { points };
  }
  }

  global.BinanceOHLCSource = BinanceOHLCSource;
})(window);
