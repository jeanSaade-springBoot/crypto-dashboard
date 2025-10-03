package com.crypto.analysis.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor 
@AllArgsConstructor
public class GraphDataReqDTO {
    private String symbol;     // e.g., "BTC"
    private String interval;   // e.g., "1m", "5m", "1h"
    private Instant from;      // ISO-8601 UTC
    private Instant to;        // ISO-8601 UTC
    private String downsample; // "auto" | "1m" | "5m" | "1h" | "1d"
    private String fromDate;
    private String toDate;
    private String dataType;  // normal max min 
    private String cryptoCurrencyCode; //btc
    private String tableName; //btc
    private String hmd;   // hour or minute or day..
    private String action;   // sell buy
    private String criteria;
    private int minutes;   // used for order book
    private int page;
    private int size;
    private int limit;
    private boolean isAsc;
}