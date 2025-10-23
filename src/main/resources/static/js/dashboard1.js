document.addEventListener("DOMContentLoaded", function() {
	const chartContainer = document.getElementById("chartsContainer");
	const dropdownMenu = document.getElementById("cryptoDropdown");
	const dropdownItems = dropdownMenu.querySelectorAll(".dropdown-item");

	// ---------------------------------------------------------------
	// === Crypto icon/name map ======================================
	// ---------------------------------------------------------------
	const cryptoData = {
		BTC: { name: "Bitcoin", img: "/css/image/Bitcoin.svg" },
		ETH: { name: "Ethereum", img: "/css/image/Ethereum.svg" },
		XRP: { name: "Ripple", img: "/css/image/XRP.svg" },
		SOL: { name: "Solana", img: "/css/image/Solana.svg" },
		SHIB: { name: "Shiba Inu", img: "/css/image/Shiba.svg" },
		BNB: { name: "Binance Coin", img: "/css/image/Binance.svg" },
	};

	// Track displayed charts (max 4)
	const activeCharts = new Set();

	// ---------------------------------------------------------------
	// === Helpers ===================================================
	// ---------------------------------------------------------------
	function makeIds(symbol) {
		const s = symbol.toLowerCase();
		return {
			main: `main-chart-${s}`,
			spinner: `loading-spinner-${s}`,
			ohlc: {
				pillId: `ohlc-info-${s}`,
				date: `date-${s}`,
				open: `open-${s}`,
				high: `high-${s}`,
				low: `low-${s}`,
				close: `close-${s}`,
			},
		};
	}

	// Highlight active timeframe button
	function setActiveTimeframe(wrapper, activeTf) {
		wrapper.querySelectorAll(".btn-timeframe").forEach((btn) => {
			const tf = btn.dataset.tf;
			btn.classList.toggle("active", tf === activeTf);
		});
	}

	// Layout logic (1–4 charts grid)
	function layoutCharts() {
		const cards = chartContainer.querySelectorAll(".crypto-card");
		const count = cards.length;
		cards.forEach((c) =>
			c.classList.remove("col-12", "col-md-6", "col-lg-6", "col-xl-6")
		);

		if (count === 1) cards.forEach((c) => c.classList.add("col-12"));
		else if (count === 2) cards.forEach((c) => c.classList.add("col-md-6"));
		else if (count === 3) {
			cards[0].classList.add("col-md-6");
			cards[1].classList.add("col-md-6");
			cards[2].classList.add("col-12");
		} else if (count >= 4) cards.forEach((c) => c.classList.add("col-md-6"));
	}

	// Disable dropdown items that already have active charts
	function updateDropdownState() {
		dropdownItems.forEach((item) => {
			const text = item.textContent.trim();
			const match = text.match(/\((.*?)\)/);
			if (!match) return;
			const symbol = match[1];
			if (activeCharts.has(symbol)) {
				item.classList.add("disabled");
				item.style.pointerEvents = "none";
				item.style.opacity = "0.5";
			} else {
				item.classList.remove("disabled");
				item.style.pointerEvents = "";
				item.style.opacity = "";
			}
		});
	}

	// ---------------------------------------------------------------
	// === Create chart card =========================================
	// ---------------------------------------------------------------
	// ---------------------------------------------------------------
// === Create chart card =========================================
// ---------------------------------------------------------------
async function createChartCard(symbol, interval = "4h", isRestored = false, volumeHidden = false) {
	if (activeCharts.has(symbol) || activeCharts.size >= 4) return;

	const { name, img } = cryptoData[symbol];
	const ids = makeIds(symbol);
	const sKey = symbol.toLowerCase();

	const wrapper = document.createElement("div");
	wrapper.className = "crypto-card col-12 mt-0 col-md-6 d-flex align-items-stretch";
	wrapper.dataset.symbol = symbol;

	// =============================================================
	// === HTML ====================================================
	// =============================================================
	wrapper.innerHTML = `
	  <div class="card w-100 overflow-hidden rounded-1 position-relative">
	    <div class="card-header d-flex justify-content-between align-items-center">
	      <div class="d-flex align-items-center">
	        <img src="${img}" alt="${name}" width="24" height="24" class="me-2">
	        <div>${name} (${symbol})</div>
	      </div>
	      <button class="btn-trash btn-sm remove-chart" aria-label="Close">
	        <svg class="icon-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
	          <path d="M5.755 20.283 4 8h16l-1.755 12.283A2 2 0 0 1 16.265 22h-8.53a2 2 0 0 1-1.98-1.717zM21 4h-5V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2z"/>
	        </svg>
	      </button>
	    </div>

	    <div class="card-body p-0 d-flex flex-column">
	      <div class="d-flex w-100 h-100">

	        <!-- 📊 Left Tools bar -->
	        <div class="tool-bar d-flex flex-column align-items-center justify-content-start p-1">
	          <button class="btn btn-sm btn-dark retr-tool-btn" title="Fibonacci Retracement">📈</button>
	        </div>

	        <!-- 📋 Popup panel (hidden on load) -->
	        <div class="retr-popup d-none" id="retr-popup-${sKey}">
	          <div class="p-2">
	            <div class="d-flex justify-content-between align-items-center mb-2">
	              <h6 class="text-warning fw-bold m-0">Retracement</h6>
	              <button class="btn btn-sm btn-outline-light retr-close">✖</button>
	            </div>
	            <label class="form-label text-white-50 mb-1">Start Date</label>
	            <input type="date" class="form-control form-control-sm retr-start mb-1">
	            <label class="form-label text-white-50 mb-1">End Date</label>
	            <input type="date" class="form-control form-control-sm retr-end mb-2">
	            <button class="btn btn-sm btn-success w-100 add-retr-btn mb-2">Add Retracement</button>
	            <div class="retr-list"></div>
	          </div>
	        </div>

	        <!-- 📈 Chart Area -->
	        <div class="chart-panel flex-grow-1 position-relative">
	          <div class="chart-container2 h-100 w-100 pt-2 pb-2 position-relative">
	            <div class="btn-group pt-2 ps-5" role="group">
	              ${["1m","5m","15m","1h","4h","1d","1w"].map(tf => `
	                <button type="button"
	                  class="fs-8 pb-0 pt-0 btn btn-no-line btn-timeframe ${tf === interval ? "active" : ""}"
	                  data-tf="${tf}" data-symbol="${symbol}">${tf}</button>`).join("")}
	            </div>

	            <button id="toggle-volume-${sKey}" class="btn btn-outline-info btn-sm position-absolute" style="top:5px; right:90px; z-index:10;">Hide Volume</button>
	            <button id="go-latest-${sKey}" class="btn btn-outline-success btn-sm position-absolute" style="top:5px; right:10px; z-index:10;">Latest</button>

	            <hr class="w-100">
	            <div id="${ids.ohlc.pillId}" class="w-100 fs-8 d-none">
	              <div class="d-flex px-3">
	                <div class="col"><strong></strong> <span id="${ids.ohlc.date}"></span></div>
	                <div class="col"><strong>Open:</strong> <span id="${ids.ohlc.open}"></span></div>
	                <div class="col"><strong>High:</strong> <span id="${ids.ohlc.high}"></span></div>
	                <div class="col"><strong>Low:</strong> <span id="${ids.ohlc.low}"></span></div>
	                <div class="col"><strong>Close:</strong> <span id="${ids.ohlc.close}"></span></div>
	              </div>
	            </div>
	            <div id="${ids.spinner}" class="spinner-style" role="status">
	              <button class="btn btn-primary" type="button" disabled>
	                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
	                Loading...
	              </button>
	            </div>
	            <div id="${ids.main}" style="height:350px;"></div>
	          </div>
	        </div>
	      </div>
	    </div>
	  </div>
	`;

	// =============================================================
	// === Init ChartKit ===========================================
	// =============================================================
	chartContainer.appendChild(wrapper);
	activeCharts.add(symbol);
	layoutCharts();
	updateDropdownState();

	const src = new BinanceOHLCSource({ symbol: `${symbol}USDT`, interval });
	const inst = ChartKit.create({
		key: sKey,
		containerId: ids.main,
		spinnerId: ids.spinner,
		series: [
			{ name: `${name} (${symbol})`, type: "candlestick", color: "#00E396", dataSource: src, ohlcPill: ids.ohlc },
			{ name: `${name} Volume`, type: "bar", color: "#8884d8", dataSource: src }
		]
	});

	// =============================================================
	// === Popup Logic =============================================
	// =============================================================
	const toolBtn   = wrapper.querySelector(".retr-tool-btn");
	const popup     = wrapper.querySelector(`#retr-popup-${sKey}`);
	const closeBtn  = popup.querySelector(".retr-close");
	const addBtn    = popup.querySelector(".add-retr-btn");
	const startIn   = popup.querySelector(".retr-start");
	const endIn     = popup.querySelector(".retr-end");
	const retrList  = popup.querySelector(".retr-list");

	toolBtn.addEventListener("click", () => popup.classList.toggle("d-none"));
	closeBtn.addEventListener("click", () => popup.classList.add("d-none"));

	addBtn.addEventListener("click", async () => {
		const chart = ChartKit.get(sKey);
		if (!chart) return;
		const startDate = startIn.value, endDate = endIn.value;
		if (!startDate || !endDate) return alert("Select both dates.");

		const candleSeries = chart.seriesDefs.find(s => s.type === "candlestick");
		if (!candleSeries?.data.length) return;
		const findClosest = t => {
			const ms = new Date(t).getTime();
			return candleSeries.data.reduce((a,b) => Math.abs(a.x - ms) < Math.abs(b.x - ms) ? a : b);
		};
		const start = findClosest(startDate), end = findClosest(endDate);
		const retrId = `retr-${Date.now()}`;
		chart.addRetracement({ startPrice:start.y[3], endPrice:end.y[3], startDate, endDate, retracementId:retrId });
		addRetrCard(retrId, start, end);
		startIn.value = endIn.value = "";
		await saveChartConfig(chart.key.toUpperCase(), {
			interval: chart.selectedInterval,
			volumeHidden: chart._volumeHidden ?? false,
			retracements: Object.values(chart._retracements ?? {})
		});
	});

	function addRetrCard(id, start, end) {
		const chart = ChartKit.get(sKey);
		const div = document.createElement("div");
		div.className = "retr-card mb-2 p-2 rounded border border-secondary bg-dark bg-opacity-75";
		div.innerHTML = `
		  <div class="d-flex justify-content-between align-items-center mb-1">
		    <span class="text-warning fw-bold">Retracement</span>
		    <button class="btn btn-sm btn-outline-danger retr-del">🗑</button>
		  </div>
		  <div class="text-white-50 small mb-1">
		    <div>Start: ${new Date(start.x).toLocaleDateString()} (${start.y[3].toFixed(2)})</div>
		    <div>End: ${new Date(end.x).toLocaleDateString()} (${end.y[3].toFixed(2)})</div>
		  </div>
		  <div class="retr-fibos">
		    ${["10%","25%","33%","38%","50%","62%","66%","75%"].map(p => `
		      <div class="d-flex justify-content-between align-items-center border-bottom border-dark py-1">
		        <span class="text-white-50">${p}</span>
		        <button class="btn btn-sm btn-outline-light fibo-toggle" data-level="${p}">👁</button>
		      </div>`).join("")}
		  </div>`;
		div.querySelector(".retr-del").addEventListener("click", () => {
			delete chart._retracements[id];
			div.remove();
			chart.chart.updateOptions({ annotations:{ yaxis:Object.values(chart._retracements)
				.filter(r=>!r.hidden)
				.flatMap(r=>r.annotations.yaxis) }});
		});
		retrList.prepend(div);
	}

	// =============================================================
	// === Remove Chart ============================================
	// =============================================================
	wrapper.querySelector(".remove-chart").addEventListener("click", async () => {
		if (!confirm(`Remove ${symbol}?`)) return;
		wrapper.remove();
		const chart = ChartKit.get(sKey);
		if (chart) {
			chart.chart?.destroy?.();
			ChartKit.registry.delete(sKey);
		}
		activeCharts.delete(symbol);
		layoutCharts();
		updateDropdownState();
		ChartKit.resizeAll();
		await fetch(`/api/user/chart-settings/${symbol}`, { method:"DELETE" });
	});

	if (!isRestored) await saveChartConfig(symbol, interval, false, []);
	return inst;
}

	async function loadUserCharts() {
		const res = await fetch("/api/user/chart-settings");
		const { charts } = await res.json();

		for (const chart of charts) {
			const inst = await createChartCard(chart.symbol, chart.interval, true); // <-- restored → don't save

			// 👇 attach before chart finishes initializing
			inst.onReady = () => {
				if (chart.volumeHidden) {
					const btn = document.getElementById(`toggle-volume-${chart.symbol.toLowerCase()}`);
					if (btn) btn.textContent = "Show Volume";
					inst.setVolumeHidden(true);
				}
			
				if (chart.retracements) {
					const retrList = JSON.parse(chart.retracements || "[]");
					retrList.forEach(r => inst.addRetracement(r));
				}
			};
		}
	}
	// ---------------------------------------------------------------
	// === Dropdown handler ==========================================
	// ---------------------------------------------------------------
	dropdownItems.forEach((item) => {
		item.addEventListener("click", function(e) {
			e.preventDefault();
			const text = this.textContent.trim();
			const symbolMatch = text.match(/\((.*?)\)/);
			if (!symbolMatch) return;
			const symbol = symbolMatch[1];
			createChartCard(symbol);
		});
	});

	// ---------------------------------------------------------------
	// === Default chart =============================================
	// ---------------------------------------------------------------
	//createChartCard("BTC");
	async function saveChartConfig(symbol, updates = {}) {
		const payload = { symbol, ...updates };

		// If retracements is provided as an array, serialize it
		if (Array.isArray(payload.retracements)) {
			payload.retracements = JSON.stringify(payload.retracements);
		}

		try {
			await fetch("/api/user/chart-settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
		} catch (err) {
			console.error("Failed to save chart config:", err);
		}
	}

	loadUserCharts();
	// ---------------------------------------------------------------
	// === Enable drag-and-drop chart sorting ========================
	// ---------------------------------------------------------------
	const sortable = new Sortable(chartContainer, {
		animation: 150,
		handle: ".card-header", // user can grab header area
		ghostClass: "chart-ghost",
		chosenClass: "chart-chosen",
		dragClass: "chart-dragging",
		onEnd: () => {
			// optional: update internal order or save to localStorage
			console.log("Chart order changed!");
		},
	});

});
