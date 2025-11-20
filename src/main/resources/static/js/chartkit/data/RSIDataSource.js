/****************************************************
 * RSI DataSource (wraps BinanceOHLCSource output)
 ****************************************************/
(function (global) {

  class RSIDataSource extends global.ChartDataSource {
    constructor(ohlcSource) {
      super();
      this.ohlcSource = ohlcSource; 
    }

    async fetchOlder() {
      const res = await this.ohlcSource.fetchOlder();

      // Turn OHLC points into RSI points
      const points = res.points.map(p => ({
        x: p.x,
        y: p.rsi != null ? Number(p.rsi) : null
      }));

      return { points };
    }
  }

  global.RSIDataSource = RSIDataSource;

})(window);