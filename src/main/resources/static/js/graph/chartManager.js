class ChartManager {
	// Registry for instances
	static instances = {};

	// HTML template for dynamic chart containers
	static chartTemplate = `
<div id="{chartId}-inner" class="chart-box">
  <div class="d-flex">
    <div class="bg-chart-dark" style="z-index: 1;">
      <div class="chart-sidebar collapsed" id="chartSidebar-{chartId}">
        <div class="toggle-sidebar" data-chart-id="{chartId}">&#10094;</div>
        <div class="chart-option" id="chart-option-{chartId}">
          <div class="chart-option-title" id="chart-settings-{chartId}"></div>
          
          <button
            type="button"
            class="menu-header collapsed chart-menu-toggle btn w-100 mb-2 text-start"
             data-pcollapse="toggle"
  			data-target="#menu-{chartId}"
            aria-expanded="false"
            aria-controls="menu-{chartId}">
            <span class="left">
              <span class="label">Chart Options</span>
            </span>
            <i class="fa-solid fa-chevron-down chev ms-auto"></i>
          </button>
          
          <!-- Chart Type -->
          <div id="menu-{chartId}" class="collapse">
          <div class="btn-group mt-2 ml-1" id="chartTypes-{chartId}">
            <button id="area-{chartId}" class="btn btn-option"><i class="icon-areachart"></i></button>
            <button id="line-{chartId}" class="btn btn-option"><i class="icon-linechart"></i></button>
            <button id="column-{chartId}" class="btn btn-option"><i class="icon-barchart"></i></button>
          </div>
          <!-- Color -->
          <div class="btn-group mt-2 ml-1" id="chartColor-{chartId}">
            <button id="F0AB2E-{chartId}" class="btn btn-option"><i class="icon-goldchart"></i></button>
            <button id="0097FE-{chartId}" class="btn btn-option"><i class="icon-bluechart"></i></button>
            <button id="44546a-{chartId}" class="btn btn-option"><i class="icon-darkchart"></i></button>
          </div>
          <!-- Transparency -->
          <div class="btn-group mt-2 ml-1" id="chartColorTransparency-{chartId}">
            <button id="1-{chartId}" class="btn btn-option"><label class="transparency-text"><span>&shy;</span>&nbsp;0%</label><i class="icon-chart-1"></i></button>
            <button id="75-{chartId}" class="btn btn-option"><label class="transparency-text">25%</label><i class="icon-chart-25"></i></button>
            <button id="5-{chartId}" class="btn btn-option"><label class="transparency-text">50%</label><i class="icon-chart-50"></i></button>
          </div>
          <!-- Marker Size -->
          <div class="btn-group mt-2 ml-1" id="chartMarker-{chartId}">
            <button id="1-0-{chartId}" class="btn btn-option"><i class="icon-linechart"></i></button>
            <button id="1-1-{chartId}" class="btn btn-option"><i class="icon-smallmarkerchart"></i></button>
            <button id="1-3-{chartId}" class="btn btn-option"><i class="icon-bigmarkerchart"></i></button>
          </div>
          <!-- Font Size -->
          <div class="btn-group mt-2 ml-1" id="fontOptions-{chartId}">
            <button id="12px-{chartId}" class="btn btn-option"><i class="icon-small-a"></i></button>
            <button id="14px-{chartId}" class="btn btn-option"><i class="icon-medium-a"></i></button>
            <button id="16px-{chartId}" class="btn btn-option"><i class="icon-large-a"></i></button>
          </div>
          <!-- Grid & Legend -->
          <div class="btn-group mt-2 ml-1" id="gridOptions-{chartId}">
            <button id="true-{chartId}" class="btn btn-option"><i class="icon-withLinechart"></i></button>
            <button id="false-{chartId}" class="btn btn-option"><i class="icon-withoutLinechart"></i></button>
          </div>
          <br>
          <div class="btn-group mt-2 ml-1" id="gridLegend-{chartId}">
            <button id="legendtrue-{chartId}" class="btn btn-option"><i class="icon-legendchart"></i></button>
            <button id="legendfalse-{chartId}" class="btn btn-option"><i class="icon-nolegendchart"></i></button>
          </div>
         </div>
        </div>
      </div>
    </div>
    <div id="chart-{chartId}" class="chart-box col-11 chartStyle d-flex"></div>
  </div>
  <div class="mt-2 d-flex justify-content-between date-navigation">
    <div class="btn-group mr-2">
      <button id="button-yearBackward-{chartId}" class="btn btn-secondary fs-7 d-flex align-items-center" onclick="ChartManager.instances['{chartId}'].navigate('yearBackward')"><i class="fas fa-angle-double-left pr-1"></i>Y</button>
      <button id="button-monthBackward-{chartId}" class="btn btn-secondary fs-7 d-flex align-items-center" onclick="ChartManager.instances['{chartId}'].navigate('monthBackward')"><i class="fas fa-angle-double-left pr-1"></i>M</button>
      <button id="button-weekBackward-{chartId}" class="btn btn-secondary fs-7 d-flex align-items-center" onclick="ChartManager.instances['{chartId}'].navigate('weekBackward')"><i class="fas fa-angle-double-left pr-1"></i>W</button>
    </div>
    <div class="btn-group mr-2 justify-content-center">
	  <label>From</label>
	  <input id="dateFrom-{chartId}" class="inputdate form-control form-control-sm" disabled>
	  <label>To</label>
	  <input id="dateTo-{chartId}" class="inputdate form-control form-control-sm" disabled>
	  <div class="form-check ml-2 d-flex align-items-center">
	    <input class="form-check-input" type="checkbox" id="freezeRange-{chartId}">
	    <label class="form-check-label ml-1" for="freezeRange-{chartId}">Freeze</label>
	  </div>
</div>
    <div class="btn-group">
      <button id="button-weekForward-{chartId}" class="btn btn-secondary fs-7 d-flex align-items-center" onclick="ChartManager.instances['{chartId}'].navigate('weekForward')"> W<i class="fas fa-angle-double-right pl-1"></i></button>
      <button id="button-monthForward-{chartId}" class="btn btn-secondary fs-7 d-flex align-items-center" onclick="ChartManager.instances['{chartId}'].navigate('monthForward')"> M<i class="fas fa-angle-double-right pl-1"></i></button>
      <button id="button-yearForward-{chartId}" class="btn btn-secondary fs-7 d-flex align-items-center" onclick="ChartManager.instances['{chartId}'].navigate('yearForward')"> Y<i class="fas fa-angle-double-right pl-1"></i></button>
    </div>
  </div>
  
  <div id="overlay-{chartId}" class="chart-overlay d-none">
	 	<img src="/css/images/loader.gif" alt="Loading" class="chart-overlay-img" />
	</div>
</div>
`;

	constructor(chartId, config = {}, parentSelector = '#chartsContainer') {
		this.chartId = chartId;
		this.parentSelector = parentSelector;
		this.selector = `#chart-${chartId}`;
		this.config = config;
		this.chart = null;
		this._eventsBound = false;
		this._batching = false;
		this._originalDataParam = null; // holds previous data param

		const today = new Date();
		const fromDate = new Date();
		fromDate.setMonth(today.getMonth() - 4);
		fromDate.setHours(0, 0, 0, 0);

		this.state = {
			chartHeight: 625,
			chartType: 'line',
			color: '#f0ab2e',
			transparency: 1,
			markerSize: 1,
			gridVisible: true,
			legendOption: true,
			fontSize: '14px',
			yAxisLimits: { min: 0, max: 100 },
			yAxisFormat: 2,
			isDecimal: true,
			useDualYAxis: false,
			seriesFormats: [],
			series: [],
			seriesLimits: [], // ✅ ADD THIS LINE
			title: 'Chart',
			defaultFromDate: fromDate,
			defaultToDate: today,
			formatYAxisShort: false, // default: use full numbers
			applyTransparency: false

		};
		ChartManager.instances[chartId] = this;
	}

	async render() {

		const parent = document.querySelector(this.parentSelector);
		if (!parent) throw new Error(`Container "${this.parentSelector}" not found`);
		if (!document.getElementById(`${this.chartId}-inner`)) {
			parent.insertAdjacentHTML(
				'beforeend',
				ChartManager.chartTemplate.replaceAll('{chartId}', this.chartId)
			);
		}

		const fromInput = document.getElementById(`dateFrom-${this.chartId}`);
		const toInput = document.getElementById(`dateTo-${this.chartId}`);
		if (fromInput && toInput) {
			if (!fromInput.value) {
				fromInput.value = this._formatDate(this.state.defaultFromDate);
			}
			if (!toInput.value) {
				toInput.value = this._formatDate(this.state.defaultToDate);
			}
		}

		const sidebarToggle = document.querySelector(`#chartSidebar-${this.chartId} .toggle-sidebar`);
		if (sidebarToggle) {
			sidebarToggle.onclick = () => this.toggleSidebar();
		}

		if (this.chart) this.chart.destroy();
		this.chart = new ApexCharts(
			document.querySelector(this.selector),
			Object.assign({}, this.config, { series: this.state.series })
		);

		return this.chart.render().then(() => {
			this.applyStyle();
			if (!this._eventsBound) {
				this._bindUIEvents();
				this._eventsBound = true;
			}
		});
	}

	batch(fn) {
		this._batching = true;
		try { fn(); }
		finally {
			this._batching = false;
			this.applyStyle();
		}
	}

	_formatDate(date) {
		const pad = (n) => String(n).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	}
	_computeYAxisWithMargin(min, max, marginPercent = 5) {
		const margin = (max - min) * (marginPercent / 100);
		const minWithMargin = min - margin;
		const maxWithMargin = max + margin;
		return {
			min: (minWithMargin < 0 && min >= 0) ? 0 : minWithMargin,
			max: maxWithMargin
		};
	}
	_flattenYValuesForRange(seriesData, type) {
		if (type === 'candlestick') {
			return seriesData.flatMap(p => Array.isArray(p.y) ? p.y.map(Number) : []);
		}
		return seriesData.map(p => p.y).filter(y => !isNaN(y));
	}
	_bindUIEvents() {
  const id = this.chartId;
  const makeGroupHandler = (groupId, handler) => {
    const group = document.getElementById(`${groupId}-${id}`);
    if (!group) return;
    group.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        group.querySelectorAll('button.active').forEach(a => a.classList.remove('active'));
        btn.classList.add('active');
        handler(btn);
      };
    });
  };

  // Chart Type
  makeGroupHandler('chartTypes', btn => {
    const type = btn.id.split(`-${id}`)[0];

    if (type === 'column') {
      const updated = this.state.series.map(s => ({ ...s, type: 'column' }));
      this.batch(() => {
        this.setSeries(updated);
        this.setChartType('line');
        this.setColor('#ffffff'); // force white for column-line switch
      });
    } else {
      const updated = this.state.series.map(s => ({ ...s, type }));
      this.batch(() => {
        this.setSeries(updated);
        this.setChartType(type);
        if (type === 'line') {
          this.setColor('#ffffff');
        } else {
          const colorGroup = document.getElementById(`chartColor-${id}`);
          const activeBtn = colorGroup?.querySelector('button.active');
          if (activeBtn) {
            const colorHex = '#' + activeBtn.id.split('-')[0];
            this.setColor(colorHex);
          }
        }
      });
    }
  });

  // Color
  makeGroupHandler('chartColor', btn => this.setColor(`#${btn.id.split('-')[0]}`));
  // Transparency
  makeGroupHandler('chartColorTransparency', btn => {
    const val = parseInt(btn.id.split('-')[0], 10) / (btn.id.startsWith('1-') ? 1 : 100);
    this.setTransparency(val);
  });
  // Marker
  makeGroupHandler('chartMarker', btn => this.setMarkerSize(Number(btn.id.split('-')[1])));
  // Font
  makeGroupHandler('fontOptions', btn => this.setFontSize(btn.id.split(`-${id}`)[0]));
  // Grid
  makeGroupHandler('gridOptions', btn => this.setGrid(btn.id.startsWith('true')));
  // Legend
  makeGroupHandler('gridLegend', btn => this.setLegend(btn.id.startsWith('legendtrue')));

  // 🔁 Freeze toggle → just recompute which buttons should be enabled
 // 🔁 Freeze toggle — when unchecked, force To date = today and reload
