/****************************************************
 * charts.app.js — App wiring using ChartKit
 * - Creates charts
 * - Exposes helpers for buttons (timeframe/symbol)
 ****************************************************/

// Button helpers you can call from HTML
window.chartkitChangeTimeframe = async (key, tf) => {
  const inst = ChartKit.get(key);
  if (!inst) return console.warn(`Chart '${key}' not found`);
  await inst.changeTimeframe(tf);
};
window.chartkitChangeSymbol = async (key, seriesIndex, symbol) => {
  const inst = ChartKit.get(key);
  if (!inst) return console.warn(`Chart '${key}' not found`);
  await inst.changeSymbolFor(seriesIndex, symbol);
};

document.addEventListener('DOMContentLoaded', async () => {
  // EXAMPLE 1: Your current BTC chart with 2 series (candle + overlay line)
  ChartKit.create({
    key: 'btc',
    containerId: 'main-chart',        // <div id="main-chart"></div>
    spinnerId: 'loading-spinner',     // <div id="loading-spinner"></div>
    loadedLabelId: 'loadedLbl',       // <span id="loadedLbl"></span>
    windowSize: 120,
    apex: {
      chart: { type: 'candlestick', height: 350 },
      // You may pass ANY ApexCharts option here; it deep-merges:
      // colors: ['#22c55e', '#60a5fa'],
      // stroke: { width: [1, 2] },
      // dataLabels: { enabled: false },
    },
    series: [
      {
        name: 'BTC',
        type: 'candlestick',
        color: '#22c55e',
        dataSource: new BinanceOHLCSource({ symbol: 'BTCUSDT', interval: '4h', pageSize: 250 }),
        ohlcPill: { date:'date', open:'open', high:'high', low:'low', close:'close', pillId:'ohlc-info' }
      }/*,
      {
        name: 'Overlay Line',
        type: 'line',
        color: '#60a5fa',
        data: [] // fill later if you want an MA overlay, etc.
      }*/
    ]
  });

  // EXAMPLE 2 (optional): a second chart (ETH) with different options
   ChartKit.create({
    key: 'chart2',
     containerId: 'eth-chart',
     spinnerId: 'loading-spinner-chart2',
     loadedLabelId: 'eth-loadedLbl',
     windowSize: 100,
     apex: {
       chart: { type: 'candlestick', height: 350 },
     },
    series: [
       {
        name: 'ETH',
         type: 'candlestick',
         color: '#f59e0b',
         dataSource: new BinanceOHLCSource({ symbol:'ETHUSDT', interval:'4h', pageSize: 250 })
       }
     ]
   });
   ChartKit.create({
    key: 'chart3',
     containerId: 'chart3',
     spinnerId: 'loading-spinner-chart3',
     loadedLabelId: 'chart3-label',
     windowSize: 100,
     apex: {
       chart: { type: 'candlestick', height: 350 },
     },
    series: [
       {
        name: 'ETH',
         type: 'candlestick',
         color: '#f59e0b',
         dataSource: new BinanceOHLCSource({ symbol:'XRPUSDT', interval:'4h', pageSize: 250 })
       }
     ]
   });
   ChartKit.create({
    key: 'chart4',
     containerId: 'chart4',
     spinnerId: 'loading-spinner-chart4',
     loadedLabelId: 'label',
     windowSize: 100,
     apex: {
       chart: { type: 'candlestick', height: 350 },
     },
    series: [
       {
        name: 'ETH',
         type: 'candlestick',
         color: '#f59e0b',
         dataSource: new BinanceOHLCSource({ symbol:'SOLUSDT', interval:'4h', pageSize: 250 })
       }
     ]
   });
});
// Back-compat shim for older HTML calling window.changeTimeframe('1h')
// Optional: pass the clicked button as 2nd arg, and/or a chart key as 3rd arg:
//   changeTimeframe('1h', this, 'btc')
window.changeTimeframe = function(tf, el, key = 'btc') {
  const inst = (window.ChartKit && ChartKit.get) ? ChartKit.get(key) : null;
  if (!inst) { console.warn(`Chart '${key}' not found`); return; }

  // Find the right button group
  let group = null;
  if (el && el.closest) group = el.closest('.btn-group');
  if (!group) group = document.querySelector(`.btn-group[data-chart="${key}"]`);
  if (!group) group = document.querySelector('.btn-group'); // last resort

  // Toggle active class in that group
  if (group) {
    group.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    // match by data-tf if present, else by button text
    const match = Array.from(group.querySelectorAll('.btn')).find(b => {
      const val = (b.dataset.tf || (b.textContent || '')).trim().toLowerCase();
      return val === String(tf).toLowerCase();
    });
    if (match) match.classList.add('active');
  }

  // Change the chart timeframe
  inst.changeTimeframe(tf);
};