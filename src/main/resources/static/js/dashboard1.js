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
	async function createChartCard(symbol, interval = "4h", isRestored = false , volumeHidden = false) {
		if (activeCharts.has(symbol) || activeCharts.size >= 4) return;

		const { name, img } = cryptoData[symbol];
		const ids = makeIds(symbol);
		const sKey = symbol.toLowerCase();

		const wrapper = document.createElement("div");
		wrapper.className =
			"crypto-card col-12 mt-0 col-md-6 d-flex align-items-stretch";
		wrapper.dataset.symbol = symbol;

		wrapper.innerHTML = `
			  <div class="card w-100 overflow-hidden rounded-1">
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
			    <div class="card-body position-relative p-0">
			      <div class="chart-container2 h-100 w-100 pt-2 pb-2">
			      <div>
			        <div class="btn-group pt-2" role="group">
			          ${["1m", "5m", "15m", "1h", "4h", "1d", "1w"]
							.map(
								(tf) => `
			              <button 
			                type="button"
			                class="fs-8 pb-0 pt-0 btn btn-no-line btn-timeframe ${tf === interval ? "active" : ""
									}"
			                data-tf="${tf}"
			                data-symbol="${symbol}"
			              >${tf}</button>`
							)
							.join("")}
			        </div>
			
			        <!-- 👇 ADD THIS BUTTON -->
			        <button 
			         id="go-latest-${symbol.toLowerCase()}"
			          class="btn btn-outline-success btn-sm position-absolute" 
			          style="top:5px; right:10px; z-index:10;"
			        >
			          Latest
			        </button>
			        <button 
					  id="toggle-volume-${symbol.toLowerCase()}"
					  class="btn btn-outline-info btn-sm position-absolute" 
					  style="top:5px; right:90px; z-index:10;"
					>Hide Volume</button>
			        </div>
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
			`;

		chartContainer.appendChild(wrapper);
		activeCharts.add(symbol);
		layoutCharts();
		updateDropdownState(); // disable dropdown item

		// Initialize ChartKit
		const src = new BinanceOHLCSource({
			symbol: `${symbol}USDT`,
			interval: interval,
		});
		
		const seriesArray = [];
		seriesArray.push({
					name: `${name} (${symbol})`,
					type: "candlestick",
					color: "#00E396",
					dataSource: src,
					ohlcPill: ids.ohlc,
				})
		const inst = ChartKit.create({
			key: sKey,
			containerId: ids.main,
			spinnerId: ids.spinner,
			series: [
				{
					name: `${name} (${symbol})`,
					type: "candlestick",
					color: "#00E396",
					dataSource: src,
					ohlcPill: ids.ohlc,
				},
				{
					name: `${name} Volume`,
					type: "bar",
					color: "#8884d8",
					dataSource: src, // same data source
				},
			],
		});

		// Timeframe buttons
		wrapper.querySelectorAll(".btn-timeframe").forEach((btn) => {
			btn.addEventListener("click", async () => {
				const tf = btn.dataset.tf;
				const sym = btn.dataset.symbol.toLowerCase();
				const chart = ChartKit.get(sym);
				if (!chart) return;

				// Change timeframe visually
				await chart.changeTimeframe(tf);
				setActiveTimeframe(wrapper, tf);

				// 🧩 Save new state to backend
				try {
					const volumeHidden = chart._volumeHidden ?? false;
					const retracements = chart._retracements ? Object.values(chart._retracements) : [];
					const jsonData = {interval:tf , 
					volumeHidden:volumeHidden,
					retracements:retracements,
					}
					await saveChartConfig(sym.toUpperCase(), jsonData);

					console.log(`[${sym}] timeframe updated to ${tf}`);
				} catch (err) {
					console.error(`[${sym}] failed to save timeframe`, err);
				}
			});
		});


		// Volume toggle button
		const toggleBtn = document.getElementById(`toggle-volume-${symbol.toLowerCase()}`);
		toggleBtn.addEventListener("click", async () => {
			   const chart = ChartKit.get(sKey);
				if (!chart) return;
			
				const newHidden = !chart._volumeHidden;
				chart.setVolumeHidden(newHidden);
			
				toggleBtn.textContent = newHidden ? "Show Volume" : "Hide Volume";
			    const retracements = chart._retracements ? Object.values(chart._retracements) : [];

				const jsonData = {interval:chart.selectedInterval , 
					volumeHidden: newHidden,
					retracements:retracements,
					}
				await saveChartConfig(chart.key.toUpperCase(),jsonData);

			
		});

		// Remove chart
		wrapper.querySelector(".remove-chart").addEventListener("click", async () => {
			// Ask confirmation (optional)
			if (!confirm(`Remove ${symbol.toUpperCase()} chart?`)) return;

			// 1️⃣ Remove DOM
			wrapper.remove();

			// 2️⃣ Destroy ApexChart instance
			const chart = ChartKit.get(sKey);
			if (chart) {
				chart.chart?.destroy?.();
				ChartKit.registry.delete(sKey);
			}

			// 3️⃣ Update UI state
			activeCharts.delete(symbol);
			layoutCharts();
			updateDropdownState();
			ChartKit.resizeAll(); // 🔁 resize all remaining charts

			// 4️⃣ Tell backend to delete the saved chart
			try {
				const response = await fetch(`/api/user/chart-settings/${symbol.toUpperCase()}`, {
					method: "DELETE",
				});

				if (response.ok) {
					console.log(`[${symbol}] chart deleted successfully`);
				} else {
					console.warn(`[${symbol}] failed to delete chart config`, await response.text());
				}
			} catch (err) {
				console.error(`[${symbol}] error deleting chart config`, err);
			}
		});


		if (!isRestored) {
			await saveChartConfig(symbol, interval, false, []);
			console.log(`[${symbol}] chart saved to DB`);
		}
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
