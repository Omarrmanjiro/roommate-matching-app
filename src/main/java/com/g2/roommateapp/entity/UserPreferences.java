package com.g2.roommateapp.entity;

import com.g2.roommateapp.enums.*;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    private Long id;

    @OneToOne
    @MapsId/****
        * this the foreing key it is the same of the user entity
        */
    @JoinColumn(name="id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Cleanliness cleanliness;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel cleanlinessImportance;

    @Enumerated(EnumType.STRING)
    private SleepSchedule sleepSchedule;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel SleepScheduleImportance;

    @Enumerated(EnumType.STRING)
    private NoiseTolerance noiseTolerance;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel noiseToleranceImportance;

    @Enumerated(EnumType.STRING)
    private StudyPreference studyPreference;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel studyPreferenceImportance;

    @Enumerated(EnumType.STRING)
    private VisitorPolicy visitorPolicy;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel VisitorPolicyImportance;

    private boolean hasPets ;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel hasPetsImportance;

    private boolean acceptsPets;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel acceptsPetsImportance;


}
