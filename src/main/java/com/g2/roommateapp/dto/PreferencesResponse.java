package com.g2.roommateapp.dto;

import com.g2.roommateapp.enums.*;
import lombok.Data;

@Data
public class PreferencesResponse {
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
    private boolean hasPets;
    private ImportanceLevel hasPetsImportance;
    private boolean acceptsPets;
    private ImportanceLevel acceptsPetsImportance;
}
