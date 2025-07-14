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

        // Basic Lifestyle Preferences
        if (req.getCleanliness() != null) {
            prefs.setCleanliness(req.getCleanliness());
        }
        if (req.getCleanlinessImportance() != null) {
            prefs.setCleanlinessImportance(req.getCleanlinessImportance());
        }

        if (req.getSleepSchedule() != null) {
            prefs.setSleepSchedule(req.getSleepSchedule());
        }
        if (req.getSleepScheduleImportance() != null) {
            prefs.setSleepScheduleImportance(req.getSleepScheduleImportance());
        }

        if (req.getNoiseTolerance() != null) {
            prefs.setNoiseTolerance(req.getNoiseTolerance());
        }
        if (req.getNoiseToleranceImportance() != null) {
            prefs.setNoiseToleranceImportance(req.getNoiseToleranceImportance());
        }

        if (req.getStudyPreference() != null) {
            prefs.setStudyPreference(req.getStudyPreference());
        }
        if (req.getStudyPreferenceImportance() != null) {
            prefs.setStudyPreferenceImportance(req.getStudyPreferenceImportance());
        }

        if (req.getVisitorPolicy() != null) {
            prefs.setVisitorPolicy(req.getVisitorPolicy());
        }
        if (req.getVisitorPolicyImportance() != null) {
            prefs.setVisitorPolicyImportance(req.getVisitorPolicyImportance());
        }

        // Pet Preferences
        prefs.setHasPets(req.isHasPets());
        if (req.getHasPetsImportance() != null) {
            prefs.setHasPetsImportance(req.getHasPetsImportance());
        }
        
        prefs.setAcceptsPets(req.isAcceptsPets());
        if (req.getAcceptsPetsImportance() != null) {
            prefs.setAcceptsPetsImportance(req.getAcceptsPetsImportance());
        }

        // Smoking Preferences
        prefs.setIsSmoker(req.isSmoker());
        if (req.getSmokingImportance() != null) {
            prefs.setSmokingImportance(req.getSmokingImportance());
        }
        
        prefs.setAcceptsSmokers(req.isAcceptsSmokers());
        if (req.getAcceptsSmokersImportance() != null) {
            prefs.setAcceptsSmokersImportance(req.getAcceptsSmokersImportance());
        }

        // Social Preferences
        if (req.getSocialPreference() != null) {
            prefs.setSocialPreference(req.getSocialPreference());
        }
        if (req.getSocialPreferenceImportance() != null) {
            prefs.setSocialPreferenceImportance(req.getSocialPreferenceImportance());
        }

        // Work/Study Schedule
        if (req.getWorkSchedule() != null) {
            prefs.setWorkSchedule(req.getWorkSchedule());
        }
        if (req.getWorkScheduleImportance() != null) {
            prefs.setWorkScheduleImportance(req.getWorkScheduleImportance());
        }

        // Budget Preferences
        if (req.getMinBudget() != null) {
            prefs.setMinBudget(req.getMinBudget());
        }
        if (req.getMaxBudget() != null) {
            prefs.setMaxBudget(req.getMaxBudget());
        }
        if (req.getBudgetImportance() != null) {
            prefs.setBudgetImportance(req.getBudgetImportance());
        }

        // Location Preferences
        if (req.getPreferredNeighborhoods() != null) {
            prefs.setPreferredNeighborhoods(req.getPreferredNeighborhoods());
        }
        if (req.getPreferredTransportation() != null) {
            prefs.setPreferredTransportation(req.getPreferredTransportation());
        }
        if (req.getLocationImportance() != null) {
            prefs.setLocationImportance(req.getLocationImportance());
        }

        // Roommate Preferences
        if (req.getGenderPreference() != null) {
            prefs.setGenderPreference(req.getGenderPreference());
        }
        if (req.getGenderPreferenceImportance() != null) {
            prefs.setGenderPreferenceImportance(req.getGenderPreferenceImportance());
        }

        if (req.getAgePreference() != null) {
            prefs.setAgePreference(req.getAgePreference());
        }
        if (req.getAgePreferenceImportance() != null) {
            prefs.setAgePreferenceImportance(req.getAgePreferenceImportance());
        }

        // Additional Preferences
        prefs.setPrefersQuietEnvironment(req.isPrefersQuietEnvironment());
        prefs.setPrefersActiveLifestyle(req.isPrefersActiveLifestyle());
        prefs.setPrefersCooking(req.isPrefersCooking());
        prefs.setPrefersEatingOut(req.isPrefersEatingOut());
        prefs.setPrefersGym(req.isPrefersGym());
        prefs.setPrefersParties(req.isPrefersParties());
        prefs.setPrefersEarlyRiser(req.isPrefersEarlyRiser());
        prefs.setPrefersNightOwl(req.isPrefersNightOwl());

        // Save the updated preferences
        UserPreferences savedPrefs = preferencesRepository.save(prefs);
        log.info("Saved preferences: {}", savedPrefs);
    }

    private PreferencesResponse mapToResponse(UserPreferences prefs) {
        PreferencesResponse res = new PreferencesResponse();
        
        // Basic Lifestyle Preferences
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
        
        // Pet Preferences
        res.setHasPets(prefs.getHasPets() != null ? prefs.getHasPets() : false);
        res.setHasPetsImportance(prefs.getHasPetsImportance());
        res.setAcceptsPets(prefs.getAcceptsPets() != null ? prefs.getAcceptsPets() : false);
        res.setAcceptsPetsImportance(prefs.getAcceptsPetsImportance());
        
        // Smoking Preferences
        res.setSmoker(prefs.getIsSmoker() != null ? prefs.getIsSmoker() : false);
        res.setSmokingImportance(prefs.getSmokingImportance());
        res.setAcceptsSmokers(prefs.getAcceptsSmokers() != null ? prefs.getAcceptsSmokers() : false);
        res.setAcceptsSmokersImportance(prefs.getAcceptsSmokersImportance());
        
        // Social Preferences
        res.setSocialPreference(prefs.getSocialPreference());
        res.setSocialPreferenceImportance(prefs.getSocialPreferenceImportance());
        
        // Work/Study Schedule
        res.setWorkSchedule(prefs.getWorkSchedule());
        res.setWorkScheduleImportance(prefs.getWorkScheduleImportance());
        
        // Budget Preferences
        res.setMinBudget(prefs.getMinBudget());
        res.setMaxBudget(prefs.getMaxBudget());
        res.setBudgetImportance(prefs.getBudgetImportance());
        
        // Location Preferences
        res.setPreferredNeighborhoods(prefs.getPreferredNeighborhoods());
        res.setPreferredTransportation(prefs.getPreferredTransportation());
        res.setLocationImportance(prefs.getLocationImportance());
        
        // Roommate Preferences
        res.setGenderPreference(prefs.getGenderPreference());
        res.setGenderPreferenceImportance(prefs.getGenderPreferenceImportance());
        res.setAgePreference(prefs.getAgePreference());
        res.setAgePreferenceImportance(prefs.getAgePreferenceImportance());
        
        // Additional Preferences
        res.setPrefersQuietEnvironment(prefs.getPrefersQuietEnvironment() != null ? prefs.getPrefersQuietEnvironment() : false);
        res.setPrefersActiveLifestyle(prefs.getPrefersActiveLifestyle() != null ? prefs.getPrefersActiveLifestyle() : false);
        res.setPrefersCooking(prefs.getPrefersCooking() != null ? prefs.getPrefersCooking() : false);
        res.setPrefersEatingOut(prefs.getPrefersEatingOut() != null ? prefs.getPrefersEatingOut() : false);
        res.setPrefersGym(prefs.getPrefersGym() != null ? prefs.getPrefersGym() : false);
        res.setPrefersParties(prefs.getPrefersParties() != null ? prefs.getPrefersParties() : false);
        res.setPrefersEarlyRiser(prefs.getPrefersEarlyRiser() != null ? prefs.getPrefersEarlyRiser() : false);
        res.setPrefersNightOwl(prefs.getPrefersNightOwl() != null ? prefs.getPrefersNightOwl() : false);
        
        return res;
    }
}

