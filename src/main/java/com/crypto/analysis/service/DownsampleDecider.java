package com.crypto.analysis.service;
import org.springframework.stereotype.Component;

import com.crypto.analysis.dto.GraphDataReqDTO;

import java.time.Duration;

@Component
public class DownsampleDecider {
    public String decideGap(GraphDataReqDTO req, Integer targetPoints) {
        long seconds = Duration.between(req.getFrom(), req.getTo()).getSeconds();
        long desired = (targetPoints != null ? targetPoints : 800);
        long bucketSec = Math.max(seconds / Math.max(1, desired), 60);

        String ds = req.getDownsample();
        if (ds != null && !"auto".equalsIgnoreCase(ds)) return mapIntervalToGap(ds);

        if (bucketSec <= 60)   return "+1MINUTES";
        if (bucketSec <= 300)  return "+5MINUTES";
        if (bucketSec <= 900)  return "+15MINUTES";
        if (bucketSec <= 3600) return "+1HOURS";
        if (bucketSec <= 21600)return "+6HOURS";
        if (bucketSec <= 86400)return "+1DAYS";
        return "+7DAYS";
    }

    private String mapIntervalToGap(String interval) {
        switch (interval) {
            case "1m":  return "+1MINUTES";
            case "5m":  return "+5MINUTES";
            case "15m": return "+15MINUTES";
            case "1h":  return "+1HOURS";
            case "6h":  return "+6HOURS";
            case "1d":
            case "1D":  return "+1DAYS";
            default:    return "+1HOURS";
        }
    }
}