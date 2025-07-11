package com.g2.roommateapp.service;
import com.g2.roommateapp.dto.*;
import com.g2.roommateapp.entity.*;

import com.g2.roommateapp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPreferencesService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository preferencesRepository;

    public PreferencesResponse getPreferences(Long userId) {
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Preferences not found"));
        return mapToResponse(prefs);
    }

    public void updatePreferences(Long userId, PreferencesRequest req) {
        log.info("Updating preferences for user ID: {}", userId);
        log.info("Request data: {}", req);
        
        if (userId == null || req == null) {
            throw new IllegalArgumentException("User ID and request cannot be null");
        }
        
        // Find existing preferences or create new ones
        UserPreferences prefs = preferencesRepository.findById(userId)
                .orElse(new UserPreferences());

        // Set the user relationship
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        prefs.setUser(user);

        // Cleanliness - only update if not null
        if (req.getCleanliness() != null) {
        prefs.setCleanliness(req.getCleanliness());
        }
        if (req.getCleanlinessImportance() != null) {
        prefs.setCleanlinessImportance(req.getCleanlinessImportance());
        }

        // Sleep Schedule - only update if not null
        if (req.getSleepSchedule() != null) {
        prefs.setSleepSchedule(req.getSleepSchedule());
        }
        if (req.getSleepScheduleImportance() != null) {
        prefs.setSleepScheduleImportance(req.getSleepScheduleImportance());
        }

        // Noise Tolerance - only update if not null
        if (req.getNoiseTolerance() != null) {
        prefs.setNoiseTolerance(req.getNoiseTolerance());
        }
        if (req.getNoiseToleranceImportance() != null) {
        prefs.setNoiseToleranceImportance(req.getNoiseToleranceImportance());
        }

        // Study Preference - only update if not null
        if (req.getStudyPreference() != null) {
        prefs.setStudyPreference(req.getStudyPreference());
        }
        if (req.getStudyPreferenceImportance() != null) {
        prefs.setStudyPreferenceImportance(req.getStudyPreferenceImportance());
        }

        // Visitor Policy - only update if not null
        if (req.getVisitorPolicy() != null) {
        prefs.setVisitorPolicy(req.getVisitorPolicy());
        }
        if (req.getVisitorPolicyImportance() != null) {
        prefs.setVisitorPolicyImportance(req.getVisitorPolicyImportance());
        }

        // Pets - boolean values can be updated directly
        prefs.setHasPets(req.isHasPets());
        if (req.getHasPetsImportance() != null) {
        prefs.setHasPetsImportance(req.getHasPetsImportance());
        }
        
        prefs.setAcceptsPets(req.isAcceptsPets());
        if (req.getAcceptsPetsImportance() != null) {
        prefs.setAcceptsPetsImportance(req.getAcceptsPetsImportance());
        }

        // Save the updated preferences
        UserPreferences savedPrefs = preferencesRepository.save(prefs);
        log.info("Saved preferences: {}", savedPrefs);
    }

    private PreferencesResponse mapToResponse(UserPreferences prefs) {
        PreferencesResponse res = new PreferencesResponse();
        res.setCleanliness(prefs.getCleanliness());
        res.setCleanlinessImportance(prefs.getCleanlinessImportance());
        res.setSleepSchedule(prefs.getSleepSchedule());
        res.setSleepScheduleImportance(prefs.getSleepScheduleImportance());
        res.setNoiseTolerance(prefs.getNoiseTolerance());
        res.setNoiseToleranceImportance(prefs.getNoiseToleranceImportance());
        res.setStudyPreference(prefs.getStudyPreference());
        res.setStudyPreferenceImportance(prefs.getStudyPreferenceImportance());
        res.setVisitorPolicy(prefs.getVisitorPolicy());
        res.setVisitorPolicyImportance(prefs.getVisitorPolicyImportance());
        res.setHasPets(prefs.isHasPets());
        res.setHasPetsImportance(prefs.getHasPetsImportance());
        res.setAcceptsPets(prefs.isAcceptsPets());
        res.setAcceptsPetsImportance(prefs.getAcceptsPetsImportance());
        return res;
    }
}

