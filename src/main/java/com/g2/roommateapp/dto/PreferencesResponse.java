package com.g2.roommateapp.dto;

import com.g2.roommateapp.enums.*;
import lombok.Data;

@Data
public class PreferencesResponse {
    private Cleanliness cleanliness;
    private SleepSchedule sleepSchedule;
    private NoiseTolerance noiseTolerance;
    private StudyPreference studyPreference;
    private VisitorPolicy visitorPolicy;
    private boolean hasPets;
    private boolean acceptsPets;
}
