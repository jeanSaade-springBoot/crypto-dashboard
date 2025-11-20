package com.crypto.analysis.service;

import com.crypto.analysis.dto.OhlcDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TechnicalIndicatorService {

    public List<Double> calculateRSI(List<OhlcDTO> candles, int period) {
        List<Double> rsi = new ArrayList<>();
        if (candles == null || candles.size() < period + 1) return rsi;

        List<Double> gains = new ArrayList<>();
        List<Double> losses = new ArrayList<>();

        // 1️⃣ Calculate gains/losses
        for (int i = 1; i < candles.size(); i++) {
            double diff = candles.get(i).getClose() - candles.get(i - 1).getClose();
            gains.add(Math.max(0, diff));
            losses.add(Math.max(0, -diff));
        }

        // 2️⃣ First averages
        double avgGain = gains.subList(0, period).stream().mapToDouble(v -> v).sum() / period;
        double avgLoss = losses.subList(0, period).stream().mapToDouble(v -> v).sum() / period;

        // Fill initial empty values
        for (int i = 0; i < period; i++) rsi.add(null);

        // 3️⃣ Now compute RSI for each candle
        for (int i = period; i < gains.size(); i++) {
            avgGain = ((avgGain * (period - 1)) + gains.get(i)) / period;
            avgLoss = ((avgLoss * (period - 1)) + losses.get(i)) / period;

            double rs = avgLoss == 0 ? 100 : avgGain / avgLoss;
            double rsiValue = 100 - (100 / (1 + rs));
            rsi.add(rsiValue);
        }

        return rsi;
    }
}