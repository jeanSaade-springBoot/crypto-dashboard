package com.crypto.analysis.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.crypto.analysis.domain.UserChartSettings;
import com.crypto.analysis.service.UserChartSettingsService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/chart-settings")
@RequiredArgsConstructor
public class UserChartSettingsController {

    private final UserChartSettingsService userChartSettingsService;

    /**
     * Get all chart settings for the currently authenticated user.
     */
    @GetMapping
    public Map<String, Object> getUserChartSettings(Authentication authentication) {
        String userName = authentication.getName();
        List<UserChartSettings> settings = userChartSettingsService.getAllForUser(userName);

        return Map.of(
            "userName", userName,
            "charts", settings
        );
    }

    /**
     * Save or update a chart setting for the logged-in user.
     */
    @PostMapping
    public UserChartSettings saveUserChartSettings(
            @RequestBody UserChartSettings body,
            Authentication authentication) {

        body.setUserName(authentication.getName());
        return userChartSettingsService.saveOrUpdate(body);
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<Void> deleteChart(
            @PathVariable String symbol,
            Authentication authentication) {

        String username = authentication.getName();
        userChartSettingsService.deleteChartForUser(username, symbol.toUpperCase());
        return ResponseEntity.noContent().build();
    }
 
}