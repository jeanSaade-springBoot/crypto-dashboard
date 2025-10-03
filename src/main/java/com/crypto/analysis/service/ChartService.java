package com.crypto.analysis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.crypto.analysis.dto.GraphDataReqDTO;
import com.crypto.analysis.dto.OhlcPoint;
import com.crypto.analysis.dto.PagedResponse;

@Service
@RequiredArgsConstructor
public class ChartService {

    private final RestTemplate restTemplate;
    private final DownsampleDecider decider;

    @Value("${solrApi.baseUrl}")
    private String solrApiBase;

    public PagedResponse<OhlcPoint> getCandles(GraphDataReqDTO req) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<GraphDataReqDTO> entity = new HttpEntity<>(req, headers);

        String url = solrApiBase + "/api/ohlc/getCandleGraphData"; // match your controller path

        ParameterizedTypeReference<PagedResponse<OhlcPoint>> type =
                new ParameterizedTypeReference<PagedResponse<OhlcPoint>>() {};

            ResponseEntity<PagedResponse<OhlcPoint>> resp =
                restTemplate.exchange(url, HttpMethod.POST, entity, type);

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw new RuntimeException("Solr app error: " + resp.getStatusCode());
            }
            return resp.getBody();
    }
    
}