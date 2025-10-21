package com.crypto.analysis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.crypto.analysis.domain.UserChartSettings;

import java.util.List;
import java.util.Optional;

public interface UserChartSettingsRepository extends JpaRepository<UserChartSettings, Long> {
    List<UserChartSettings> findByUserName(String userName);
    Optional<UserChartSettings> findByUserNameAndSymbol(String userName, String symbol);
}