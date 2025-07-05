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
    private SleepSchedule sleepSchedule;

    @Enumerated(EnumType.STRING)
    private NoiseTolerance noiseTolerance;

    @Enumerated(EnumType.STRING)
    private StudyPreference studyPreference;

    @Enumerated(EnumType.STRING)
    private VisitorPolicy visitorPolicy;

    private boolean hasPets ;
    private boolean acceptsPets;


}
