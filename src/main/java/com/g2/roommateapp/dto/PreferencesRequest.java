package com.g2.roommateapp.dto;

import com.g2.roommateapp.enums.*;
import lombok.Data;

@Data
public class PreferencesRequest {
    // Cleanliness
    private Cleanliness cleanliness;
    private ImportanceLevel cleanlinessImportance;

    // Sleep Schedule
    private SleepSchedule sleepSchedule;
    private ImportanceLevel sleepScheduleImportance;

    // Noise Tolerance
    private NoiseTolerance noiseTolerance;
    private ImportanceLevel noiseToleranceImportance;

    // Study Preference
    private StudyPreference studyPreference;
    private ImportanceLevel studyPreferenceImportance;

    // Visitor Policy
    private VisitorPolicy visitorPolicy;
    private ImportanceLevel visitorPolicyImportance;

    // Pets
    private boolean hasPets;
    private ImportanceLevel hasPetsImportance;

    private boolean acceptsPets;
    private ImportanceLevel acceptsPetsImportance;
}