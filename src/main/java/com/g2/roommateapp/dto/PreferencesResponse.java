package com.g2.roommateapp.dto;

import com.g2.roommateapp.enums.*;
import lombok.Data;

@Data
public class PreferencesResponse {
    // Basic Lifestyle Preferences
    private Cleanliness cleanliness;
    private ImportanceLevel cleanlinessImportance;
    private SleepSchedule sleepSchedule;
    private ImportanceLevel sleepScheduleImportance;
    private NoiseTolerance noiseTolerance;
    private ImportanceLevel noiseToleranceImportance;
    private StudyPreference studyPreference;
    private ImportanceLevel studyPreferenceImportance;
    private VisitorPolicy visitorPolicy;
    private ImportanceLevel visitorPolicyImportance;
    
    // Pet Preferences
    private boolean hasPets;
    private ImportanceLevel hasPetsImportance;
    private boolean acceptsPets;
    private ImportanceLevel acceptsPetsImportance;
    
    // Smoking Preferences
    private boolean isSmoker;
    private ImportanceLevel smokingImportance;
    private boolean acceptsSmokers;
    private ImportanceLevel acceptsSmokersImportance;
    
    // Social Preferences
    private SocialPreference socialPreference;
    private ImportanceLevel socialPreferenceImportance;
    
    // Work/Study Schedule
    private WorkSchedule workSchedule;
    private ImportanceLevel workScheduleImportance;
    
    // Budget Preferences
    private String minBudget;
    private String maxBudget;
    private ImportanceLevel budgetImportance;
    
    // Location Preferences
    private String preferredNeighborhoods;
    private String preferredTransportation;
    private ImportanceLevel locationImportance;
    
    // Roommate Preferences
    private GenderPreference genderPreference;
    private ImportanceLevel genderPreferenceImportance;
    private AgePreference agePreference;
    private ImportanceLevel agePreferenceImportance;
    
    // Additional Preferences
    private boolean prefersQuietEnvironment;
    private boolean prefersActiveLifestyle;
    private boolean prefersCooking;
    private boolean prefersEatingOut;
    private boolean prefersGym;
    private boolean prefersParties;
    private boolean prefersEarlyRiser;
    private boolean prefersNightOwl;
}
