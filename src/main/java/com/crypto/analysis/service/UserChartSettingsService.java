package com.crypto.analysis.service;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.crypto.analysis.authsecurity.domain.User;
import com.crypto.analysis.domain.UserChartSettings;
import com.crypto.analysis.repository.UserChartSettingsRepository;

import java.time.LocalDateTime;
import java.util.List;

import javax.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class UserChartSettingsService {

    private final UserChartSettingsRepository userChartSettingsRepository;
    
    public List<UserChartSettings> getAllForUser(String userName) {
        return userChartSettingsRepository.findByUserName(userName);
    }

    public UserChartSettings getOrCreate(String userName, String symbol) {
        return userChartSettingsRepository.findByUserNameAndSymbol(userName, symbol)
                .orElseGet(() -> userChartSettingsRepository.save(
                        UserChartSettings.builder()
                                .userName(userName)
                                .symbol(symbol)
                                .build()
                ));
    }

    public UserChartSettings saveOrUpdate(UserChartSettings dto) {
        // Ensure repository and authentication are used correctly
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	if (auth == null || !auth.isAuthenticated()) {
    	    throw new IllegalStateException("No authenticated user found");
    	}
        String userName = auth.getName();
 
        return userChartSettingsRepository.findByUserNameAndSymbol(userName, dto.getSymbol())
                .map(existing -> {
                    // Update existing record
                    existing.setInterval(dto.getInterval());
                    existing.setVolumeHidden(dto.isVolumeHidden());
                    existing.setRetracements(dto.getRetracements());
                    existing.setUpdatedAt(LocalDateTime.now());
                    return userChartSettingsRepository.save(existing);
                })
                .orElseGet(() -> {
                    // Create new if not exists
                    UserChartSettings newSettings = UserChartSettings.builder()
                            .userName(userName)
                            .symbol(dto.getSymbol())
                            .interval(dto.getInterval())
                            .volumeHidden(dto.isVolumeHidden())
                            .retracements(dto.getRetracements())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return userChartSettingsRepository.save(newSettings);
                });
    }
    @Transactional
    public void deleteChartForUser(String username, String symbol) {
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	if (auth == null || !auth.isAuthenticated()) {
    	    throw new IllegalStateException("No authenticated user found");
    	}
        
    	userChartSettingsRepository.findByUserNameAndSymbol(username, symbol)
                .ifPresent(userChartSettingsRepository::delete);
        
    }


}