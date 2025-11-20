let isRestoringCharts = false;

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
	async function createChartCard(symbol, totalCharts = 1, interval = "4h", isRestored = false, volumeHidden = false) {
		if (activeCharts.has(symbol) || activeCharts.size >= 4) return;

		const { name, img } = cryptoData[symbol];
		const ids = makeIds(symbol);
		const sKey = symbol.toLowerCase();

		const wrapper = document.createElement("div");
		wrapper.className =
			"crypto-card col-12 mt-0 col-md-6 d-flex align-items-stretch";
		wrapper.dataset.symbol = symbol;

		// =============================================================
		// === HTML Structure ==========================================
		// =============================================================
		wrapper.innerHTML = `
	  <div class="card w-100 overflow-hidden rounded-1 position-relative">
	    <div class="card-header d-flex justify-content-between align-items-center">
	      <div class="d-flex align-items-center">
	        <img src="${img}" alt="${name}" width="24" height="24" class="me-2">
	        <div>${name} (${symbol})</div>
	      </div>
	      <button class="btn-trash btn-sm remove-chart" aria-label="Close">
	      <svg class="icon-small" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>

	      </button>
	    </div>

	    <div class="card-body p-0 d-flex flex-column">
	      <div class="d-flex w-100 h-100">

	        <!-- Left toolbar -->
	        <div class="tool-bar d-flex flex-column align-items-center justify-content-start border-end p-1">
	          <button class="btn btn-sm retr-tool-btn" title="Retracement">
	          <svg class="icon-small"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
				  <rect x="64" y="80" width="384" height="48" rx="24" />
				  <rect x="64" y="176" width="384" height="48" rx="24" />
				  <rect x="64" y="272" width="384" height="48" rx="24" />
				  <rect x="64" y="368" width="384" height="48" rx="24" />
				</svg>
				</button>
				  <!-- Trendline tool -->
				  <button class="btn btn-sm trend-tool-btn" title="Trendline">
				    <svg class="icon-small" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				      <path d="M3 17L17 3M17 3h4v4" />
				      <path d="M3 17h4v4" />
				    </svg>
				  </button>
	        </div>
			
	        <!-- Popup panel (hidden on load) -->
	       <div class="retr-popup pro-panel pt-0 d-none" id="retr-popup-${sKey}">
			  <div class="retr-header">
			    <div class="retr-title d-none">
			      <span>Retracement Tool</span>
			    </div>
			  </div>
			
			  <div class="retr-section retr-form-container">
				  <div class="retr-section-header d-flex justify-content-between align-items-center">
				   	 <button class="btn-close retr-close d-none" title="Close"></button>

				    <span class="text-white fw-semibold">Retracement</span>
				    <button class="icon-btn retr-form-toggle" title="Show/Hide Add Section">
				      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				        <line x1="12" y1="5" x2="12" y2="19"></line>
				        <line x1="5" y1="12" x2="19" y2="12"></line>
				      </svg>
				    </button>

				  </div>
				
				  <div class="retr-form-content ">
				    <div class="input-wrapper mt-2">
				     <div class="input-wrapper">
					  <label class="text-white-50 small">Start Date</label>
					  <input type="date" class="form-control form-control-sm retr-start">
					 </div>
				    </div>
				    <div class="input-wrapper mt-2">
				      <div class="input-wrapper mt-2">
						  <label class="text-white-50 small">End Date</label>
						  <input type="date" class="form-control form-control-sm retr-end">
					  </div>
				    </div>
				
				    <button class="btn btn-success btn-sm w-100 fw-semibold mt-3 glow-btn add-retr-btn">
				      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
				      <span class="ms-1">Add Retracement</span>
				    </button>
				    <button class="btn btn-outline-secondary btn-sm w-100 fw-semibold mt-2 cancel-edit-btn d-none">
					  Cancel Edit
					</button>
				  </div>
				</div>
			
			  <div class="retr-section retr-list-section">
			    <div class="retr-section-header mb-2">
			      <span></span>
			    </div>
			    <div class="retr-list scrollable"></div>
			  </div>
			</div>
<!-- Trendline popup -->
			<div class="trend-popup pro-panel pt-0 d-none" id="trend-popup-${sKey}">
			  <!-- Header -->
			  <div class="retr-header">
			    <span class="text-white fw-semibold"></span>
			  </div>
			
			  <!-- Collapsible container -->
			  <div class="trend-form-container trend-form-container">
			    <div class="retr-section-header d-flex justify-content-between align-items-center">
			      <span class="text-white fw-semibold">Trendline</span>
			      <button class="icon-btn trend-form-toggle" title="Show/Hide Add Section">
			        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			          <line x1="12" y1="5" x2="12" y2="19"></line>
			          <line x1="5" y1="12" x2="19" y2="12"></line>
			        </svg>
			      </button>
			    </div>
			
			    <!-- Collapsible body -->
			    <div class="trend-form-content retr-form-content">
			      <div class="input-wrapper mt-2">
			        <label class="text-white-50 small">Start Date</label>
			        <input type="date" class="form-control form-control-sm trend-start">
			      </div>
			      <div class="input-wrapper mt-2">
			        <label class="text-white-50 small">End Date</label>
			        <input type="date" class="form-control form-control-sm trend-end">
			      </div>
					<div class="input-wrapper mt-2">
					  <label class="text-white-50 small d-block mb-1">Point Type</label>
					  <div class="form-check form-check-inline">
					    <input class="form-check-input trend-point-type" type="radio" name="trendPointType-${sKey}" id="trend-high-${sKey}" value="high" checked>
					    <label class="form-check-label text-white-50 small" for="trend-high-${sKey}">High Points</label>
					  </div>
					  <div class="form-check form-check-inline">
					    <input class="form-check-input trend-point-type" type="radio" name="trendPointType-${sKey}" id="trend-low-${sKey}" value="low">
					    <label class="form-check-label text-white-50 small" for="trend-low-${sKey}">Low Points</label>
					  </div>
					</div>
			      <button class="btn btn-primary btn-sm w-100 fw-semibold mt-3 add-trend-btn">
			        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
			          <line x1="12" y1="5" x2="12" y2="19"/>
			          <line x1="5" y1="12" x2="19" y2="12"/>
			        </svg>
			        <span class="ms-1">Add Trendline</span>
			      </button>
			      <!-- Add Channel Section -->
					<div class="input-wrapper mt-3 border-top pt-2">
					  <label class="text-white fw-semibold">Add Channel</label>
					  <div class="input-wrapper mt-2">
					    <label class="text-white-50 small">Start Date</label>
					    <input type="date" class="form-control form-control-sm chan-start">
					  </div>
					  <div class="input-wrapper mt-2">
					    <label class="text-white-50 small d-block mb-1">Point Type</label>
					    <div class="form-check form-check-inline">
					      <input class="form-check-input chan-point-type" type="radio" name="chanPointType-${sKey}" id="chan-high-${sKey}" value="high" checked>
					      <label class="form-check-label text-white-50 small" for="chan-high-${sKey}">High</label>
					    </div>
					    <div class="form-check form-check-inline">
					      <input class="form-check-input chan-point-type" type="radio" name="chanPointType-${sKey}" id="chan-low-${sKey}" value="low">
					      <label class="form-check-label text-white-50 small" for="chan-low-${sKey}">Low</label>
					    </div>
					  </div>
					  <button class="btn btn-info btn-sm w-100 fw-semibold mt-2 add-channel-btn">
					    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
					      <line x1="4" y1="12" x2="20" y2="12"/>
					      <line x1="12" y1="4" x2="12" y2="20"/>
					    </svg>
					    <span class="ms-1">Add Channel</span>
					  </button>
					</div>
			      <button class="btn btn-outline-secondary btn-sm w-100 fw-semibold mt-2 cancel-trend-edit-btn d-none">
					  Cancel Edit
				  </button>
			    </div>
			    <!-- Trendline list -->
				<div class="trend-list-section mt-2">
				  <div class="trend-section-header mb-2">
				    <span class="text-white fw-semibold">Saved Trendlines</span>
				  </div>
				  <div class="trend-list scrollable"></div>
				</div>
			  </div>
<!-- end-->
			</div>
	        <!-- Chart Panel -->
	        <div class="chart-panel flex-grow-1 position-relative">
	          <div class="chart-container2 h-100 w-100 pt-2 pb-2 position-relative">
	            <div class="btn-group pt-2 ps-2" role="group">
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

	            <button 
	              id="toggle-volume-${sKey}" 
	              class="btn btn-outline-info btn-sm position-absolute" 
	              style="top:5px; right:90px; z-index:10;">
	              Hide Volume
	            </button>

	            <button 
	              id="go-latest-${sKey}" 
	              class="btn btn-outline-success btn-sm position-absolute" 
	              style="top:5px; right:10px; z-index:10;">
	              Latest
	            </button>

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
				<div id="rsi-${sKey}" style="height:160px; margin-top:5px;"></div>

	          </div>
	        </div>
	      </div>
	    </div>
	  </div>
	`;

		// =============================================================
		// === Append and Layout =======================================
		// =============================================================
		chartContainer.appendChild(wrapper);
		activeCharts.add(symbol);
		layoutCharts();
		updateDropdownState();

		// =============================================================
		// === Initialize ChartKit =====================================
		// =============================================================
		const src = new BinanceOHLCSource({ symbol: `${symbol}USDT`, interval });
		const inst = ChartKit.create({
			key: sKey,
			containerId: ids.main,
			spinnerId: ids.spinner,
			totalCharts: totalCharts,
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
					dataSource: src,
				},
			],
		});
		// ========================================
		//   Create RSI CHART
		// ========================================
