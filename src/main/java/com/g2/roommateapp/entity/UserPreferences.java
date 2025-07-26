package com.g2.roommateapp.entity;

import com.g2.roommateapp.enums.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"user"})
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name="id")
    private User user;

    // Basic Lifestyle Preferences
    @Enumerated(EnumType.STRING)
    private Cleanliness cleanliness;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel cleanlinessImportance;

    @Enumerated(EnumType.STRING)
    private SleepSchedule sleepSchedule;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel sleepScheduleImportance;

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
    private ImportanceLevel visitorPolicyImportance;

    // Pet Preferences
    private Boolean hasPets;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel hasPetsImportance;

    private Boolean acceptsPets;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel acceptsPetsImportance;

    // Smoking Preferences
    private Boolean isSmoker;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel smokingImportance;

    private Boolean acceptsSmokers;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel acceptsSmokersImportance;

    // Social Preferences
    @Enumerated(EnumType.STRING)
    private SocialPreference socialPreference;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel socialPreferenceImportance;

    // Work/Study Schedule
    @Enumerated(EnumType.STRING)
    private WorkSchedule workSchedule;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel workScheduleImportance;

    // Budget Preferences
    private String minBudget;
    private String maxBudget;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel budgetImportance;

    // Location Preferences
    private String preferredNeighborhoods;
    private String preferredTransportation;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel locationImportance;

    // Roommate Preferences
    @Enumerated(EnumType.STRING)
    private GenderPreference genderPreference;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel genderPreferenceImportance;

    @Enumerated(EnumType.STRING)
    private AgePreference agePreference;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel agePreferenceImportance;

    // Additional Preferences
    private Boolean prefersQuietEnvironment;
    private Boolean prefersActiveLifestyle;
    private Boolean prefersCooking;
    private Boolean prefersEatingOut;
    private Boolean prefersGym;
    private Boolean prefersParties;
    private Boolean prefersEarlyRiser;
    private Boolean prefersNightOwl;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPreferences that = (UserPreferences) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
