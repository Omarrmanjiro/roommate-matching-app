package com.g2.roommateapp.dto;

import com.g2.roommateapp.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDateTime createAt;
    private String status;
    private String role;
    private PreferencesResponse preferences;

    public UserDTO(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.createAt = user.getCreateAt();
        this.status = user.getStatus();
        this.role = user.getRole();

        if (user.getPreferences() != null) {
            PreferencesResponse preferencesResponse = new PreferencesResponse();
            preferencesResponse.setCleanliness(user.getPreferences().getCleanliness());
            preferencesResponse.setSleepSchedule(user.getPreferences().getSleepSchedule());
            preferencesResponse.setNoiseTolerance(user.getPreferences().getNoiseTolerance());
            preferencesResponse.setStudyPreference(user.getPreferences().getStudyPreference());
            preferencesResponse.setVisitorPolicy(user.getPreferences().getVisitorPolicy());
            preferencesResponse.setHasPets(user.getPreferences().isHasPets());
            preferencesResponse.setAcceptsPets(user.getPreferences().isAcceptsPets());
            this.preferences = preferencesResponse;
        }
    }
}