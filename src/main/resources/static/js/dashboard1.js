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
	        
	     <svg class="icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		  <!-- Lid line -->
		  <path d="M4 7H20" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		  <!-- Body -->
		  <path d="M6 10L7.70141 19.3578C7.87432 20.3088 8.70258 21 9.66915 21H14.3308C15.2974 21 16.1257 20.3087 16.2986 19.3578L18 10" 
		        stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
		  <!-- Handle -->
		  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" 
		        stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
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
	        </div>

	        <!-- Popup panel (hidden on load) -->
	       <div class="retr-popup pro-panel d-none" id="retr-popup-${sKey}">
			  <div class="retr-header">
			    <div class="retr-title">
			      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
			      <span>Retracement Tool</span>
			    </div>
			    <button class="btn-close retr-close" title="Close"></button>
			  </div>
			
			  <div class="retr-section retr-form-container">
				  <div class="retr-section-header d-flex justify-content-between align-items-center">
				    <span class="text-white fw-semibold">Add Retracement</span>
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
				  </div>
				</div>
			
			  <div class="retr-section retr-list-section">
			    <div class="retr-section-header mb-2">
			      <span>Saved Retracements</span>
			    </div>
			    <div class="retr-list scrollable"></div>
			  </div>
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
		      try { input.showPicker(); } catch {}
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

		toolBtn.addEventListener("click", () => popup.classList.toggle("d-none"));
		closeBtn.addEventListener("click", () => popup.classList.add("d-none"));

		addBtn.addEventListener("click", async () => {
			const chart = ChartKit.get(sKey);
			if (!chart) return;

			const startDate = startIn.value;
			const endDate = endIn.value;
			if (!startDate || !endDate) return alert("Select both dates.");

			const candleSeries = chart.seriesDefs.find((s) => s.type === "candlestick");
			if (!candleSeries?.data.length) return;

			const findClosest = (t) => {
				const ms = new Date(t).getTime();
				return candleSeries.data.reduce((a, b) =>
					Math.abs(a.x - ms) < Math.abs(b.x - ms) ? a : b
				);
			};

			const newStart = findClosest(startDate);
			const newEnd = findClosest(endDate);

			const isEditMode = popup.dataset.mode === "edit";
			const editingId = popup.dataset.editId;

			if (isEditMode && editingId) {
				// preserve old retracement visibility/fibo state
				const oldRetr = chart._retracements?.[editingId];
				const hidden = oldRetr?.hidden ?? false;
				const fibos = oldRetr?.fibos ? { ...oldRetr.fibos } : undefined;

				delete chart._retracements[editingId];

				// ✅ FIXED retracement update call
				chart.addRetracement({
					startPrice: newStart.y[3],
					endPrice: newEnd.y[3],
					// 🧩 use actual candle timestamps instead of raw input strings
					startDate: new Date(newStart.x).toISOString(),
					endDate: new Date(newEnd.x).toISOString(),
					retracementId: editingId,
					hidden,
					fibos,
				});

				// ✅ Refresh chart + notify backend
				chart.rebuildVisibleAnnotations();
				chart._emitRetrChanged();

				// ✅ Update the existing retracement card UI with new dates
				const card = retrList.querySelector(`.retr-card[data-retr-id="${editingId}"]`);
				if (card) {
					card.querySelector(".retr-dates").innerHTML = `
      <div>Start: ${new Date(newStart.x).toLocaleDateString()} (${newStart.y[3].toFixed(2)})</div>
      <div>End: ${new Date(newEnd.x).toLocaleDateString()} (${newEnd.y[3].toFixed(2)})</div>
    `;
					card.classList.remove("editing");
				}

				// ✅ Reset popup UI to add mode
				popup.dataset.mode = "";
				popup.dataset.editId = "";
				addBtn.textContent = "Add Retracement";
				addBtn.classList.remove("btn-warning");
				startIn.value = endIn.value = ""; 
				
				if (!startIn.value) startIn.type = "text";
				if (!endIn.value)   endIn.type   = "text";
				// ✅ Save to backend
				const remaining = Object.values(chart._retracements ?? {});
				await saveChartConfig(chart.key.toUpperCase(), {
					interval: chart.selectedInterval,
					volumeHidden: chart._volumeHidden ?? false,
					retracements: remaining.length ? remaining : [],
				});

				return; // stop here (don’t run add-mode logic)
			}
			else {
				// ===== NORMAL ADD FLOW =====
				const retrId = `retr-${Date.now()}`;
				chart.addRetracement({
					startPrice: newStart.y[3],
					endPrice: newEnd.y[3],
					startDate,
					endDate,
					retracementId: retrId,
				});

				addRetrCard(retrId, newStart, newEnd); // creates the card
				startIn.value = endIn.value = "";

				await saveChartConfig(chart.key.toUpperCase(), {
					interval: chart.selectedInterval,
					volumeHidden: chart._volumeHidden ?? false,
					retracements: Object.values(chart._retracements ?? {}),
				});
			}
		});
		// === Collapsible Add Retracement ===
		const formToggleBtn = popup.querySelector(".retr-form-toggle");
		const formContent = popup.querySelector(".retr-form-content");
		
		formToggleBtn.addEventListener("click", () => {
		  const isOpen = formContent.classList.toggle("open");
		  formToggleBtn.innerHTML = isOpen
		    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>`
		    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
		});

		function addRetrCard(id, start, end) {
			const chart = ChartKit.get(sKey);
			const div = document.createElement("div");
			div.className =
				"retr-card mb-2 p-2 rounded border border-secondary bg-dark bg-opacity-75";
			div.dataset.retrId = id;

			const retr = chart._retracements[id];
			if (!retr) return;

			// initialize fibo state if not present
			if (!retr.fibos) retr.fibos = {
				"10%": true,
				"25%": true,
				"33%": true,
				"38%": true,
				"50%": true,
				"62%": true,
				"66%": true,
				"75%": true,
			};

			// card layout
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

  <!-- collapse toggle -->
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
  ${["10%", "25%", "33%", "38%", "50%", "62%", "66%", "75%"]
    .map(p => `
      <div class="fibo-row d-flex justify-content-between align-items-center border-bottom border-dark py-1">
        <span class="text-white-50">${p}</span>
        <button class="fibo-toggle" data-level="${p}" title="Toggle Fibo ${p}">
          ${
            retr.fibos[p]
              ? `<svg class="icon-eye" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                   <circle cx="12" cy="12" r="3"/>
                 </svg>`
              : `<svg class="icon-eye-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/>
                 </svg>`
          }
        </button>
      </div>
    `)
    .join("")}
</div>`;

			// ==============================
			// 🗑 DELETE handler
			// ==============================
			div.querySelector(".retr-del").addEventListener("click", async () => {
				delete chart._retracements[id];
				div.remove();

				chart.rebuildVisibleAnnotations();
				chart._emitRetrChanged(); // keep this if you want to persist immediately

				const remaining = Object.values(chart._retracements ?? {});
				await saveChartConfig(chart.key.toUpperCase(), {
					interval: chart.selectedInterval,
					volumeHidden: chart._volumeHidden ?? false,
					retracements: remaining.length ? remaining : [],
				});
			});

			// ==============================
			// ✏️ EDIT handler (unchanged)
			// ==============================
			div.querySelector(".retr-edit").addEventListener("click", () => {
			  const chart = ChartKit.get(sKey);
			  const retr = chart?._retracements?.[id];
			  if (!retr) return;
			
			  const startInput = popup.querySelector(".retr-start");
			  const endInput   = popup.querySelector(".retr-end");
			  if (!startInput || !endInput) return;
			
			  startInput.type = "date"; // NEW
			  endInput.type   = "date"; // NEW
			  startInput.value = retr.params.startDate.split("T")[0];
			  endInput.value   = retr.params.endDate.split("T")[0];
			
			  popup.dataset.mode = "edit";
			  popup.dataset.editId = id;
			  const addBtn = popup.querySelector(".add-retr-btn");
			  addBtn.textContent = "Update Retracement";
			  addBtn.classList.add("btn-warning");
			
			  retrList.querySelectorAll(".retr-card").forEach(c => c.classList.remove("editing"));
			  div.classList.add("editing");
			  popup.classList.remove("d-none");
			});
			// 👁 Hide/Show ENTIRE retracement (fixed version)

			const retrToggleBtn = div.querySelector(".retr-toggle");
			retrToggleBtn.addEventListener("click", async (e) => {
				const chart = ChartKit.get(sKey);
				if (!chart) return;

				const retr = chart._retracements[id];
				if (!retr) return;

				retr.hidden = !retr.hidden; // toggle hidden flag
				// initialize hidden UI state
				if (retr.hidden) {
					retrToggleBtn.textContent = "🚫";
					retrToggleBtn.classList.replace("btn-outline-secondary", "btn-outline-warning");
					retrToggleBtn.title = "Show Retracement";
					div.classList.add("is-dimmed");
				} else {
					retrToggleBtn.textContent = "👁";
					retrToggleBtn.classList.replace("btn-outline-warning", "btn-outline-secondary");
					retrToggleBtn.title = "Hide Retracement";
					div.classList.remove("is-dimmed");
				}

				// 🔁 Refresh annotations safely
				chart.rebuildVisibleAnnotations();
				chart._emitRetrChanged();


				// 🎨 Update button and card style
				const btn = e.currentTarget;
				if (retr.hidden) {
					btn.textContent = "🚫";
					btn.classList.replace("btn-outline-secondary", "btn-outline-warning");
					btn.title = "Show Retracement";
					div.classList.add("is-dimmed"); // use 'is-dimmed', NOT 'hidden'
				} else {
					btn.textContent = "👁";
					btn.classList.replace("btn-outline-warning", "btn-outline-secondary");
					btn.title = "Hide Retracement";
					div.classList.remove("is-dimmed");
				}

				// 💾 Save to DB
				const remaining = Object.values(chart._retracements ?? {});
				await saveChartConfig(chart.key.toUpperCase(), {
					interval: chart.selectedInterval,
					volumeHidden: chart._volumeHidden ?? false,
					retracements: remaining.length ? remaining : [],
				});
			});
			// 🔽 Collapse/Expand fibo levels
			const collapseBtn = div.querySelector(".retr-collapse-toggle");
			const fiboContainer = div.querySelector(".retr-fibos");
			
			collapseBtn.addEventListener("click", () => {
			  const isOpen = fiboContainer.classList.toggle("open");
			
			  // rotate arrow icon
			  collapseBtn.querySelector("svg").style.transform = isOpen
			    ? "rotate(0deg)"
			    : "rotate(-90deg)";
			});
			// ==============================
			// 🎯 Per-Fibo Level Toggle
			// ==============================
			div.querySelectorAll(".fibo-toggle").forEach(btn => {
				btn.addEventListener("click", async (e) => {
					const level = e.currentTarget.dataset.level;
					const retr = chart._retracements[id];
					if (!retr) return;

					retr.fibos[level] = !retr.fibos[level];
					e.currentTarget.innerHTML = retr.fibos[level]
						? `<svg class="icon-eye" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					       <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
					       <circle cx="12" cy="12" r="3"/>
					     </svg>`
						: `<svg class="icon-eye-off" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					       <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a22.51 22.51 0 0 1 5.17-6.73M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a22.64 22.64 0 0 1-4.24 5.64M1 1l22 22"/>
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



		window.addRetrCard = addRetrCard;

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
			const res = await fetch("/api/user/chart-settings");
			const { charts } = await res.json();
			if (!charts?.length) return;

			for (const chart of charts) {
				const symbol = chart.symbol;
				const interval = chart.interval || "4h";
				const inst = await createChartCard(symbol, interval, true); // restored chart

				inst.onReady = async () => {
					const sKey = symbol.toLowerCase();

					// === Restore Volume State ===
					if (chart.volumeHidden) {
						const btn = document.getElementById(`toggle-volume-${sKey}`);
						if (btn) btn.textContent = "Show Volume";
						inst.setVolumeHidden(true);
					}

					// === Restore Retracements ===
					if (chart.retracements) {
						let retrList;
						try {
							retrList = JSON.parse(chart.retracements);
						} catch {
							retrList = [];
						}

						const wrapper = document.querySelector(`[data-symbol="${symbol}"]`);
						const popup = wrapper?.querySelector(`#retr-popup-${sKey}`);
						const retrContainer = popup?.querySelector(".retr-list");
						const candleSeries = inst.seriesDefs.find((s) => s.type === "candlestick");

						retrList.forEach((r) => {
							// Support both new and old DB formats
							const retrData = r.params ? r.params : r;

							const startPrice = parseFloat(retrData.startPrice);
							const endPrice = parseFloat(retrData.endPrice);
							const startDate = retrData.startDate;
							const endDate = retrData.endDate;

							if (!startDate || !endDate || isNaN(startPrice) || isNaN(endPrice)) {
								console.warn("Invalid retracement skipped:", retrData);
								return;
							}

							const retracementId = r.retracementId || `retr-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

							// 1️ Draw retracement on chart
							inst.addRetracement({
								startPrice,
								endPrice,
								startDate,
								endDate,
								retracementId,
								hidden: !!r.hidden,
								fibos: r.fibos || undefined, // restore fibo visibility states
							});

							// Add retracement card in UI
							if (typeof addRetrCard === "function") {
								const start = { x: new Date(startDate).getTime(), y: [0, 0, 0, startPrice] };
								const end = { x: new Date(endDate).getTime(), y: [0, 0, 0, endPrice] };
								addRetrCard(retracementId, start, end);
							}
						});
					}
				};

				// 🔔 Persist on any retracement change
				inst.onRetracementsChanged = async (chartInst) => {
					const retracements = Object.values(chartInst._retracements ?? {});
					await saveChartConfig(chartInst.key.toUpperCase(), {
						interval: chartInst.selectedInterval,
						volumeHidden: chartInst._volumeHidden ?? false,
						retracements: retracements.length ? retracements : [],
					});
				};
			}
		} catch (err) {
			console.error("Failed to load user charts:", err);
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
