package com.crypto.analysis.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.crypto.analysis.dto.GraphDataReqDTO;
import com.crypto.analysis.dto.OhlcPoint;
import com.crypto.analysis.dto.PagedResponse;
import com.crypto.analysis.service.ChartService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/graph")
@RequiredArgsConstructor
public class ChartController {

	private final ChartService chartService;

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