/*		const rsiChart = ChartKit.create({
		    key: sKey + "-rsi",
		    containerId: `rsi-${sKey}`,
		    spinnerId: ids.spinner,
		    totalCharts: totalCharts,
		    fixedHeight: 100,     // <<< THIS MAKES THE HEIGHT ALWAYS 100px
		    series: [
		          {
		            name: `${symbol} RSI`,
		            type: "line",
		            color: "#00E396",
		             pureLine: true,       // <--- VERY IMPORTANT
		            dataSource: new RSIDataSource(src),
		        }
		    ],
		});*/
		
/*const debugChart = ChartKit.create({
    key: "rsi-debug",
    containerId:  `rsi-${sKey}`,
    debugStandard: true,	    
    series: [
		          {
		            type: "line",}]
});
*/
const rsiChart =  ChartKit.create({
    key: "rsi-debug",
    containerId:  `rsi-${sKey}`,
    debugStandard: true,
    series: [{ type: "line",
          dataSource: new RSIDataSource(src),
 }]
});
		// =============================================================
		// === Timeframe Buttons =======================================
		// =============================================================
		wrapper.querySelectorAll(".btn-timeframe").forEach((btn) => {
			btn.addEventListener("click", async () => {
				const tf = btn.dataset.tf;
				const chart = ChartKit.get(sKey);
				if (!chart) return;

				await chart.changeTimeframe(tf);
				setActiveTimeframe(wrapper, tf);

				try {
					const retracements = chart._retracements
						? Object.values(chart._retracements)
						: [];
					await saveChartConfig(chart.key.toUpperCase(), {
						interval: tf,
						volumeHidden: chart._volumeHidden ?? false,
						retracements,
					});
				} catch (err) {
					console.error(`[${sKey}] failed to save timeframe`, err);
				}
			});
		});

		// =============================================================
		// === Volume Toggle ===========================================
		// =============================================================
		const toggleBtn = wrapper.querySelector(`#toggle-volume-${sKey}`);
		toggleBtn.addEventListener("click", async () => {
			const chart = ChartKit.get(sKey);
			if (!chart) return;
			const newHidden = !chart._volumeHidden;
			chart.setVolumeHidden(newHidden);
			toggleBtn.textContent = newHidden ? "Show Volume" : "Hide Volume";

			const retracements = chart._retracements
				? Object.values(chart._retracements)
				: [];
			await saveChartConfig(chart.key.toUpperCase(), {
				interval: chart.selectedInterval,
				volumeHidden: newHidden,
				retracements,
			});
		});

		// =============================================================
		// === Retracement Popup =======================================
		// =============================================================
		const toolBtn = wrapper.querySelector(".retr-tool-btn");
		const popup = wrapper.querySelector(`#retr-popup-${sKey}`);
		const closeBtn = popup.querySelector(".retr-close");
		const addBtn = popup.querySelector(".add-retr-btn");
		const startIn = popup.querySelector(".retr-start");
		const endIn = popup.querySelector(".retr-end");
		const retrList = popup.querySelector(".retr-list");
		
		// --- show a real placeholder for date inputs ---
		function enhanceDateInput(input, placeholder = "Choose date") {
			// Start as text so placeholder is visible
			input.type = "text";
			input.placeholder = placeholder;

			const toDate = () => {
				if (input.type !== "date") input.type = "date";
				// open native picker when supported
				if (input.showPicker) {
					try { input.showPicker(); } catch { }
				}
			};
			const toTextIfEmpty = () => {
				if (!input.value) {
					input.type = "text";
					input.placeholder = placeholder;
				}
			};

			input.addEventListener("focus", toDate);
			input.addEventListener("click", toDate);   // helpful on Safari
			input.addEventListener("blur", toTextIfEmpty);
		}
		enhanceDateInput(startIn);
		enhanceDateInput(endIn);

		/**
		 * Generic function to initialize collapsible form panels
		 * @param {HTMLElement} parentEl - The popup container element (retr-popup or trend-popup)
		 * @param {string} prefix - 'retr' or 'trend'
		 */
		function initCollapsiblePanel(parentEl, prefix) {
			if (!parentEl) return;

			const toggleBtn = parentEl.querySelector(`.${prefix}-form-toggle`);
			const contentEl = parentEl.querySelector(`.${prefix}-form-content`);
			if (!toggleBtn || !contentEl) return;

			toggleBtn.addEventListener("click", () => {
				const isOpen = contentEl.classList.toggle("open");
				toggleBtn.innerHTML = isOpen
					? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		           <line x1="5" y1="12" x2="19" y2="12"/>
		         </svg>`
					: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		           <line x1="12" y1="5" x2="12" y2="19"/>
		           <line x1="5" y1="12" x2="19" y2="12"/>
		         </svg>`;
			});
		}

		toolBtn.addEventListener("click", () => popup.classList.toggle("d-none"));
		closeBtn.addEventListener("click", () => popup.classList.add("d-none"));

		addBtn.addEventListener("click", async () => {
			const chart = ChartKit.get(sKey);
			if (!chart) return;

			const startDate = startIn.value;
			const endDate = endIn.value;
			if (!startDate || !endDate) return alert("Select both dates.");

			const candleSeries = chart.seriesDefs.find(s => s.type === "candlestick");
			if (!candleSeries?.data.length) return;

			const candles = candleSeries.data;
			const toDateStr = ts => new Date(ts).toISOString().split("T")[0];

			// Collect all candles for a specific date
			const getCandlesForDate = d =>
				candles.filter(c => toDateStr(c.x) === d);

			const startCandles = getCandlesForDate(startDate);
			const endCandles = getCandlesForDate(endDate);

			if (!startCandles.length || !endCandles.length) {
				return alert("No candles found for one of the selected dates.");
			}

			// Compute highs and lows for both periods
			const startHigh = Math.max(...startCandles.map(c => c.y[1]));
			const startLow = Math.min(...startCandles.map(c => c.y[2]));
			const endHigh = Math.max(...endCandles.map(c => c.y[1]));
			const endLow = Math.min(...endCandles.map(c => c.y[2]));

			// Average time for placement
			const avgTime = arr => new Date(arr.reduce((a, c) => a + c.x, 0) / arr.length);
			const startTime = avgTime(startCandles);
			const endTime = avgTime(endCandles);

			// ======================================================
			// 🔍 Determine direction dynamically
			// ======================================================
			// Measure which move is dominant (high diff vs low diff)
			const upMove = endHigh - startLow;
			const downMove = startHigh - endLow;

			const isBullish = upMove > downMove; // true = Low→High, false = High→Low

			const startPrice = isBullish ? startLow : startHigh;
			const endPrice = isBullish ? endHigh : endLow;

			// ======================================================
			// === EDIT MODE ========================================
			// ======================================================
			const isEditMode = popup.dataset.mode === "edit";
			const editingId = popup.dataset.editId;

			if (isEditMode && editingId) {
				const oldRetr = chart._retracements?.[editingId];
				const hidden = oldRetr?.hidden ?? false;
				const fibos = oldRetr?.fibos ? { ...oldRetr.fibos } : undefined;

				delete chart._retracements[editingId];

				chart.addRetracement({
					startPrice,
					endPrice,
					startDate: startTime.toISOString(),
					endDate: endTime.toISOString(),
					retracementId: editingId,
					hidden,
					fibos,
				});

				chart.rebuildVisibleAnnotations();
				chart._emitRetrChanged();

				const card = retrList.querySelector(`.retr-card[data-retr-id="${editingId}"]`);
				if (card) {
					card.querySelector(".retr-dates").innerHTML = `
        <div>Start: ${startTime.toLocaleDateString()} (${startPrice.toFixed(2)})</div>
        <div>End: ${endTime.toLocaleDateString()} (${endPrice.toFixed(2)})</div>
      `;
					card.classList.remove("editing");
				}

				popup.dataset.mode = "";
				popup.dataset.editId = "";
				addBtn.textContent = "Add Retracement";
				addBtn.classList.remove("btn-warning");

				const cancelBtn = popup.querySelector(".cancel-edit-btn");
				cancelBtn.classList.add("d-none");

				startIn.value = endIn.value = "";
				if (!startIn.value) startIn.type = "text";
				if (!endIn.value) endIn.type = "text";

				const remaining = Object.values(chart._retracements ?? {});
				await saveChartConfig(chart.key.toUpperCase(), {
					interval: chart.selectedInterval,
					volumeHidden: chart._volumeHidden ?? false,
					retracements: remaining.length ? remaining : [],
				});
				return;
			}

			// ======================================================
			// === ADD MODE =========================================
			// ======================================================
			const retrId = `retr-${Date.now()}`;
			chart.addRetracement({
				startPrice,
				endPrice,
				startDate: startTime.toISOString(),
				endDate: endTime.toISOString(),
				retracementId: retrId,
			});
			// Force default fibo visibility (only Fibonacci shown)
			const retr = chart._retracements[retrId];
			if (retr) {
				retr.fibos = {
					"10%": false,
					"25%": false,
					"33%": false,
					"38%": true,
					"50%": false,
					"61.8%": true,
					"66%": false,
					"75%": false,
					"78.6%": true,
				};
				chart.rebuildVisibleAnnotations();
				chart._emitRetrChanged();
			}
			// Pseudo candle objects for UI
			const startObj = { x: startTime.getTime(), y: [0, startHigh, startLow, startPrice] };
			const endObj = { x: endTime.getTime(), y: [0, endHigh, endLow, endPrice] };

			addRetrCard(retrId, startObj, endObj);

			startIn.value = endIn.value = "";
			if (!startIn.value) startIn.type = "text";
			if (!endIn.value) endIn.type = "text";

			await saveChartConfig(chart.key.toUpperCase(), {
				interval: chart.selectedInterval,
				volumeHidden: chart._volumeHidden ?? false,
				retracements: Object.values(chart._retracements ?? {}),
			});
		});

		// Collapsible for Retracement
		initCollapsiblePanel(popup, "retr");

		function addRetrCard(id, start, end) {
			const chart = ChartKit.get(sKey);
			const div = document.createElement("div");
			div.className =
				"retr-card mb-2 p-2 rounded border border-secondary bg-dark bg-opacity-75";
			div.dataset.retrId = id;

			const retr = chart._retracements[id];
			if (!retr) return;

			// 🧮 Initialize fibo levels (keep old + add true Fibonacci)
			if (!retr.fibos)
				retr.fibos = {
					"10%": false,
					"25%": false,
					"33%": false,
					"38%": true,   // Fibonacci
					"50%": true,   // Fibonacci
					"61.8%": true, // Fibonacci
					"66%": false,
					"75%": false,
					"78.6%": true, // Fibonacci
				};

			const fiboLevels = [
				"10%",
				"25%",
				"33%",
				"38%",
				"50%",
				"61.8%",
				"66%",
				"75%",
				"78.6%",
			];
			const trueFibo = ["38%", "61.8%", "78.6%"];

			// 🧱 Card Layout
			div.innerHTML = `
    <div class="retr-card-header d-flex justify-content-between align-items-center mb-1">
      <div class="d-flex align-items-center">
        <button class="icon-btn retr-toggle me-1" title="Hide/Show Retracement">
          <svg class="icon-eye" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button class="icon-btn retr-edit me-1" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
          </svg>
        </button>
        <button class="icon-btn retr-del me-1" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
      <button class="icon-btn retr-collapse-toggle" title="Collapse/Expand">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>

    <div class="text-white-50 small mb-1 retr-dates">
      <div>Start: ${new Date(start.x).toLocaleDateString()} (${start.y[3].toFixed(2)})</div>
      <div>End: ${new Date(end.x).toLocaleDateString()} (${end.y[3].toFixed(2)})</div>
    </div>

    <div class="retr-fibos collapsible">
      ${fiboLevels
					.map((p) => {
						const isFibo = trueFibo.includes(p);
						const label = isFibo
							? `${p} <span class="text-warning fw-semibold">(Fibo)</span>`
							: p;

						return `
          <div class="fibo-row d-flex justify-content-between align-items-center border-bottom border-dark py-1">
            <span class="text-white-50">${label}</span>
            <button class="fibo-toggle" data-level="${p}" title="Toggle Fibo ${p}">
              ${retr.fibos[p]
								? `<svg class="icon-eye" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>`
								: `<svg class="icon-eye-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20
                               c-7 0-11-8-11-8a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24
                               A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8
                               a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/>
                    </svg>`
							}
            </button>
          </div>`;
					})
					.join("")}
    </div>
  `;

			// 🗑 Delete handler
			div.querySelector(".retr-del").addEventListener("click", async () => {
				delete chart._retracements[id];
				div.remove();
				chart.rebuildVisibleAnnotations();
				chart._emitRetrChanged();
				const remaining = Object.values(chart._retracements ?? {});
				await saveChartConfig(chart.key.toUpperCase(), {
					interval: chart.selectedInterval,
					volumeHidden: chart._volumeHidden ?? false,
					retracements: remaining.length ? remaining : [],
				});
			});

			// ✏️ Edit handler
			div.querySelector(".retr-edit").addEventListener("click", () => {
				const retr = chart?._retracements?.[id];
				if (!retr) return;

				// Expand the add form automatically
				const formContent = popup.querySelector(".retr-form-content");
				const formToggleBtn = popup.querySelector(".retr-form-toggle");
				if (!formContent.classList.contains("open")) {
					formContent.classList.add("open");
					formToggleBtn.innerHTML = `
			      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			        <line x1="5" y1="12" x2="19" y2="12"/>
			      </svg>`;
				}

				// Focus + scroll into view
				formContent.scrollIntoView({ behavior: "smooth", block: "center" });

				// Fill date fields without triggering the date picker
				const startInput = popup.querySelector(".retr-start");
				const endInput = popup.querySelector(".retr-end");
				startInput.value = retr.params.startDate.split("T")[0];
				endInput.value = retr.params.endDate.split("T")[0];

				// Set the input type to 'text' to avoid opening the date picker
				startInput.type = endInput.type = "text"; // Keeps it as a simple text field

				// Prevent the input fields from being focused automatically
				startInput.blur(); // Removes focus from the start date input field
				endInput.blur(); // Removes focus from the end date input field

				// Set edit mode
				popup.dataset.mode = "edit";
				popup.dataset.editId = id;

				const addBtn = popup.querySelector(".add-retr-btn");
				addBtn.textContent = "Update Retracement";
				addBtn.classList.add("btn-warning");

				retrList.querySelectorAll(".retr-card").forEach((c) => c.classList.remove("editing"));
				div.classList.add("editing");

				// Show Cancel button when in edit mode
				const cancelBtn = popup.querySelector(".cancel-edit-btn");
				cancelBtn.classList.remove("d-none");

				popup.classList.remove("d-none");
			});

			// Cancel Edit logic
			const cancelBtn = popup.querySelector(".cancel-edit-btn");
			cancelBtn.addEventListener("click", () => {
				// Clear the edit mode and reset values
				popup.dataset.mode = "";
				popup.dataset.editId = "";

				// Clear the date inputs
				const startInput = popup.querySelector(".retr-start");
				const endInput = popup.querySelector(".retr-end");
				startInput.value = "";
				endInput.value = "";

				// Change the button back to "Add Retracement"
				const addBtn = popup.querySelector(".add-retr-btn");
				addBtn.textContent = "Add Retracement";
				addBtn.classList.remove("btn-warning");

				// Hide the Cancel button
				cancelBtn.classList.add("d-none");

				// Remove editing highlights
				const formContainer = popup.querySelector(".retr-form-container");
				formContainer.classList.remove("editing");

				// Optionally, focus on the "Add Retracement" section if needed
				const addRetracementSection = popup.querySelector(".retr-form-container");
				addRetracementSection.scrollIntoView({ behavior: "smooth", block: "center" });
			});


			// 👁 Hide/Show entire retracement
			const retrToggleBtn = div.querySelector(".retr-toggle");
			retrToggleBtn.addEventListener("click", async (e) => {
				const retr = chart._retracements[id];
				retr.hidden = !retr.hidden;
				const btn = e.currentTarget;
				if (retr.hidden) {
					btn.innerHTML = `<svg class="icon-eye-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8
                 a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24
                 A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8
                 a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/>
      </svg>`;
					div.classList.add("is-dimmed");
				} else {
					btn.innerHTML = `<svg class="icon-eye" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`;
					div.classList.remove("is-dimmed");
				}
				chart.rebuildVisibleAnnotations();
				chart._emitRetrChanged();
				const remaining = Object.values(chart._retracements ?? {});
				await saveChartConfig(chart.key.toUpperCase(), {
					interval: chart.selectedInterval,
					volumeHidden: chart._volumeHidden ?? false,
					retracements: remaining.length ? remaining : [],
				});
			});

			// 🔽 Collapse fibos
			const collapseBtn = div.querySelector(".retr-collapse-toggle");
			const fiboContainer = div.querySelector(".retr-fibos");
			collapseBtn.addEventListener("click", () => {
				const isOpen = fiboContainer.classList.toggle("open");
				collapseBtn.querySelector("svg").style.transform = isOpen ? "rotate(0deg)" : "rotate(-90deg)";
			});

			// 🎯 Toggle per-fibo level
			div.querySelectorAll(".fibo-toggle").forEach((btn) => {
				btn.addEventListener("click", async (e) => {
					const level = e.currentTarget.dataset.level;
					retr.fibos[level] = !retr.fibos[level];
					e.currentTarget.innerHTML = retr.fibos[level]
						? `<svg class="icon-eye" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
             <circle cx="12" cy="12" r="3"/>
           </svg>`
						: `<svg class="icon-eye-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20
                      c-7 0-11-8-11-8a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24
                      A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8
                      a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/>
           </svg>`;
					chart.rebuildVisibleAnnotations();
					chart._emitRetrChanged();
					const remaining = Object.values(chart._retracements ?? {});
					await saveChartConfig(chart.key.toUpperCase(), {
						interval: chart.selectedInterval,
						volumeHidden: chart._volumeHidden ?? false,
						retracements: remaining.length ? remaining : [],
					});
				});
			});

			retrList.prepend(div);
		}



		inst.addRetrCard = addRetrCard;

		// === Trendline Popup Logic ===========================================
		const trendBtn = wrapper.querySelector(".trend-tool-btn");
		const trendPopup = wrapper.querySelector(`#trend-popup-${sKey}`);
		const addTrendBtn = trendPopup.querySelector(".add-trend-btn");
		const trendStart = trendPopup.querySelector(".trend-start");
		const trendEnd = trendPopup.querySelector(".trend-end");
		const trendList = trendPopup.querySelector(".trend-list");
		const pointType = wrapper.querySelector(`input[name="trendPointType-${sKey}"]:checked`)?.value || "high";
        const cancelTrendEditBtn = trendPopup.querySelector(".cancel-trend-edit-btn");
		
		const addChannelBtn = trendPopup.querySelector(".add-channel-btn");
		const chanStart = trendPopup.querySelector(".chan-start");
		// Collapsible for Trendline
		initCollapsiblePanel(trendPopup, "trend");


		enhanceDateInput(trendStart, "Choose start date");
		enhanceDateInput(trendEnd, "Choose end date");
		
	    // add this line too:
		enhanceDateInput(chanStart,  "Choose start date");

		trendBtn.addEventListener("click", () => trendPopup.classList.toggle("d-none"));

   	 	addTrendBtn.addEventListener("click", async () => {
			  const chart = ChartKit.get(sKey);
			  if (!chart) return;
			
			  const startDate = trendStart.value;
			  const endDate = trendEnd.value;
			  if (!startDate || !endDate) return alert("Select both dates.");
			
			  // ✅ Get point type *inside the click* (real-time)
			  const pointType = wrapper.querySelector(`input[name="trendPointType-${sKey}"]:checked`)?.value || "high";
			
			  const candleSeries = chart.seriesDefs.find(s => s.type === "candlestick");
			  if (!candleSeries?.data.length) return;
			
			  const candles = candleSeries.data;
			  const toDateStr = ts => new Date(ts).toISOString().split("T")[0];
			  const getCandlesForDate = d => candles.filter(c => toDateStr(c.x) === d);
			
			  const startCandles = getCandlesForDate(startDate);
			  const endCandles = getCandlesForDate(endDate);
			  if (!startCandles.length || !endCandles.length) return alert("No data for one of the dates.");
			
			  // --- Extract highs & lows per date ---
			  const highOf = arr => Math.max(...arr.map(c => c.y[1]));
			  const lowOf  = arr => Math.min(...arr.map(c => c.y[2]));
			  const closeOf = arr => arr[arr.length - 1]?.y[3] ?? 0;
			
			  const startHigh = highOf(startCandles);
			  const startLow  = lowOf(startCandles);
			  const endHigh = highOf(endCandles);
			  const endLow  = lowOf(endCandles);
			
			  // --- Pick based on selected point type ---
			  const useHigh = pointType === "high";
			  const startPrice = useHigh ? startHigh : startLow;
			  const endPrice   = useHigh ? endHigh   : endLow;
			
			  const findCandleByPrice = (arr, price, useHigh) =>
			    arr.find(c => useHigh ? c.y[1] === price : c.y[2] === price) || arr[0];
			
			  const startCandle = findCandleByPrice(startCandles, startPrice, useHigh);
			  const endCandle   = findCandleByPrice(endCandles, endPrice, useHigh);
			
			  const d1 = new Date(startCandle.x);
			  const d2 = new Date(endCandle.x);
			
			  const msPerDay = 1000 * 60 * 60 * 24;
			  const daysBetween = Math.max(1e-9, (d2 - d1) / msPerDay);
			  const m = (endPrice - startPrice) / daysBetween;
			
			  const now = new Date();
			  const daysToNow = (now - d2) / msPerDay;
			  const yNow = endPrice + m * daysToNow;
			
			 
			// Check if we're editing an existing trendline
			  const editId = trendPopup.dataset.editId || null;

			const trendId = chart.addTrendline({
				  startDate: d1,
				  endDate: d2,
				  y1: startPrice,
				  y2: endPrice,
				  yNow,
				  slope: m,
				  pointType,
				  trendlineId: editId || undefined,
				});
				
				addTrendCard(trendId, {
				  startDate: d1,
				  endDate: d2,
				  y1: startPrice,
				  y2: endPrice,
				  hidden: false,
				  pointType
				});
				
				// 👇 This is the "current" trendline for channels
				trendPopup.dataset.baseTrendId = trendId;
				
			 // trendPopup.classList.add("d-none");
				// --- Reset form fields ---
				trendStart.value = "";
				trendEnd.value = "";
				  // Reset button label and style
			    addTrendBtn.textContent = "Add Trendline";
			    addTrendBtn.classList.remove("btn-warning");
				
				 cancelTrendEditBtn.classList.add("d-none");
				  
				wrapper.querySelectorAll(`input[name="trendPointType-${sKey}"]`).forEach(r => {
				  r.checked = r.value === "high"; // reset to default "High"
				});
				
			  await saveChartConfig(chart.key.toUpperCase(), {
			    interval: chart.selectedInterval,
			    volumeHidden: chart._volumeHidden ?? false,
			    trendlines: chart.getTrendlinesArray(),
			  });
			  delete trendPopup.dataset.editTrendId;

			});
			addChannelBtn.addEventListener("click", async () => {
			  const chart = ChartKit.get(sKey);
			  if (!chart) return;
			
			  const startDate = chanStart.value;
			  if (!startDate) return alert("Please select a channel start date.");
			
			  // 1️⃣ Determine which trendline to use
			  let baseTrendId = trendPopup.dataset.baseTrendId || trendPopup.dataset.editId || null;
			  const hasTrendlines = chart._trendlines && Object.keys(chart._trendlines).length > 0;
			
			  // 2️⃣ If no trendline exists yet, auto-create one from the Trend form
			  if (!baseTrendId) {
			    if (!hasTrendlines) {
			      const tStart = trendStart.value;
			      const tEnd = trendEnd.value;
			      if (!tStart || !tEnd) {
			        return alert("No trendline exists. Please fill Trendline Start/End dates first.");
			      }
			
			      // Reuse the same logic as in Add Trendline
			      const pointType = wrapper.querySelector(`input[name="trendPointType-${sKey}"]:checked`)?.value || "high";
			
			      const candleSeries = chart.seriesDefs.find(s => s.type === "candlestick");
			      if (!candleSeries?.data.length) return alert("No data to build a trendline.");
			
			      const candles = candleSeries.data;
			      const toDateStr = ts => new Date(ts).toISOString().split("T")[0];
			      const getCandlesForDate = d => candles.filter(c => toDateStr(c.x) === d);
			
			      const startCandles = getCandlesForDate(tStart);
			      const endCandles = getCandlesForDate(tEnd);
			      if (!startCandles.length || !endCandles.length) return alert("No candles for trendline dates.");
			
			      const highOf = arr => Math.max(...arr.map(c => c.y[1]));
			      const lowOf  = arr => Math.min(...arr.map(c => c.y[2]));
			
			      const startHigh = highOf(startCandles);
			      const startLow  = lowOf(startCandles);
			      const endHigh = highOf(endCandles);
			      const endLow  = lowOf(endCandles);
			
			      const useHigh = pointType === "high";
			      const startPrice = useHigh ? startHigh : startLow;
			      const endPrice   = useHigh ? endHigh   : endLow;
			
			      const findCandleByPrice = (arr, price, useHigh) =>
			        arr.find(c => useHigh ? c.y[1] === price : c.y[2] === price) || arr[0];
			
			      const startCandle = findCandleByPrice(startCandles, startPrice, useHigh);
			      const endCandle   = findCandleByPrice(endCandles, endPrice, useHigh);
			
			      const d1 = new Date(startCandle.x);
			      const d2 = new Date(endCandle.x);
			
			      const msPerDay = 1000 * 60 * 60 * 24;
			      const daysBetween = Math.max(1e-9, (d2 - d1) / msPerDay);
			      const m = (endPrice - startPrice) / daysBetween;
			
			      const now = new Date();
			      const daysToNow = (now - d2) / msPerDay;
			      const yNow = endPrice + m * daysToNow;
			
			      baseTrendId = chart.addTrendline({
			        startDate: d1,
			        endDate: d2,
			        y1: startPrice,
			        y2: endPrice,
			        yNow,
			        slope: m,
			        pointType,
			      });
			
			      addTrendCard(baseTrendId, {
			        startDate: d1,
			        endDate: d2,
			        y1: startPrice,
			        y2: endPrice,
			        hidden: false,
			        pointType
			      });
			
			      trendPopup.dataset.baseTrendId = baseTrendId;
			    } else {
			      // Fallback: use last created trendline
			      baseTrendId = Object.keys(chart._trendlines).slice(-1)[0];
			      trendPopup.dataset.baseTrendId = baseTrendId;
			    }
			  }
			
			  const pointType = wrapper.querySelector(`input[name="chanPointType-${sKey}"]:checked`)?.value || "high";
			
			  const chanId = chart.addChannelToTrendline(baseTrendId, {
			    startDate,
			    pointType,
			  });
			
			  if (!chanId) return alert("Channel creation failed.");
			
			  chanStart.value = "";
			
			  // Re-render trend card to show new channel
			  const trendCard = trendList.querySelector(`.trend-card[data-trend-id="${baseTrendId}"]`);
			  if (trendCard) {
			    const t = chart._trendlines[baseTrendId];
			    addTrendCard(baseTrendId, {
			      startDate: t.params.startDate,
			      endDate: t.params.endDate,
			      y1: t.params.y1,
			      y2: t.params.y2,
			      hidden: t.hidden ?? false,
			      pointType: t.params.pointType,
			    });
			  }
			
			  await saveChartConfig(chart.key.toUpperCase(), {
			    trendlines: chart.getTrendlinesArray(),
			  });
			});


			cancelTrendEditBtn.addEventListener("click", () => {
				  // Reset edit mode
				  delete trendPopup.dataset.editId;
				
				  // Reset button label and style
				  addTrendBtn.textContent = "Add Trendline";
				  addTrendBtn.classList.remove("btn-warning");
				
				  // Clear form fields
				  trendStart.value = "";
				  trendEnd.value = "";
				  wrapper.querySelectorAll(`input[name="trendPointType-${sKey}"]`).forEach(r => {
				    r.checked = r.value === "high";
				  });
				
				  // Hide cancel button
				  cancelTrendEditBtn.classList.add("d-none");
				});

		function addTrendCard(id, params) {
		  const chart = ChartKit.get(sKey);
		  const { startDate, endDate, y1, y2, hidden , pointType} = params;
		
		  // ✅ Check if a card for this trendline already exists
		  let div = trendList.querySelector(`.trend-card[data-trend-id="${id}"]`);
		  const isUpdate = !!div;
		
		  if (!isUpdate) {
		    // If not existing, create it
		    div = document.createElement("div");
		    div.className = "trend-card mb-2 p-2 rounded border border-secondary bg-dark bg-opacity-75";
		    div.dataset.trendId = id;
		    trendList.prepend(div);
		  }
		
		  // Update or create inner HTML
		  div.innerHTML = `
		    <div class="d-flex justify-content-between align-items-center mb-1">
		      <div class="d-flex align-items-center">
		        <button class="icon-btn trend-toggle me-1" title="Hide/Show Trendline">
		          ${hidden
		            ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		                 <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20
		                 c-7 0-11-8-11-8a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24
		                 A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8
		                 a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/></svg>`
		            : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		                 <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
		                 <circle cx="12" cy="12" r="3"/></svg>`}
		        </button>
		        <button class="icon-btn trend-edit me-1" title="Edit">
		          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
		          </svg>
		        </button>
		        <button class="icon-btn trend-del" title="Delete">
		          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4
		            a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
		        </button>
		      </div>
		      <span class="text-white-50 small">
		        ${new Date(startDate).toLocaleDateString()} → ${new Date(endDate).toLocaleDateString()}
		      </span>
		    </div>
		    <div class="text-white-50 small">
		      <div>Start: ${Number(y1).toFixed(2)}</div>
		      <div>End: ${Number(y2).toFixed(2)}</div>
		    </div>
		     <div class="channel-list mt-2"></div>

		  `;
		// 🔁 Render existing channels for this trendline
const tObj = chart._trendlines?.[id];
const channelListEl = div.querySelector(".channel-list");
channelListEl.innerHTML = "";

if (tObj?.channels?.length) {
  tObj.channels.forEach(ch => {
    const row = document.createElement("div");
    row.className = "d-flex justify-content-between align-items-center text-white-50 small channel-row py-1";
    row.dataset.channelId = ch.channelId;

    const priceLabel = ch.refPrice != null ? Number(ch.refPrice).toFixed(2) : "-";

    row.innerHTML = `
      <span>Channel (${ch.pointType || "-"}) @ ${priceLabel}</span>
      <button class="icon-btn chan-del" title="Delete Channel">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4
                   a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    `;

    // 🗑 Delete channel
    row.querySelector(".chan-del").addEventListener("click", async () => {
      chart.removeChannel(id, ch.channelId);
      row.remove();
      await saveChartConfig(chart.key.toUpperCase(), {
        trendlines: chart.getTrendlinesArray(),
      });
    });

    channelListEl.appendChild(row);
  });
}
		  // 🧠 Only reattach event listeners if this was newly created
		  if (!isUpdate) {
		    attachTrendCardHandlers(div, id, chart); // helper function defined below
		  }
		}
		function attachTrendCardHandlers(div, id, chart) {
  // 🗑 Delete
  div.querySelector(".trend-del").addEventListener("click", async () => {
    if (!confirm("Delete this trendline?")) return;
    if (chart._trendlines[id]) delete chart._trendlines[id];
    chart.rebuildVisibleAnnotations?.();
    chart._emitTrendChanged?.();
    div.remove();
    await saveChartConfig(chart.key.toUpperCase(), {
      trendlines: chart.getTrendlinesArray(),
    });
  });

	// 👁 Hide / Show trendline
	div.querySelector(".trend-toggle").addEventListener("click", async (e) => {
	  const chart = ChartKit.get(sKey);
	  if (!chart || !chart._trendlines?.[id]) return;
	
	  const t = chart._trendlines[id];
	  t.hidden = !t.hidden; // flip visibility
	
	  // Update chart
	  chart.rebuildVisibleAnnotations?.();
	  chart._emitTrendChanged?.();
	
	  // Update icon + card dim
	  const btn = e.currentTarget;
	  if (t.hidden) {
	    div.classList.add("is-dimmed");
	    btn.innerHTML = `
	      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
	           stroke="currentColor" stroke-width="2">
	        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20
	                 c-7 0-11-8-11-8a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24
	                 A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8
	                 a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/>
	      </svg>`;
	    btn.title = "Show Trendline";
	  } else {
	    div.classList.remove("is-dimmed");
	    btn.innerHTML = `
	      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
	           stroke="currentColor" stroke-width="2">
	        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
	        <circle cx="12" cy="12" r="3"/>
	      </svg>`;
	    btn.title = "Hide Trendline";
	  }
	
	  // Persist change
	  await saveChartConfig(chart.key.toUpperCase(), {
	    trendlines: chart.getTrendlinesArray(),
	  });
	});


  // ✏️ Edit
  div.querySelector(".trend-edit").addEventListener("click", () => {
    const wrapper = document.querySelector(`[data-symbol="${chart.key.toUpperCase()}"]`);
    const popup = wrapper?.querySelector(`#trend-popup-${chart.key}`);
    const addBtn = popup.querySelector(".add-trend-btn");
    const trendStart = popup.querySelector(".trend-start");
    const trendEnd = popup.querySelector(".trend-end");

	const formContent = trendPopup.querySelector(".trend-form-content");
 	 const toggleBtn = trendPopup.querySelector(".trend-form-toggle");
	  if (formContent && !formContent.classList.contains("open")) {
	    formContent.classList.add("open");
	    toggleBtn.innerHTML = `
	      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
	        <line x1="5" y1="12" x2="19" y2="12"/>
	      </svg>`;
	  }
	// === Set High/Low radio based on stored pointType ===
	const radios = trendPopup.querySelectorAll(`input[name="trendPointType-${sKey}"]`);
	const t = chart._trendlines[id];
	const currentType = t?.params?.pointType || params.pointType || "high";
	
	radios.forEach(radio => {
	  radio.checked = (radio.value === currentType);
	});
	
    trendStart.value = new Date(chart._trendlines[id].params.startDate).toISOString().split("T")[0];
    trendEnd.value = new Date(chart._trendlines[id].params.endDate).toISOString().split("T")[0];
    popup.dataset.editId = id;
	// Channel operations should target this trendline
	trendPopup.dataset.baseTrendId = id;
	
    addBtn.textContent = "Update Trendline";
    addBtn.classList.add("btn-warning");
    popup.classList.remove("d-none");
    
  // ✅ Show Cancel button
  cancelTrendEditBtn.classList.remove("d-none");
  });
}
		inst.addTrendCard = addTrendCard; 
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
			await fetch(`/api/user/chart-settings/${symbol}`, { method: "DELETE" });
		});

		if (!isRestored)
			await saveChartConfig(symbol, interval, false, []);
		return inst;
	}
	async function loadUserCharts() {
		try {
			isRestoringCharts = true; // 🧩 prevent saves during load

			const res = await fetch("/api/user/chart-settings");
			const { charts } = await res.json();
			if (!charts?.length) return;

			for (const savedChart of charts) {
				const symbol = savedChart.symbol;
				const interval = savedChart.interval || "4h";
				const sKey = symbol.toLowerCase();

				const inst = await createChartCard(symbol, charts.length, interval, true);

				inst.onReady = async () => {
					// === Restore Volume Hidden State ===
					if (savedChart.volumeHidden) {
						const btn = document.getElementById(`toggle-volume-${sKey}`);
						if (btn) btn.textContent = "Show Volume";
						inst.setVolumeHidden(true);
					}

					// === Restore Retracements ===
					if (savedChart.retracements) {
						let retrList;
						try {
							retrList = JSON.parse(savedChart.retracements);
						} catch {
							retrList = [];
						}

						const wrapper = document.querySelector(`[data-symbol="${symbol}"]`);
						const popup = wrapper?.querySelector(`#retr-popup-${sKey}`);
						const retrContainer = popup?.querySelector(".retr-list");

						retrList.forEach((r) => {
							const retrData = r.params ? r.params : r;
							const startPrice = parseFloat(retrData.startPrice);
							const endPrice = parseFloat(retrData.endPrice);
							const startDate = retrData.startDate;
							const endDate = retrData.endDate;

							if (!startDate || !endDate || isNaN(startPrice) || isNaN(endPrice)) {
								console.warn(`[${symbol}] invalid retr skipped`, retrData);
								return;
							}

							const retrId = r.retracementId || `retr-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
							const defaultFibos = {
								"10%": false,
								"25%": false,
								"33%": false,
								"38%": true,
								"50%": true,
								"61.8%": true,
								"66%": false,
								"75%": false,
								"78.6%": true,
							};

							inst.addRetracement({
								startPrice,
								endPrice,
								startDate,
								endDate,
								retracementId: retrId,
								hidden: !!r.hidden,
								fibos: r.fibos || defaultFibos,
							});

							if (typeof inst.addRetrCard === "function") {
								const start = { x: new Date(startDate).getTime(), y: [0, 0, 0, startPrice] };
								const end = { x: new Date(endDate).getTime(), y: [0, 0, 0, endPrice] };
								inst.addRetrCard(retrId, start, end);

								// If you want to sync hidden UI state:
								const wrapper = document.querySelector(`[data-symbol="${symbol}"]`);
								const retrCard = wrapper?.querySelector(`.retr-card[data-retr-id="${retrId}"]`);
								if (retrCard && r.hidden) {
									const toggleBtn = retrCard.querySelector(".retr-toggle");
									retrCard.classList.add("is-dimmed");
									toggleBtn.innerHTML = `
                  <svg class="icon-eye-off" width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20
                             c-7 0-11-8-11-8a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24
                             A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8
                             a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/>
                  </svg>`;
									toggleBtn.title = "Show Retracement";
								}
							}
						});
					}
					// === Restore Trendlines ===
					if (savedChart.trendlines) {
					  let trendList;
					  try {
					    trendList = JSON.parse(savedChart.trendlines);
					  } catch {
					    trendList = [];
					  }
					
					  trendList.forEach(t => {
					    const params = t.params ?? t;
					    const id = params.trendlineId || `trend-${Date.now()}-${Math.random() * 9999 | 0}`;
					    // 🧩 Default pointType to 'high' if missing (for backward compatibility)
    					const pointType = params.pointType || "high";
					    // 1️⃣ Add to chart
					    inst.addTrendline({
					      startDate: params.startDate,
					      endDate: params.endDate,
					      y1: params.y1,
					      y2: params.y2,
					      yNow: params.yNow,
					      slope: params.slope,
					      pointType,
					      hidden: params.hidden ?? false,
					      trendlineId: id,
					    });
					    
					if (t.channels && Array.isArray(t.channels)) {
					  t.channels.forEach(ch => {
					    inst.addChannelToTrendline(id, ch);
					  });
					}
					    // 2️⃣ Add to list UI (if method available)
					    if (typeof inst.addTrendCard === "function") {
					      inst.addTrendCard(id, {
					        startDate: params.startDate,
					        endDate: params.endDate,
					        y1: params.y1,
					        y2: params.y2,
					        pointType,
					        hidden: params.hidden ?? false,
					      });
					    }
					  });
					}
					const chart = ChartKit.get("xrp").chart;  // if your ChartKit stores the ApexCharts instance under `.chart`

				   isRestoringCharts = false;

				};

			 inst.onRetracementsChanged = async (chartInst) => {
		        if (isRestoringCharts) return; // ⛔ skip during restore
		        const retracements = Object.values(chartInst._retracements ?? {});
		        await saveChartConfig(chartInst.key.toUpperCase(), {
		          interval: chartInst.selectedInterval,
		          volumeHidden: chartInst._volumeHidden ?? false,
		          retracements,
		        });
		      };
		
		      inst.onTrendlinesChanged = async (chartInst) => {
		        if (isRestoringCharts) return; // ⛔ skip during restore
		        const trendlines = chartInst.getTrendlinesArray();
		        await saveChartConfig(chartInst.key.toUpperCase(), {
		          interval: chartInst.selectedInterval,
		          volumeHidden: chartInst._volumeHidden ?? false,
		          trendlines,
		        });
		      };
			}
		} catch (err) {
			console.error("Failed to load user charts:", err);
		} 
		finally {
		    // ✅ only release save protection AFTER everything is loaded
		    setTimeout(() => {
				
		      isRestoringCharts = false;
		      
		    }, 2000);
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
	  // Get chart instance if it exists
	  if (isRestoringCharts) return; // ⛔ block saving during restore

	  const chart = ChartKit.get?.(symbol.toLowerCase()) || null;
	
	  // Build a complete snapshot (if chart found)
	  const fullState = chart
	    ? {
	        interval: chart.selectedInterval,
	        volumeHidden: chart._volumeHidden ?? false,
	        retracements: chart.getRetracementsArray?.() ?? [],
	        trendlines: chart.getTrendlinesArray?.() ?? [],
	      }
	    : {};
	
	  // Merge full state + updates (updates override)
	  const payload = { symbol, ...fullState, ...updates };
	
	  // Convert arrays to JSON
	  for (const key of ["retracements", "trendlines"]) {
	    if (Array.isArray(payload[key])) {
	      payload[key] = JSON.stringify(payload[key]);
	    } else if (payload[key] === undefined) {
	      delete payload[key];
	    }
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
		handle: ".card-header",
		onEnd: async () => {
			const newOrder = Array.from(chartContainer.children).map((el, index) => ({
				symbol: el.dataset.symbol,
				orderIndex: index
			}));

			await fetch("/api/user/chart-settings/order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newOrder)
			});
		},
	});

});