const freezeEl = document.getElementById(`freezeRange-${id}`);
if (freezeEl && !freezeEl._bound) {
  freezeEl.addEventListener('change', async () => {
    if (!freezeEl.checked) {
      const toInput   = document.getElementById(`dateTo-${id}`);
      const fromInput = document.getElementById(`dateFrom-${id}`);

      // set To to today's date (00:00)
      const today = new Date(); today.setHours(0,0,0,0);
      const toStr = this._formatDate(today);
      if (toInput) toInput.value = toStr;

      // persist in state / last data param
      this.state.defaultToDate = today;
      if (this._lastDataParam) this._lastDataParam.todate = toStr + ' 23:59:59';

      // reload with same From + new To
      const loadFn = this._loadMethod || this.loadData.bind(this);
      const fromStr = fromInput?.value || this._formatDate(this.state.defaultFromDate);

      await loadFn({
        service: this._lastService,
        api: this._api,
        name: this._lastGraphName,
        removeEmpty: this._lastRemoveEmpty,
        saveHistory: this._lastSaveHistory,
        fromOverride: fromStr,
        toOverride: toStr,
        applyDb: false,
        seriesTypes: this.state.series.map(s => s.type),
        seriesColors: this.state.seriesColors ?? [this.state.color],
        useDualYAxis: this.state.useDualYAxis,
        dataParam: this._lastDataParam,
        useShortFormatList: this._useShortFormatList,
        interval: this._interval,
        applyTransparency: this._applyTransparency,
        shouldAlign: this._shouldAlign,
        disableMarkers: this._disableMarkers,
        isCentred: this._isCentred,
        results: this._lastOverlayResults || [],
        applyTitle: this._applyTitle,
        showLegend: this._showLegend,
        disableMarkers: this._disableMarkers,
        markerSizeArray: this._markerSizeArray,
        combineTooltips: this._combineTooltips,
        timeLabel: this._timeLabel,
      });
    }

    // refresh button states after any toggle
    this._updateNavButtons();
  });
  freezeEl._bound = true;
}

}
	_showLoading(show = true) {
		const overlay = document.getElementById(`overlay-${this.chartId}`);
		if (overlay) {
			overlay.classList.toggle('d-none', !show);
		}
	}
	_disableChartSettings(disabled, excludeGroupIds = []) {
		const groups = [
			'chartTypes',
			'chartColor',
			'chartColorTransparency',
			'chartMarker',
			'fontOptions',
			'gridOptions',
			'gridLegend'
		];

		for (const groupId of groups) {
			if (excludeGroupIds.includes(groupId)) continue; // ⛔ skip excluded group

			const group = document.getElementById(`${groupId}-${this.chartId}`);
			if (group) {
				group.querySelectorAll('button').forEach(btn => {
					const isCandlestick = btn.id.startsWith('candlestick-');
					btn.disabled = isCandlestick ? false : disabled;
				});
			}
		}
	}
