package com.crypto.analysis.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crypto.analysis.dto.GraphDataReqDTO;
import com.crypto.analysis.dto.OhlcDTO;
import com.crypto.analysis.dto.OhlcPoint;
import com.crypto.analysis.dto.PagedResponse;
import com.crypto.analysis.service.BinanceOhlcService;
import com.crypto.analysis.service.ChartService;
import com.crypto.analysis.service.DatabaseOhlcService;
import com.crypto.analysis.service.TechnicalIndicatorService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/chart")
@RequiredArgsConstructor
public class ChartController {

	private final ChartService chartService;
	private final BinanceOhlcService binanceOhlcService;
    private final DatabaseOhlcService databaseOhlcService;
    private final TechnicalIndicatorService technicalIndicatorService;
  
    @GetMapping("/ohlc")
    public ResponseEntity<List<OhlcDTO>> getOhlc(
            @RequestParam String symbol,
            @RequestParam String interval,
            @RequestParam(defaultValue = "db") String source,
            @RequestParam(defaultValue = "false") boolean includeIndicators
    ) {
        symbol = symbol.toUpperCase();

        List<OhlcDTO> result;

        switch (source.toLowerCase()) {
            case "binance":
                result = binanceOhlcService.fetch(symbol, interval);
                break;

			/*
			 * case "db": result = databaseOhlcService.fetch(symbol, interval); break;
			 */

            default:
                throw new IllegalArgumentException("Invalid source: must be 'db' or 'binance'.");
        }

        if (includeIndicators) {
            List<Double> rsi = technicalIndicatorService.calculateRSI(result, 6);
            // attach RSI to the response
            for (int i = 0; i < result.size(); i++) {
                result.get(i).setRsi(i < rsi.size() ? rsi.get(i) : null);
            }
        }

        return ResponseEntity.ok(result);
    }
    @PostMapping("/candles")
    public ResponseEntity<PagedResponse<OhlcPoint>> candles(@RequestBody GraphDataReqDTO req) {
        PagedResponse<OhlcPoint> page = chartService.getCandles(req);
        return ResponseEntity.ok()
                .eTag(makeETag(page.getContent(), page.getPageNumber(), page.getPageSize()))
                .body(page);
    }

    private String makeETag(List<OhlcPoint> points, int pageNumber, int pageSize) {
        if (points == null || points.isEmpty()) return "\"empty\"";
        Instant last = points.get(points.size() - 1).getX();
        // include page info to avoid collisions between pages with the same last ts
        return "\"" + last.toString() + ":" + pageNumber + ":" + pageSize + "\"";
    }
}