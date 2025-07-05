package com.g2.roommateapp.service;
import com.g2.roommateapp.dto.*;
import com.g2.roommateapp.entity.*;

import com.g2.roommateapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;

    public PreferencesResponse getPreferences(Long userId) {
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Preferences not found"));
        return mapToResponse(prefs);
    }

    public void updatePreferences(Long userId, PreferencesRequest req) {
        User user = userRepository.findById(userId).orElseThrow();
        UserPreferences prefs = preferencesRepository.findById(userId).orElse(new UserPreferences());
        prefs.setUser(user);
        prefs.setCleanliness(req.getCleanliness());
        prefs.setSleepSchedule(req.getSleepSchedule());
        prefs.setNoiseTolerance(req.getNoiseTolerance());
        prefs.setStudyPreference(req.getStudyPreference());
        prefs.setVisitorPolicy(req.getVisitorPolicy());
        prefs.setHasPets(req.isHasPets());
        prefs.setAcceptsPets(req.isAcceptsPets());
        preferencesRepository.save(prefs);
    }

    private PreferencesResponse mapToResponse(UserPreferences prefs) {
        PreferencesResponse res = new PreferencesResponse();
        res.setCleanliness(prefs.getCleanliness());
        res.setSleepSchedule(prefs.getSleepSchedule());
        res.setNoiseTolerance(prefs.getNoiseTolerance());
        res.setStudyPreference(prefs.getStudyPreference());
        res.setVisitorPolicy(prefs.getVisitorPolicy());
        res.setHasPets(prefs.isHasPets());
        res.setAcceptsPets(prefs.isAcceptsPets());
        return res;
    }
}