_updateNavButtons() {
  const id = this.chartId;
  const { from, to, today, freeze } = this._getDates();
  if (!from || !to) return;

  // Forward candidates
  const fWeek  = this._shiftBy(from, to, 'weekForward',  freeze);
  const fMonth = this._shiftBy(from, to, 'monthForward', freeze);
  const fYear  = this._shiftBy(from, to, 'yearForward',  freeze);

  const capExceeds = cand => (freeze ? cand.to : cand.from) > today;

  const btnWF = document.getElementById(`button-weekForward-${id}`);
  const btnMF = document.getElementById(`button-monthForward-${id}`);
  const btnYF = document.getElementById(`button-yearForward-${id}`);
  if (btnWF) btnWF.disabled = capExceeds(fWeek);
  if (btnMF) btnMF.disabled = capExceeds(fMonth);
  if (btnYF) btnYF.disabled = capExceeds(fYear);

  // Backward candidates
  const bWeek  = this._shiftBy(from, to, 'weekBackward',  freeze);
  const bMonth = this._shiftBy(from, to, 'monthBackward', freeze);
  const bYear  = this._shiftBy(from, to, 'yearBackward',  freeze);

  const start = this.state?.startDate ? new Date(this.state.startDate) : null;
  if (start) start.setHours(0,0,0,0);

  const beforeStart = cand => (start ? cand.from <= start : false);

  // ✅ Use your actual button IDs (no kebab-case transform)
  const btnWB = document.getElementById(`button-weekBackward-${id}`);
  const btnMB = document.getElementById(`button-monthBackward-${id}`);
  const btnYB = document.getElementById(`button-yearBackward-${id}`);

  if (btnWB) btnWB.disabled = beforeStart(bWeek);
  if (btnMB) btnMB.disabled = beforeStart(bMonth);
  if (btnYB) btnYB.disabled = beforeStart(bYear);
}

	/**
	 * Apply a DB row of chart settings into both state and UI
	 */
	applyDbConfig(db) {
		this.batch(() => {
			// map DB fields to state
			this.state.chartType = db.chartType.toLowerCase();
			this.state.color = db.chartColor;//db.chartColor == '#44546a' ? '#2e75b6' : db.chartColor;
			this.state.transparency = parseFloat(db.chartTransparency);
			this.state.markerSize = parseInt(db.chartshowMarkes, 10);
			this.state.fontSize = db.chartSize;
			this.state.gridVisible = db.chartShowgrid === 'true';
			this.state.legendOption = true;
			// UI button activation
			const activate = (group, id) => {
				const g = document.getElementById(`${group}-${this.chartId}`);
				if (!g) return;
				g.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.id === id));
			};
			activate('chartTypes', `${this.state.chartType}-${this.chartId}`);
			activate('chartColor', `${this.state.color.replace('#', '')}-${this.chartId}`);
			activate('chartColorTransparency', `${Math.round(this.state.transparency)}-${this.chartId}`);
			activate('chartMarker', `1-${this.state.markerSize}-${this.chartId}`);
			activate('fontOptions', `${this.state.fontSize}-${this.chartId}`);
			activate('gridOptions', `${this.state.gridVisible}-${this.chartId}`);
			activate('gridLegend', `legendtrue-${this.chartId}`);
		});
	}
	chartColorOpacity(chartColor)
	{
	  var colorCode='';	
		switch(chartColor) {
		  
		 case '#F0AB2E': 
		   colorCode='#F0AB2E75'
		        break;
		 case '#0097FE': 
		   colorCode='#0097FE75'
		        break;
		 case '#44546a': 
		   colorCode='#44546a75'
			    break;
		}
	return colorCode;
	}
	applyStyle() {
		const s = this.state;
		const showLegend = this._showLegend;
		const base = s.color;
		const finalColor = base === '#44546a' ? '#2e75b6' : base;
		const fill = s.chartType === 'area' && !s.applyTransparency
			? {
				type: 'gradient',
				gradient: {// gradientToColors: [finalColor], 
					type: 'vertical',
					shadeIntensity: 0,
					inverseColors: false,
					stops: [30, 90, 100],
					opacityFrom: s.transparency === 1 ? 1 : (s.transparency === 0.75 ? 0.8 : 0.6),
					opacityTo: s.transparency
				}
			}
			: { type: 'solid', opacity: [1, 1] };

		const baseColors = Array.isArray(s.seriesColors) && s.seriesColors.length > 1
		  ? s.seriesColors
		  : [finalColor];
  		const isSingleSeries = s.series.length === 1;
		const useWhiteStroke = isSingleSeries && (s.series[0].type === 'area'||s.series[0].type === 'line');
		const annotations = this.generateDynamicYAnnotations(s.series, s.functionId);
		const hasColumn = s.series.some(series => series.type === 'column');
		
		const isSpecialFunctionId = [3, 4, 5, 6, 10, 11, 12, 13, 14, 15].includes(s.functionId);

	let colors = [];
	let strokeColors = [];
	
	if (isSpecialFunctionId) {
	  // Main color (for area/column fill)
	  colors = [
	    function({ value, seriesIndex, w }) {
	      return 'rgba(255,255,255,0.15)'; // White with opacity
	    },
	    function({ value, seriesIndex, w }) {
	      if (seriesIndex !== 0) {
	        return value <= 0 ? '#f23a3aa3' : '#30d7818c';
	      }
	    }
	  ];
	
	  // Stroke color (always full white for both series)
	  strokeColors = ['#ffffff',
	    function({ value, seriesIndex, w }) {
	      if (seriesIndex !== 0) {
	        return value <= 0 ? '#f23a3aa3' : '#30d7818c';
	      }
	      return 'rgba(255,255,255,0.4)'; // fallback
	    }];
	
	} else {
	  // Default behavior
	  colors = baseColors;
	
	  strokeColors =  isSingleSeries ? [useWhiteStroke ? '#ffffff' : baseColors[0]] : baseColors; // Match stroke to fill for default
	}
		this.chart.updateOptions({
			series: s.series,
			chart: {
				type:hasColumn? 'line': s.chartType,
				height: s.chartHeight,
				animations: { enabled: false },
				toolbar: {
					show: true,
					offsetX: -50,
					tools: {
						download: false,
						selection: true,
						zoom: true,
						zoomin: true,
						zoomout: true,
						pan: true,
						reset: true
					}
				},
				redrawOnParentResize: false
			},
			title: {
				text: s.title,
				align: 'center',
				style: { fontWeight: 'bold' }
			},
			subtitle: {
				text: 'copyright LibVol.com',
				align: 'right',
				offsetX: -50,
				offsetY: 30,
				style: { fontSize: '10px', color: '#9699a2' }
			},
			fill: fill,
			colors: colors,
			stroke: {
				curve: 'straight',
				width: 2.25,
				colors: strokeColors
			},
			markers: {
				colors: isSingleSeries ? [useWhiteStroke ? '#ffffff' : baseColors[0]] : baseColors,
				strokeColors: isSingleSeries ? [useWhiteStroke ? '#ffffff' : baseColors[0]] : baseColors,
				shape: 'square',
				size: s.disableMarkers? s.markerSizeArray :s.markerSize
			},
			grid: { show: s.gridVisible, borderColor: '#f0e68c', strokeDashArray: 1, padding: { right: 60 } },
			legend: s.series?.[0]?.type === 'candlestick'
				? { show: false }
				: {
					show: showLegend?s.legendOption:false, // here
					fontSize: s.fontSize,
					showForSingleSeries: true,
					labels: { colors: 'White' },
					markers: { width: 12, height: 2 },
					formatter: name => name
				},
			yaxis: this.state.useDualYAxis && this.state.series.length > 1
				? this.state.series.map((_, idx) => this.generateYAxisConfig(idx,s.isCentred[idx]))
				: [this.generateYAxisConfig(0)],
			xaxis: { type: 'category', labels: { rotate: -70, style: { fontSize: s.fontSize } }, axisBorder: { show: true, color: '#ffffff', height: 3 } },
	tooltip: {
  enabled: true,
  shared: true,
  custom: ({ series, seriesIndex, dataPointIndex, w }) => {
    const combineTooltips = this.state?.combineTooltips ?? false;

    const candlestickIndex = w.config.series.findIndex(s => s.type === 'candlestick');
    const isCandlestickHover = seriesIndex === candlestickIndex;

    const getFormat = (i) =>
      this.state?.seriesTooltipFormats?.[i] || {
        digits: 2,
        isPercentage: true,
        useShortFormat: false
      };

    const formatNumberShort = (num, digits) => {
      if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(digits) + 'B';
      if (num >= 1_000_000) return (num / 1_000_000).toFixed(digits) + 'M';
      if (num >= 1_000) return (num / 1_000).toFixed(digits) + 'K';
      return num.toFixed(digits);
    };

    // === CASE 1: Hovering over candlestick ===
    if (isCandlestickHover) {
      const open = w.globals.seriesCandleO?.[candlestickIndex]?.[dataPointIndex];
      const high = w.globals.seriesCandleH?.[candlestickIndex]?.[dataPointIndex];
      const low = w.globals.seriesCandleL?.[candlestickIndex]?.[dataPointIndex];
      const close = w.globals.seriesCandleC?.[candlestickIndex]?.[dataPointIndex];

      if ([open, high, low, close].some(val => val == null || isNaN(val))) return null;

      const decimals = getFormat(candlestickIndex).digits ?? 2;
      const formatVal = (val) =>
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(val);

      return `
        <div style="padding: 10px;">
          <div><strong>Open:</strong> ${formatVal(open)}</div>
          <div><strong>High:</strong> ${formatVal(high)}</div>
          <div><strong>Low:</strong> ${formatVal(low)}</div>
          <div><strong>Close:</strong> ${formatVal(close)}</div>
        </div>`;
    }

    // === CASE 2: Combine tooltips ===
	  if (combineTooltips) {
		  
	  const timeLabel = w.globals.categoryLabels?.[dataPointIndex] ?? 'Time';
	
	  let html = `<div style="padding: 10px;">`;
	  html += `<div style="margin-bottom: 8px; font-weight: bold;">${timeLabel}</div>`;
	
	  w.config.series.forEach((s, i) => {
	    if (i === candlestickIndex) return;
	
	    const yVal = w.globals.series[i]?.[dataPointIndex];
	    if (yVal == null || isNaN(yVal)) return;
	
	    const fmt = getFormat(i);
	    const val = fmt.useShortFormat
	      ? formatNumberShort(yVal, fmt.digits)
	      : yVal.toFixed(fmt.digits);
	
	    const color = w.globals.colors?.[i] || '#ccc';
	
	    html += `
	      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
	        <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%;"></span>
	        <div><strong>${s.name}:</strong> ${fmt.isPercentage ? val + "%" : val}</div>
	      </div>`;
	  });
	
	  html += `</div>`;
	  return html;
	}

    // === CASE 3: Default behavior: show single value tooltip
    const fmt = getFormat(seriesIndex);
    const yValue = w.globals.series?.[seriesIndex]?.[dataPointIndex];
    if (yValue == null || isNaN(yValue)) return null;

    const formatted = fmt.useShortFormat
      ? formatNumberShort(yValue, fmt.digits)
      : yValue.toFixed(fmt.digits);

    return `
      <div style="padding: 10px;">
        <div><strong>Value:</strong> ${fmt.isPercentage ? formatted + "%" : formatted}</div>
      </div>`;
  }
}
,

			annotations: annotations,
		});
	}

	setChartType(v) { this.state.chartType = v; if (!this._batching) this.applyStyle(); }
	setColor(v) { this.state.color = v; if (!this._batching) this.applyStyle(); }
	setTransparency(v) { this.state.transparency = v; if (!this._batching) this.applyStyle(); }
	setMarkerSize(v) { this.state.markerSize = v; if (!this._batching) this.applyStyle(); }
	setFontSize(v) { this.state.fontSize = v; if (!this._batching) this.applyStyle(); }
	setGrid(v) { this.state.gridVisible = v; if (!this._batching) this.applyStyle(); }
	setLegend(v) { this.state.legendOption = v; if (!this._batching) this.applyStyle(); }
	setYAxisLimits(min, max) { this.state.yAxisLimits = { min, max }; if (!this._batching) this.applyStyle(); }
	setYAxisFormat(fmt, dec = true) { this.state.yAxisFormat = fmt; this.state.isDecimal = dec; if (!this._batching) this.applyStyle(); }
	setSeries(arr) { this.state.series = arr; if (!this._batching) this.applyStyle(); }

	toggleSidebar() {
		const sb = document.getElementById(`chartSidebar-${this.chartId}`);
		if (!sb) return;
		sb.classList.toggle('collapsed');
		const btn = sb.querySelector('.toggle-sidebar');
		if (btn) btn.innerHTML = sb.classList.contains('collapsed') ? '&#10094;' : '&#10095;';
	}

	/**
  * Shift the From/To date range by a unit and direction,
  * enforce earliest date, re-load and redraw that chart only.
  */
 _getDates() {
  const id = this.chartId;
  const read = (elId) => {
    const v = document.getElementById(elId)?.value;
    const d = v ? new Date(v) : null;
    if (!d || isNaN(d)) return null;
    d.setHours(0,0,0,0);
    return d;
  };

  const from = read(`dateFrom-${id}`);
  const to   = read(`dateTo-${id}`);
  const today = new Date(); today.setHours(0,0,0,0);
  const freeze = !!document.getElementById(`freezeRange-${id}`)?.checked;

  return { from, to, today, freeze };
}

