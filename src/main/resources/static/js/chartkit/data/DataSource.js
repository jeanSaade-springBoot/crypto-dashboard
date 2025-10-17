/****************************************************
 * ChartKit Base DataSource
 ****************************************************/
(function (global) {
  class ChartDataSource {
    // interface only
    // async fetchOlder(limit): returns { points, cursorMs? }
    // setInterval(interval) (optional)
  }
  global.ChartDataSource = ChartDataSource;
})(window);
