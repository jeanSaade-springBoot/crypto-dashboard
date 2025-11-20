package com.crypto.analysis.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.crypto.analysis.dto.OhlcDTO;

import java.util.List;

@Service
@Slf4j
public class BinanceOhlcService {

    private final RestTemplate rest = new RestTemplate();
    private static final String BASE_URL = "https://api.binance.com/api/v3/klines";

    public List<OhlcDTO> fetch(String symbol, String interval) {

        String url = BASE_URL +
                "?symbol=" + symbol +
                "&interval=" + interval +
                "&limit=1000";

        log.info("Fetching OHLC from Binance: {}", url);

        List<List<Object>> data = rest.getForObject(url, List.class);

        if (data == null || data.isEmpty()) {
            log.warn("No OHLC returned by Binance for {}", symbol);
            return List.of();
        }

        return data.stream()
                .map(k -> new OhlcDTO(
                        ((Number) k.get(0)).longValue(),           // timestamp
                        Double.parseDouble(k.get(1).toString()),    // open
                        Double.parseDouble(k.get(2).toString()),    // high
                        Double.parseDouble(k.get(3).toString()),    // low
                        Double.parseDouble(k.get(4).toString()),    // close
                        Double.parseDouble(k.get(7).toString())     // volume
                        , null))
                .toList();
    }
}