/**
 * step: 'weekForward' | 'monthForward' | 'yearForward' | 'weekBackward' | 'monthBackward' | 'yearBackward'
 * When freeze=true, shift both from & to; when false, only from moves (to stays).
 */
_shiftBy(from, to, step, freeze) {
  const unit  = step.includes('week')  ? 'week'  : step.includes('month') ? 'month' : 'year';
  const dir   = step.endsWith('Forward') ? 1 : -1;

  const f = new Date(from);
  const t = new Date(to);

  if (unit === 'week')  { f.setDate(f.getDate() + 7 * dir); if (freeze) t.setDate(t.getDate() + 7 * dir); }
  if (unit === 'month') { f.setMonth(f.getMonth() + 1 * dir); if (freeze) t.setMonth(t.getMonth() + 1 * dir); }
  if (unit === 'year')  { f.setFullYear(f.getFullYear() + 1 * dir); if (freeze) t.setFullYear(t.getFullYear() + 1 * dir); }

  return { from: f, to: freeze ? t : to };
}
	async navigate(direction) {
  const id = this.chartId;
  const fromInput = document.getElementById(`dateFrom-${id}`);
  const toInput   = document.getElementById(`dateTo-${id}`);
  if (!fromInput || !toInput) return;

  const { from, to, today, freeze } = this._getDates();
  if (!from || !to) return;

  // Propose new window
  let { from: nf, to: nt } = this._shiftBy(from, to, direction, freeze);

  // Clamp forward vs today
  if (direction.endsWith('Forward')) {
    if (freeze) {
      if (nt > today) {
        // shift left so that window ends at today
        const width = nt.getTime() - nf.getTime();
        nt = new Date(today);
        nf = new Date(nt.getTime() - width);
        nf.setHours(0,0,0,0);
      }
    } else {
      if (nf > today) nf.setTime(today.getTime());
    }
  }

  // Clamp backward vs startDate
  const start = this.state?.startDate ? new Date(this.state.startDate) : null;
  if (start) start.setHours(0,0,0,0);

  if (start && nf <= start) {
    if (freeze) {
      const width = nt.getTime() - nf.getTime();
      nf = new Date(start);
      nt = new Date(nf.getTime() + width);
    } else {
      nf = new Date(start);
    }
  }

  // Write back to inputs
  const fmt = d => this._formatDate(d);
  fromInput.value = fmt(nf);
  toInput.value   = fmt(nt);

  // Persist defaults (useful for later toggles like candlestick)
  this.state.defaultFromDate = nf;
  this.state.defaultToDate   = nt;

  // Keep request param dates consistent (when present)
  if (this._lastDataParam) {
    this._lastDataParam.fromdate = fmt(nf);
    this._lastDataParam.todate   = fmt(nt) + ' 23:59:59';
  }

  // Re-fetch using adjusted range
  const loadFn = this._loadMethod || this.loadData.bind(this);
  await loadFn({
    service: this._lastService,
    api: this._api,
    name: this._lastGraphName,
    removeEmpty: this._lastRemoveEmpty,
    saveHistory: this._lastSaveHistory,
    fromOverride: fmt(nf),
    toOverride: fmt(nt),
    applyDb: false,
    seriesTypes: this.state.series.map(s => s.type),
    seriesColors: this.state.seriesColors ?? [this.state.color],
    useDualYAxis: this.state.useDualYAxis,
    dataParam: this._lastDataParam,
    useShortFormatList: this._useShortFormatList,
    interval: this._interval,
    applyTransparency: this._applyTransparency,
    shouldAlign: this._shouldAlign,
    disableMarkers: this._disableMarkers,
    isCentred: this._isCentred,
    results: this._lastOverlayResults || [],
    applyTitle: this._applyTitle,
    showLegend: this._showLegend,
    disableMarkers: this._disableMarkers,
    markerSizeArray: this._markerSizeArray,
    combineTooltips: this._combineTooltips,
    timeLabel: this._timeLabel,
  });

  this._updateNavButtons();
}

	/**
 * Adds extra empty points to the right of the graph to maintain spacing.
 * @param {Array} data - List of {x, y} points.
 * @param {number} percentageMargin - Desired margin percentage (e.g., 5 for 5%)
 * @param {boolean} isCandlestick - Whether the chart is candlestick type
 * @returns {Promise<{ response: Array }>}
 */
	processDataAndAddNewEndDateForExtraSpaceInGraph(data, percentageMargin = 10, isCandlestick = false) {
		return new Promise((resolve, reject) => {
			try {
				if (!Array.isArray(data) || data.length === 0) {
					return resolve({ response: data });
				}

				const result = [...data];
				const count = result.length;
				const extraCount = Math.round(count * (percentageMargin / 100));

				const last = result[result.length - 1];
				const lastDate = new Date(last.x);

				for (let i = 1; i <= extraCount; i++) {
				    const futureDate = new Date(lastDate);
				    futureDate.setDate(futureDate.getDate() + i);
				
				    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
				                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
				    const day = futureDate.getDate().toString().padStart(2, '0');
				    const month = months[futureDate.getMonth()];
				    const year = futureDate.getFullYear().toString().slice(-2);
				
				    const formattedDate = `${day}-${month}-${year}`;
				
				    result.push({
				        x: formattedDate,
				        y: isCandlestick ? [] : null
				    });
				}
				resolve({ response: result });
			} catch (err) {
				reject(err);
			}
		});
	}

	async loadData({
		service,
		api,
		name,
		removeEmpty = false,
		saveHistory = false,
		fromOverride = null,
		toOverride = null,
		applyDb = true,
		seriesTypes = [],
		seriesColors = [],
		useDualYAxis = false,
		dataParam = null,
		useShortFormatList = [],
		interval = null,
		applyTransparency = false,
	    shouldAlign = false,
	    disableMarkers = false,
	    markerSizeArray = [],
	    isCentred = [],
	    currency='BTC',
	    applyTitle = false,
	    showLegend = true,
	    combineTooltips = false,
		timeLabel=true,
	}) {
		this._lastService = service;
		this._api = api;
		this._lastGraphName = name;
		this._lastRemoveEmpty = removeEmpty;
		this._lastSaveHistory = saveHistory;
		this._lastDataParam = dataParam;
		this._useShortFormatList = useShortFormatList;
		this._showLoading(true);
		this._interval=interval;
		this._applyTransparency=applyTransparency;
		this._shouldAlign=shouldAlign;
		this._disableMarkers=disableMarkers;
		this._markerSizeArray=markerSizeArray;
		this._isCentred=isCentred;
		this._applyTitle = applyTitle;
        this._showLegend = showLegend;
        this._combineTooltips=combineTooltips;
        this._timeLabel=timeLabel;
        
		if (interval !== null) {
			dataParam.interval = interval;
		}
		/*if (!dataParam) {
			const from = fromOverride ?? document.getElementById(`dateFrom-${this.chartId}`)?.value;
			const to = toOverride ?? document.getElementById(`dateTo-${this.chartId}`)?.value;

			dataParam = {
				fromdate: from,
				todate: to,
				period: 'd', type: '3',
				subGroupId1: '8', groupId1: '71',
				subGroupId2: '5', groupId2: '71',
				removeEmpty1: removeEmpty,
				removeEmpty2: removeEmpty
			};
		}*/
		this._loadMethod = this.loadData.bind(this); // in loadData

		const resp = await fetch(`${api}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataParam) }).then(r => r.json());
		const timeRange = (interval !== null)?interval:getActiveTimeRange();
		// Apply multiplier if series is funding rate
		if (Array.isArray(resp)) {
			resp.forEach(series => {
				const name = series?.config?.displayDescription?.toLowerCase?.() || '';
				if (name.includes('funding')) {
					if (Array.isArray(series.graphResponseDTOLst)) {
						series.graphResponseDTOLst.forEach(item => {
							item.y = Number(item.y) * 109500;
						});
					}
				}
			});
		}
		const hasFundingRate = resp.some(series =>
		  series?.config?.displayDescription?.toLowerCase?.().includes('funding')
		);
		
		if (shouldAlign || (resp.length === 2 && hasFundingRate)) {
		  const { data1, data2 } = this.alignMergeDataSets(
		    resp[0].graphResponseDTOLst,
		    resp[1].graphResponseDTOLst
		  );
		  resp[0].graphResponseDTOLst = data1;
		  resp[1].graphResponseDTOLst = data2;
		}
		// apply DB-config from first series
		if (applyDb && resp[0] && resp[0].config) {
			this.applyDbConfig(resp[0].config);
		}
		this.state.functionId = dataParam?.functionId ?? -1;
		this.state.currency=currency;
		this.state.combineTooltips=combineTooltips;
		// map to series data
		const series = resp.map((dto, idx) => {
		const type = seriesTypes[idx] || this.state.chartType;
		const cleanData = dto.graphResponseDTOLst.map(pt => {
		    let yValue = pt.y;
		    if (type === 'candlestick' && typeof yValue === 'string') {
		      try {
		        yValue = JSON.parse(yValue).map(Number);
		      } catch {
		        yValue = [null, null, null, null];
		      }
		    } else {
		      yValue = +yValue;
		    }
		   
		    if(timeRange=='1w')
		  	 pt.x= formatDateShort(pt.x);
		    else if(timeRange=='4h')
		    pt.x= formatDateWithTime(pt.x); 
		    
		    return { x: pt.x, y: yValue };
		  });

 		 const shouldApplyWidth = ['column'].includes(type) && [3, 4, 5, 6, 10, 11, 12, 13, 14, 15].includes(this.state.functionId);
		 const strokeWidth = shouldApplyWidth ? this.getDynamicWidth(cleanData.filter(d => d.y !== null).length) : undefined;

		 return {
		    name: dto.config?.displayDescription, //(applyTitle)?name:dto.config?.displayDescription || `Series${idx + 1}`,
		    type,
		    data: cleanData,
		    ...(strokeWidth !== undefined ? { strokeWidth } : {}) // only apply if valid
		  };
		});
		this.state.isCentred = isCentred;
		this.state.applyTransparency = applyTransparency;
		this.state.disableMarkers = disableMarkers;
		this.state.markerSizeArray = markerSizeArray;
		this.state.seriesColors = seriesColors.length ? seriesColors : [this.state.color];

		this.state.seriesFormats = resp.map((r, idx) => {
			const [digits, isRaw] = getFormat(r.config?.yAxisFormat || '');
			return {
				digits,
				isRaw,
				useShortFormat: useShortFormatList[idx] ?? false
			};
		});

		this.state.seriesTooltipFormats = resp.map((r, idx) => {
			const [digits, isRaw] = getFormat(r.config?.dataFormat || '');
			return {
				digits,
				isRaw,
				useShortFormat: useShortFormatList[idx] ?? false
			};
		});
	
	
	    this.state.title = (applyTitle)?name:this.generateDynamicTitle(series, timeRange, this.chartId, this._timeLabel);
		this.state.useDualYAxis = useDualYAxis;

		this.state.seriesLimits = series.map((s, idx) => {
			const yVals = this._flattenYValuesForRange(s.data, s.type);
			const rawMin = Math.min(...yVals);
			const rawMax = Math.max(...yVals);
			return this._computeYAxisWithMargin(rawMin, rawMax, 5);
		});

		if (!useDualYAxis && this.state.seriesLimits.length > 0) {
			this.state.yAxisLimits = this.state.seriesLimits[0];
		}
		// Apply extra spacing to the right (on first series for now)
		const isCandle = seriesTypes[0] === 'candlestick';
		const padded = await this.processDataAndAddNewEndDateForExtraSpaceInGraph(series[0].data, 10, isCandle);
		series[0].data = padded.response;
		this.state.series = series;

		if (saveHistory) fetch('/history/save', { method: 'POST', body: JSON.stringify({ graphName: name, params: dataParam }) }).catch(console.error);
		this._updateNavButtons();
		await this.render();
		this._disableChartSettings(series.length > 1);
		this._showLoading(false);

	}
	getValueFormat(format) {
		let valueFormat = 3;
		let isPercentage = true;

		if (typeof format === 'string' && format.trim() !== '') {
			const is_percentage = format.includes('%');
			isPercentage = is_percentage;

			const decimalPart = format.split('.')[1];
			if (decimalPart) {
				valueFormat = (isPercentage ? decimalPart.split('%')[0] : decimalPart).length;
			} else {
				valueFormat = 0;
			}
		}

		return [valueFormat, isPercentage];
	}
	formatNumberShort(num) {
		if (num >= 1_000_000_000) {
			return (num / 1_000_000_000).toFixed(2) + 'B';
		} else if (num >= 1_000_000) {
			return (num / 1_000_000).toFixed(2) + 'M';
		} else if (num >= 1_000) {
			return (num / 1_000).toFixed(2) + 'K';
		} else {
			return num.toFixed(2);
		}
	}
	
	updateCandleOptionsVisibility() {
		const isCandleActive = document.getElementById('candlestick-chart1')?.classList.contains('active');
		const timeRange = getActiveTimeRange();

		/*if (isCandleActive)//(timeRange === "4h" && isCandleActive) 
		 {
			$("#dropDownCandleOptionsContainer").removeClass("d-none").addClass("d-flex");
			$("#dropDownCandleOptions").removeClass("d-none").addClass("d-block");
		} else {
			$("#dropDownCandleOptionsContainer").removeClass("d-flex").addClass("d-none");
			$("#dropDownCandleOptions").removeClass("d-block").addClass("d-none");
		}*/
	}
	getDynamicWidth(numColumns) {
	    var totalAvailableWidth = 931;
		const minColumnWidth = 4; // Minimum width to prevent columns from being invisible
	    const maxColumnWidth = 50; // Maximum width to avoid overly thick columns
	
	    // Calculate the dynamic factor as a percentage of totalAvailableWidth per column
	    const dynamicFactor = Math.min(1 / numColumns, 0.1); // Decreases as column count increases, with a cap
	
	    // Compute initial column width
	    let columnWidth = totalAvailableWidth  / numColumns * dynamicFactor;
	
	    // Clamp column width between min and max thresholds
	    columnWidth = Math.max(minColumnWidth, Math.min(columnWidth, maxColumnWidth));

    	return columnWidth*3;
	}
	generateDynamicTitle(series, timeRange, chartId = 'chart1' , enableTimeLabel = true) {
		
		const isCandlestick = series.some(s => s.type === 'candlestick');

		if (!isCandlestick) {
			return series.length > 1 ? series.map(s => s.name).join(' vs ') : series[0]?.name || 'Chart';
		}

		const mainCryptoLabel = $('#dropDownCryptoOptions').jqxDropDownList('getItemByValue', $('#dropDownCryptoOptions').val())?.label || mainLabel;

		const timeLabel = enableTimeLabel?timeRange === "4h" ? "4-Hour"
			: timeRange === "1w" ? "Weekly"
				: "Daily":'';

		const option = candleStickcheckboxOptions.find(
		  c => c.index === ChartManager.instances[chartId]._lastDataParam.subGroupId2
		);
		const label = option?.label || '';
		let secondaryLabel = '';

		const labels = label

		if (labels.length > 0) {
			secondaryLabel = ` vs ${labels}`;
		}

		return `${mainCryptoLabel} ${timeLabel}${secondaryLabel}`;
	}
	alignMergeDataSets(data1, data2) {
		const parseDate = (dateStr) => {
			const [day, month, year] = dateStr.split('-');
			const months = {
				Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
				Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
			};
			return new Date(parseInt(year, 10), months[month], parseInt(day, 10));
		};
	
		const allX = new Set([...data1.map(d => d.x), ...data2.map(d => d.x)]);
		const sortedX = [...allX].sort((a, b) => parseDate(a) - parseDate(b));
	
		const d1Map = new Map(data1.map(item => [item.x, item.y]));
		const d2Map = new Map(data2.map(item => [item.x, item.y]));
	
		const alignedData1 = [], alignedData2 = [];
	
		for (const x of sortedX) {
			const y1 = d1Map.has(x) ? d1Map.get(x) : null;
			const y2 = d2Map.has(x) ? d2Map.get(x) : null;
			if (!(y1 === null && y2 === null)) {
				alignedData1.push({ x, y: y1 });
				alignedData2.push({ x, y: y2 });
			}
		}
	
		return { data1: alignedData1, data2: alignedData2 };
	}
	generateYAxisConfig(index = 0, isCentered,customSettings = {}) {
		const name = this.state.series?.[index]?.name?.toLowerCase() || '';
		const isFundingRate = name.includes('funding');
		const fontSize = this.state.chartSettings?.fontSize || '12px';

		if (isFundingRate) {
			const decimals = 4;
			const lim = this.state.seriesLimits?.[index] || { min: 0, max: 100 };
			const maxValue = Math.max(lim.min, lim.max);

			return {
				seriesName: this.state.series?.[index]?.name || `Series ${index + 1}`,
				min: -maxValue,
				max: maxValue,
				tickAmount: 6,
				labels: {
					style: { fontSize },
					formatter: val => {
						if (val == null || isNaN(val)) return "N/A";

						const formatted = Math.abs(val) < 1
							? (val * 100).toFixed(decimals) + '%'
							: val.toFixed(decimals);
						return formatted;
					}
				},
				axisBorder: {
					show: true,
					color: "#f0ab2e50",
					width: 3,
					offsetX: 0,
					offsetY: 0
				},
				opposite: true,
				...customSettings
			};
		}

		
		let lim = { min: 0, max: 100 };  // default fallback
		const limitsArray = this.state.seriesLimits || [];
		const isDualAxis = this.state.useDualYAxis;
		
		if (!isDualAxis && limitsArray.length > 1 && (index === 0 || index === 1)) {
			// Merge axis ranges from both series
			lim = {
				min: Math.min(limitsArray[0]?.min ?? 0, limitsArray[1]?.min ?? 0),
				max: Math.max(limitsArray[0]?.max ?? 0, limitsArray[1]?.max ?? 0)
			};
		} else if (limitsArray[index]) {
			lim = limitsArray[index];
		}
		 
		const fmt = this.state.seriesFormats?.[index] || { digits: 2, isPercentage: true, useShortFormat: false };
		const seriesType = this.state.seriesTypes?.[index] || 'line';
		const isCandle = seriesType === 'candlestick';
		let minVal=0;
		let maxVal=0;
        if(isCentered){
			const baseMax = Math.max(Math.abs(lim.min), Math.abs(lim.max));  // in case values are negative
			const margin = baseMax * 0.05;
			const paddedMax = baseMax + margin;
			
			 minVal = -paddedMax;
			 maxVal = paddedMax;
		}else
			{
			minVal= lim.min;
			maxVal= lim.max;
			}
		return {
			seriesName: this.state.series?.[index]?.name || `Series ${index + 1}`,
			min: minVal,
			max: maxVal,
			tickAmount: 6,
			labels: {
				style: { fontSize },
				formatter: val => {
					if (val == null || isNaN(val)) return '';
				
					if (fmt.useShortFormat) {
						return this.formatNumberShort(val);
					}
				
					if (isCandle) {
						return Number(val).toFixed(fmt.digits);
					}
				
					// Handle percentage formatting
					const digits = fmt.digits ?? 2;
					const isPercentage = fmt.isPercentage ?? fmt[1]; // fallback to old style
				
					try {
						return isPercentage ? Number(val).toFixed(digits) + '%' : Number(val).toFixed(digits);
					} catch (e) {
						console.warn('Invalid value in formatter:', val, e);
						return '';
					}
				}
			},
			axisBorder: { show: true, color: '#ffffff', width: 3 },
			opposite: index === 1,
			...customSettings
		};
	}
	async toggleCandlestick(btn, id) {
		const isActive = btn.classList.contains('active');
		const selectedGroupId = $('#dropDownCryptoOptions').val();
		$("#dropDownFunctions").jqxDropDownList({ disabled: false });
		
		if (isActive) {
			// ⛔ Deactivate candlestick
			btn.classList.remove('active');
			$("#reset").click();
			renderCheckboxesPerChart(selectedGroupId, id);
			
			const allItems = checkboxOptions.map(opt =>
				`#jqxCheckBox-${selectedGroupId}-${opt.index}-chart-1`
			);
			
			allItems.forEach(id => {
				if (id.includes('-5-') || id.includes('-8-')) {
					$(id).jqxCheckBox('check');
				}
			});
			//drawGraphForChart(chartId);
		
		
			// 👉 Instead of loading old options, trigger updated logic
			const showBtn = document.getElementById(`show-chart-${id}`);
			if (showBtn) {
				showBtn.click();  // Simulates user clicking "Show"
			}
			

		} else {

			// ✅ Activate candlestick
			btn.classList.add('active');
			//renderCheckboxesChart1VolumeFundingRate(selectedGroupId, 1)
			renderCheckboxesPerChart(selectedGroupId, id);
			const newCandlestickParam = {
				fromdate: document.getElementById(`dateFrom-${this.chartId}`)?.value,
				todate: document.getElementById(`dateTo-${this.chartId}`)?.value +' 23:59:59',
				groupId1: this._lastDataParam.groupId1,
				subGroupId1: this._lastDataParam.subGroupId1,
				interval: this._lastDataParam.interval,
				period: this._lastDataParam.period,
				type: this._lastDataParam.type,
				candlestickMode: true
			};

			const timeRange = getActiveTimeRange();
			const api = timeRange === "Daily"
				? "/cryptos/getcandlegraphdata"
				: "/cryptos/getcandlegraphdatainterval";

			await this.loadData({
				service: this._lastService,
				api: api,
				name: this._lastGraphName + ' - Candlestick',
				removeEmpty: this._lastRemoveEmpty,
				saveHistory: false,
				fromOverride: this.state.defaultFromDate,
				toOverride: this.state.defaultToDate,
				applyDb: false,
				seriesTypes: ['candlestick'],
				seriesColors: ['#00ff99'],
				useDualYAxis: false,
				dataParam: newCandlestickParam,
				useShortFormatList: [false],
				interval: timeRange,
				currency:selectedLiveCurrency,
				timeLabel:this._timeLabel
			});

			this._disableChartSettings(true, ['fontOptions']);
		}
		this.updateCandleOptionsVisibility();

	}
	generateDynamicYAnnotations(series = [],functionId) {
		const annotations = { yaxis: [] };

		series.forEach((s, idx) => {
			const name = s?.name?.toLowerCase?.() || '';
			if (name.includes('funding')) {
				annotations.yaxis.push({
					y: 0,
					yAxisIndex: idx,
					strokeDashArray: 0,
					offsetX: 0,
					width: '100%',
					borderColor: '#f0ab2e',
					label: {
						position: 'right',
						offsetX: 70,
						offsetY: 0,
						borderColor: '#FF0000',
						style: {
							color: '#fff',
							background: '#ff000052'
						},
						text: ''
					}
				});
			}
		});
        if ([3, 4, 5, 6, 10, 11, 12, 13, 14, 15].includes(functionId))
        {
			annotations.yaxis.push({
							    y: 0,
							    yAxisIndex: 1,
								strokeDashArray: 0,
								offsetX: 0,
								width: '100%',
								borderColor: '#FF0000',
							    label: {
								    position: 'right',
								    offsetX: 70,
					                offsetY: 0,
							        borderColor: '#FF0000',
							        style: {
							          color: '#fff',
							          background: '#ff000052'
							        },
							        text: ''
							      }
							  });
		}
		return annotations;
	}

	async loadCandlestickData() {
		const btn = document.getElementById(`candlestick-${this.chartId}`);
		if (!btn?.classList.contains('active')) return;

		const from = document.getElementById(`dateFrom-${this.chartId}`)?.value;
		const to = document.getElementById(`dateTo-${this.chartId}`)?.value;
		const interval = getActiveTimeRange();
		const dropdownVal = $('#dropDownCandleOptions').val();
         
		const newCandlestickParam = {
			fromdate: from,
			todate: to+' 23:59:59',
			groupId1: this._lastDataParam?.groupId1,
			subGroupId1: this._lastDataParam?.subGroupId1,
			interval,
			period: 'd',
			type: '3',
			candlestickMode: true
		};
		let seriesTypes = ['candlestick'];
		let seriesColors = ['rgba(240, 171, 46, 0.5)'];
		if (dropdownVal) {
			newCandlestickParam.groupId2 = this._lastDataParam?.groupId1;
			newCandlestickParam.subGroupId2 = dropdownVal;
			newCandlestickParam.removeEmpty1 = false;
			newCandlestickParam.removeEmpty2 = false;
			seriesTypes = ['candlestick', 'column'];
			seriesColors = ['#ffffff', 'rgba(240, 171, 46, 0.5)'];
		}

		const api = interval === "Daily"
			? "/cryptos/getcandlegraphdata"
			: "/cryptos/getcandlegraphdatainterval";

		await this.loadData({
			service: this._lastService,
			api,
			name: this._lastGraphName + ' - Candlestick',
			removeEmpty: false,
			saveHistory: false,
			fromOverride: from,
			toOverride: to,
			applyDb: false,
			seriesTypes: seriesTypes,
			seriesColors: seriesColors,
			useDualYAxis: !!dropdownVal,
			dataParam: newCandlestickParam,
			useShortFormatList: [false, true],
			interval:interval,
			applyTransparency: true,
			currency:selectedLiveCurrency,
			timeLabel:this._timeLabel
		});
		this._disableChartSettings(true, ['fontOptions']);
	}
	getActiveTimeRange() {
		if ($('#DailyData-btn').hasClass('active')) return 'Daily';
		if ($('#4HoursData-btn').hasClass('active')) return '4h';
		if ($('#weeklyData-btn').hasClass('active')) return '1w';
		return null; // if none is active
	}
