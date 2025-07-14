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
            // Basic Lifestyle Preferences
            preferencesResponse.setCleanliness(user.getPreferences().getCleanliness());
            preferencesResponse.setCleanlinessImportance(user.getPreferences().getCleanlinessImportance());
            preferencesResponse.setSleepSchedule(user.getPreferences().getSleepSchedule());
            preferencesResponse.setSleepScheduleImportance(user.getPreferences().getSleepScheduleImportance());
            preferencesResponse.setNoiseTolerance(user.getPreferences().getNoiseTolerance());
            preferencesResponse.setNoiseToleranceImportance(user.getPreferences().getNoiseToleranceImportance());
            preferencesResponse.setStudyPreference(user.getPreferences().getStudyPreference());
            preferencesResponse.setStudyPreferenceImportance(user.getPreferences().getStudyPreferenceImportance());
            preferencesResponse.setVisitorPolicy(user.getPreferences().getVisitorPolicy());
            preferencesResponse.setVisitorPolicyImportance(user.getPreferences().getVisitorPolicyImportance());
            
            // Pet Preferences
            preferencesResponse.setHasPets(user.getPreferences().getHasPets() != null ? user.getPreferences().getHasPets() : false);
            preferencesResponse.setHasPetsImportance(user.getPreferences().getHasPetsImportance());
            preferencesResponse.setAcceptsPets(user.getPreferences().getAcceptsPets() != null ? user.getPreferences().getAcceptsPets() : false);
            preferencesResponse.setAcceptsPetsImportance(user.getPreferences().getAcceptsPetsImportance());
            
            // Smoking Preferences
            preferencesResponse.setSmoker(user.getPreferences().getIsSmoker() != null ? user.getPreferences().getIsSmoker() : false);
            preferencesResponse.setSmokingImportance(user.getPreferences().getSmokingImportance());
            preferencesResponse.setAcceptsSmokers(user.getPreferences().getAcceptsSmokers() != null ? user.getPreferences().getAcceptsSmokers() : false);
            preferencesResponse.setAcceptsSmokersImportance(user.getPreferences().getAcceptsSmokersImportance());
            
            // Social Preferences
            preferencesResponse.setSocialPreference(user.getPreferences().getSocialPreference());
            preferencesResponse.setSocialPreferenceImportance(user.getPreferences().getSocialPreferenceImportance());
            
            // Work/Study Schedule
            preferencesResponse.setWorkSchedule(user.getPreferences().getWorkSchedule());
            preferencesResponse.setWorkScheduleImportance(user.getPreferences().getWorkScheduleImportance());
            
            // Budget Preferences
            preferencesResponse.setMinBudget(user.getPreferences().getMinBudget());
            preferencesResponse.setMaxBudget(user.getPreferences().getMaxBudget());
            preferencesResponse.setBudgetImportance(user.getPreferences().getBudgetImportance());
            
            // Location Preferences
            preferencesResponse.setPreferredNeighborhoods(user.getPreferences().getPreferredNeighborhoods());
            preferencesResponse.setPreferredTransportation(user.getPreferences().getPreferredTransportation());
            preferencesResponse.setLocationImportance(user.getPreferences().getLocationImportance());
            
            // Roommate Preferences
            preferencesResponse.setGenderPreference(user.getPreferences().getGenderPreference());
            preferencesResponse.setGenderPreferenceImportance(user.getPreferences().getGenderPreferenceImportance());
            preferencesResponse.setAgePreference(user.getPreferences().getAgePreference());
            preferencesResponse.setAgePreferenceImportance(user.getPreferences().getAgePreferenceImportance());
            
            // Additional Preferences
            preferencesResponse.setPrefersQuietEnvironment(user.getPreferences().getPrefersQuietEnvironment() != null ? user.getPreferences().getPrefersQuietEnvironment() : false);
            preferencesResponse.setPrefersActiveLifestyle(user.getPreferences().getPrefersActiveLifestyle() != null ? user.getPreferences().getPrefersActiveLifestyle() : false);
            preferencesResponse.setPrefersCooking(user.getPreferences().getPrefersCooking() != null ? user.getPreferences().getPrefersCooking() : false);
            preferencesResponse.setPrefersEatingOut(user.getPreferences().getPrefersEatingOut() != null ? user.getPreferences().getPrefersEatingOut() : false);
            preferencesResponse.setPrefersGym(user.getPreferences().getPrefersGym() != null ? user.getPreferences().getPrefersGym() : false);
            preferencesResponse.setPrefersParties(user.getPreferences().getPrefersParties() != null ? user.getPreferences().getPrefersParties() : false);
            preferencesResponse.setPrefersEarlyRiser(user.getPreferences().getPrefersEarlyRiser() != null ? user.getPreferences().getPrefersEarlyRiser() : false);
            preferencesResponse.setPrefersNightOwl(user.getPreferences().getPrefersNightOwl() != null ? user.getPreferences().getPrefersNightOwl() : false);
            
            this.preferences = preferencesResponse;
        }
    }
}