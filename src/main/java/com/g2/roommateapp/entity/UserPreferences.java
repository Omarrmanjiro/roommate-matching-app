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

    @Enumerated(EnumType.STRING)
    private Cleanliness cleanliness;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel cleanlinessImportance = ImportanceLevel.NEUTRAL;

    @Enumerated(EnumType.STRING)
    private SleepSchedule sleepSchedule;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel sleepScheduleImportance = ImportanceLevel.NEUTRAL;

    @Enumerated(EnumType.STRING)
    private NoiseTolerance noiseTolerance;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel noiseToleranceImportance = ImportanceLevel.NEUTRAL;

    @Enumerated(EnumType.STRING)
    private StudyPreference studyPreference;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel studyPreferenceImportance = ImportanceLevel.NEUTRAL;

    @Enumerated(EnumType.STRING)
    private VisitorPolicy visitorPolicy;

    @Enumerated(EnumType.STRING)
    private ImportanceLevel visitorPolicyImportance = ImportanceLevel.NEUTRAL;

    private boolean hasPets = false;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel hasPetsImportance = ImportanceLevel.NEUTRAL;

    private boolean acceptsPets = false;
    @Enumerated(EnumType.STRING)
    private ImportanceLevel acceptsPetsImportance = ImportanceLevel.NEUTRAL;

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