async loadDataWithOverlays({
	service,
	api,
	name,
	removeEmpty = false,
	saveHistory = false,
	applyDb = true,
	seriesTypes = [],
	seriesColors = [],
	useDualYAxis = false,
	dataParam = null,
	useShortFormatList = [],
	interval = null,
	applyTransparency = false,
	shouldAlign = false,
	disableMarkers = false,
	isCentred = [],
	result = [],
	currency='BTC'
}) {
	this._lastService = service;
	this._api = api;
	this._lastGraphName = name;
	this._lastRemoveEmpty = removeEmpty;
	this._lastSaveHistory = saveHistory;
	this._lastDataParam = dataParam;
	this._useShortFormatList = useShortFormatList;
	this._interval = interval;
	this._applyTransparency = applyTransparency;
	this._shouldAlign = shouldAlign;
	this._disableMarkers = disableMarkers;
	this._isCentred = isCentred;

	this._showLoading(true);
	this.state.currency=currency;

	if (interval !== null) {
		dataParam.interval = interval;
	}
	this._loadMethod = (options) => {
	const from = options.fromOverride || this._formatDate(this.state.defaultFromDate);
	const to = options.toOverride || this._formatDate(new Date());

		drawTechnicalGraph(
			'#chart-chart2',
			options.service,
			options.name,
			options.removeEmpty,
			options.saveHistory,
			from,
			to
		);
	};  
    this._lastOverlayResults = result;
	chart= ChartManager.instances['chart2'].chart;
	
	results=result;
	drawTechnicalGraph('#chart-chart2', service,name,removeEmpty,saveHistory)
	
	this._showLoading(false);
	this._disableChartSettings(true); // disabled chart 2 chart options

}
disableChartGroup(groupId) {
  const group = document.getElementById(`${groupId}-${this.chartId}`);
  if (!group) return;

  group.querySelectorAll('button').forEach(btn => btn.disabled = true);
}
static handleLiveUpdate(currency, message) {
	try {
		const returnedData = JSON.parse(message.body);
		const chartInstances = Object.values(ChartManager.instances);

		const symbol = currency; // assumed BTC, ETH, etc.

		livePriceCache[symbol] = returnedData[0];  // or [1] if it's 4h — pick consistently

		chartInstances.forEach(instance => {
			const freezeEl = document.getElementById(`freezeRange-${instance.chartId}`);
			if (freezeEl && freezeEl.checked) {
				const today = new Date();
				today.setHours(0, 0, 0, 0); // strip time
				
				const inputDate = new Date($(`#dateTo-${instance.chartId}`).val());
				inputDate.setHours(0, 0, 0, 0);
				
				if (inputDate < today) {
								return;
								}
			}
			
			let updatedChart = instance.chart;
            if (instance.chartId === 'chart3') {
				
				const selectedCurrency = dropDownBenchmarkSource.find(c => c.groupId ===  $("#pairDropdown").val()).name.split('/');
				const baseSymbol = selectedCurrency[0];   // e.g. 'BTC'
				const quoteSymbol = selectedCurrency[1]; // e.g. 'ETH'

				if (!livePriceCache[baseSymbol] || !livePriceCache[quoteSymbol]) return;
		
				// Use latest close price from both
				const baseData = livePriceCache[baseSymbol];
				const quoteData = livePriceCache[quoteSymbol];

				const ratio = +baseData.close / +quoteData.close;

				if (!isFinite(ratio)) return;
			
				const formattedDate = formatDateShort(baseData.startTime);  // use base timestamp
			
				const point = { x: formattedDate, y: ratio };
			
				// Update chart3 with new point
				const updatedChart = instance.chart;
				const currentSeries = updatedChart?.w?.config?.series?.[0]?.data || [];
			
				const updatedSeries = currentSeries.filter(p => p.x !== point.x);
				updatedSeries.push(point);
				updatedSeries.sort((a, b) => new Date(a.x) - new Date(b.x));
			
				updatedChart.w.config.series[0].data = updatedSeries;
			
				 const	newYaxis = instance.state.useDualYAxis && updatedChart.w.config.series.length > 1
								? updatedChart.w.config.series.map((_, idx) => instance.generateYAxisConfig(idx, instance._isCentred?.[idx]))
								: [instance.generateYAxisConfig(0, instance._isCentred?.[0])];
							
							newYaxis.forEach((axis, idx) => {
								const seriesData = updatedChart.w.config.series[idx]?.data || [];
								const values = [];
							
								seriesData.forEach(p => {
									if (Array.isArray(p.y)) {
										values.push(...p.y.map(Number));
									} else if (p.y != null) {
										values.push(Number(p.y));
									}
								});
							
								const filtered = values.filter(v => !isNaN(v) && v !== 0);
								if (filtered.length === 0) return;
							
								const min = Math.min(...filtered);
								const max = Math.max(...filtered);
								let margin = (max - min) * 0.05;
								let minValue = 0;
								// 👉 Ensure margin is not negative
								minValue = (min - margin > 0)? min - margin :minValue;
							
								axis.min = minValue;
								axis.max = max + margin;
							});
					
				updatedChart.updateOptions({
							series: updatedChart.w.config.series,
							yaxis: newYaxis
						});
				
				return; // ✅ done for chart3
			}
 
			if (selectedLiveCurrency !== currency) return; 

			updatedChart = instance.chartId=='chart2'?chart:updatedChart;
			
			if (!updatedChart || !updatedChart.w || !updatedChart.w.config || !Array.isArray(updatedChart.w.config.series)) return;

			const timeRange = instance._interval!=null? instance._interval : instance.getActiveTimeRange?.() || 'Daily';
			const isCandlestick = Array.isArray(instance.state.series)
				&& instance.state.series.some(s => s?.type === "candlestick");

			const data = timeRange === '4h' ? returnedData[1] : returnedData[0];
			const formattedDate = timeRange === '4h'
				? formatDateWithTime(data.startTime)
				: formatDateShort(data.startTime);

			// 🔧 Utility: returns updated sorted series with new point
			const buildUpdatedSeriesData = (seriesData, newPoint) => {
				const cleanData = (seriesData || []).filter(p => p.x !== newPoint.x);
				cleanData.push(newPoint);
				return cleanData.sort((a, b) => new Date(a.x) - new Date(b.x));
			};

			if (!isCandlestick) {
				if(instance._interval=='1w') return;
				const chartNum = instance.chartId.replace('chart', '');
				const checkedItems = getCheckedItems(chartNum);

				checkedItems.forEach((idSelector, i) => {
					const checkboxId = idSelector.split('-')[2];
					const meta = checkboxOptions.find(o => o.index == checkboxId);
					if (!meta) return;

					let y = null;
					if (meta.label.includes("OPEN")) y = data.open;
					if (meta.label.includes("HIGH")) y = data.high;
					if (meta.label.includes("LOW")) y = data.low;
					if (meta.label.includes("CLOSE")) y = data.close;
					if (meta.label.includes("VOLUME")) {
						y = instance._interval === '4h' ? data.volume : (data.totalVolume ?? data.volume);
					}				
					if (meta.label.includes("MARKETCAP")) y = data.marketcap;

						if (y != null) {
						const point = { x: formattedDate, y: +y };
				
						// 🔁 Choose correct series index
						const seriesIndex = (instance.chartId === 'chart2')
							? updatedChart.w.config.series.length - 1
							: i;
				
						if (!updatedChart.w.config.series[seriesIndex]) {
							return;
						}
				
						const updatedSeries = buildUpdatedSeriesData(updatedChart.w.config.series[seriesIndex]?.data, point);
						updatedChart.w.config.series[seriesIndex].data = updatedSeries;
				
					}
				});

				// Stretch & Update
				const targetSeriesIndex = instance.chartId === 'chart2'
					? updatedChart.w.config.series.length - 1
					: 0;
				
				const cleanData = updatedChart.w.config.series[targetSeriesIndex]?.data?.filter(p => p.y != null) || [];

				instance.processDataAndAddNewEndDateForExtraSpaceInGraph(cleanData, 10, false)
					.then(({ response }) => {
						updatedChart.w.config.series[targetSeriesIndex].data = response;
						let newYaxis=[];
						if(instance.chartId=='chart2')
						{
							const lastSeries = serieArray[serieArray.length - 1];
							const allValues = (lastSeries?.data || []).flatMap(p =>
							Array.isArray(p.y) ? p.y.map(Number) : p.y != null ? [Number(p.y)] : []
							);

							const filtered = allValues.filter(v => !isNaN(v) && v !== 0);
							if (filtered.length === 0) return;

							// 2. Compute global min/max
							const min = Math.min(...filtered);
							const max = Math.max(...filtered);
							const margin = (max - min) * 0.05;
							const minValue = (min - margin > 0) ? min - margin : 0;
							const maxValue = max + margin;

							// 3. Generate new Y-axis config using global min/max
						   newYaxis = instance.state.useDualYAxis && updatedChart.w.config.series.length > 1
								? updatedChart.w.config.series.map((_, idx) => ({
									...instance.generateYAxisConfig(idx, instance._isCentred?.[idx]),
									min: minValue,
									max: maxValue
								}))
								: [{
									...instance.generateYAxisConfig(0, instance._isCentred?.[0]),
									min: minValue,
									max: maxValue
								}];
						}
						else
						{ newYaxis = instance.state.useDualYAxis && updatedChart.w.config.series.length > 1
								? updatedChart.w.config.series.map((_, idx) => instance.generateYAxisConfig(idx, instance._isCentred?.[idx]))
								: [instance.generateYAxisConfig(0, instance._isCentred?.[0])];

							newYaxis.forEach((axis, idx) => {
								
								const seriesData = updatedChart.w.config.series[idx]?.data || [];
								const values = [];
							// here
								let lim = { min: 0, max: 100 };  // default fallback
									const limitsArray = instance.state.seriesLimits || [];
									const isDualAxis = instance.state.useDualYAxis;
									
									if (!isDualAxis && limitsArray.length > 1 && (idx === 0 || idx === 1)) {
										// Merge axis ranges from both series
										lim = {
											min: Math.min(limitsArray[0]?.min ?? 0, limitsArray[1]?.min ?? 0),
											max: Math.max(limitsArray[0]?.max ?? 0, limitsArray[1]?.max ?? 0)
										};
									} else if (limitsArray[idx]) {
										lim = limitsArray[idx];
									}

								seriesData.forEach(p => {
									if (Array.isArray(p.y)) {
										values.push(...p.y.map(Number));
									} else if (p.y != null) {
										values.push(Number(p.y));
									}
								});
							
								const filtered = values.filter(v => !isNaN(v) && v !== 0);
								if (filtered.length === 0) return;
						
							let minVal=0;
							let maxVal=0;
							 if(instance._isCentred[idx]){
								const baseMax = Math.max(Math.abs(lim.min), Math.abs(lim.max));  // in case values are negative
								const margin = baseMax * 0.05;
								const paddedMax = baseMax + margin;
								
								 minVal = -paddedMax;
								 maxVal = paddedMax;
							}else
								{
								minVal= lim.min;
								maxVal= lim.max;
								}
							
								const min =minVal;// Math.min(...filtered);
								const max =maxVal; //Math.max(...filtered);
								let margin = (max - min) * 0.05;
								let minValue = 0;
								// 👉 Ensure margin is not negative
								minValue = instance._lastDataParam.isFunctionGraph?axis.min:(min - margin > 0)? min - margin :minValue;
							
								axis.min = minVal//minValue;
								axis.max = maxVal//max + margin;
										
							});

						}
						updatedChart.updateOptions({
							series: updatedChart.w.config.series,
							yaxis: newYaxis
						});
					});
					
					
			} else {
				if(instance._interval=='1w') return;
				// Candlestick update
				const candlePoint = {
					x: formattedDate,
					y: [data.open, data.high, data.low, data.close].map(Number)
				};
				let updatedCandleData = buildUpdatedSeriesData(updatedChart.w.config.series[0]?.data, candlePoint);

				// Optional: Volume
				if (updatedChart.w.config.series.length > 1 && $('#dropDownCandleOptions').val() === '5') {
					const yValue=(timeRange!='4h')?+data.totalVolume:+data.volume;
					const volPoint = { x: formattedDate, y: yValue };
					const updatedVolumeData = buildUpdatedSeriesData(updatedChart.w.config.series[1]?.data, volPoint);
					updatedChart.w.config.series[1].data = updatedVolumeData;
				}

				// Stretch only candle data
				const cleanCandle = updatedCandleData.filter(p => p.y?.length === 4);
				instance.processDataAndAddNewEndDateForExtraSpaceInGraph(cleanCandle, 10, true)
					.then(({ response }) => {
						updatedChart.w.config.series[0].data = response;

						const newYaxis = instance.state.useDualYAxis && updatedChart.w.config.series.length > 1
							? updatedChart.w.config.series.map((_, idx) => instance.generateYAxisConfig(idx, instance._isCentred?.[idx]))
							: [instance.generateYAxisConfig(0, instance._isCentred?.[0])];

						updatedChart.updateOptions({
							series: updatedChart.w.config.series,
							yaxis: newYaxis
						});
					});
			}
		});
	} catch (e) {
		console.error("Live update failed:", e);
	}
}

}

