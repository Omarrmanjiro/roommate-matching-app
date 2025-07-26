package com.g2.roommateapp.service;
import com.g2.roommateapp.dto.*;
import com.g2.roommateapp.entity.MatchSuggestion;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.entity.UserPreferences;
import com.g2.roommateapp.enums.ImportanceLevel;
import com.g2.roommateapp.enums.NotificationType;
import com.g2.roommateapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;

@Service
public class MatchingService {
    @Autowired
    private final NotificationService notificationService;
    @Autowired
    private MatchSuggestionRepository matchSuggestionRepository;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    public MatchingService(
            UserRepository userRepository,
            MatchSuggestionRepository matchSuggestionRepository,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.matchSuggestionRepository = matchSuggestionRepository;
        this.notificationService = notificationService;
    }


    /***********The Matching Algorithm************
 * 1-Fetch for the users except the active one.
 * 2-Stock them in an array.
 * 3-Handling if the user didn't fill the
 * preferences form.
 * 4-Calculating the score.
 * 5-If the score is bigger than 0 we can change
 * that if u want for better accuracy.
 * 6-And Finally we use the stream api for the
 * flow of data and (stream is used bach treat data
 * cauz there's a lot of functions and the stream
 * is destroyed after being used(it used once) ).
 *
 */
    public List<MatchCandidate> getTopMatches(User currentUser, int topN){
        // Check if current user has preferences
        if (currentUser.getPreferences() == null) {
            return new ArrayList<>(); // Return empty list if no preferences
        }
        
        List<User> allUser=userRepository.findAllExcept(currentUser.getId());
        List<MatchCandidate> candidates=new ArrayList<>();

        for(User other:allUser){
            // Skip users with no preferences
            if(other.getPreferences()==null)continue;
            
            // Check if other user has basic preferences filled
            UserPreferences otherPrefs = other.getPreferences();
            boolean hasBasicPreferences = otherPrefs.getCleanliness() != null || 
                                        otherPrefs.getSleepSchedule() != null || 
                                        otherPrefs.getNoiseTolerance() != null || 
                                        otherPrefs.getSocialPreference() != null;
            
            if (!hasBasicPreferences) continue; // Skip users with incomplete preferences
            
            double score = calculateCompatibility(currentUser.getPreferences(),other.getPreferences());

            if (score > 0) {
                matchSuggestionRepository.findByUserAndSuggestedUser(currentUser, other)
                        .ifPresentOrElse(existing -> {
                            existing.setScore(score);
                            matchSuggestionRepository.save(existing);
                            candidates.add(new MatchCandidate(existing.getId(), other.getId(), other.getFirstName(), score, existing.isAcceptedByUser(), existing.isAcceptedBySuggested()));
                        }, () -> {
                            MatchSuggestion suggestion = new MatchSuggestion();
                            suggestion.setUser(currentUser);
                            suggestion.setSuggestedUser(other);
                            suggestion.setScore(score);
                            MatchSuggestion savedSuggestion = matchSuggestionRepository.save(suggestion);
                            candidates.add(new MatchCandidate(savedSuggestion.getId(), other.getId(), other.getFirstName(), score, savedSuggestion.isAcceptedByUser(), savedSuggestion.isAcceptedBySuggested()));

                            // Add notification for new match here
                            notificationService.sendRealTimeNotification(
                                    currentUser.getId(),
                                    "New match found with " + other.getFirstName() + "! Check your matches."
                            );

                            notificationService.sendRealTimeNotification(
                                    other.getId(),
                                    "New match found with " + currentUser.getFirstName() + "! Check your matches."
                            );
                        });
            }
        }

        return candidates.stream()
                .sorted(Comparator.comparingDouble(MatchCandidate::score).reversed())
                .limit(topN)
                .toList();
    }
    /**
     * 1-we calculate the compatibility score
     * 2-we calculate the max score if the match was perfect
     * 3-return the actual compatibility percentage (ex:0.80->80%)
     * */
    private double calculateCompatibility(UserPreferences a, UserPreferences b) {
        int total=0,max=0;
        total+=preferenceMatchScore(a.getSleepSchedule(),b.getSleepSchedule(),a.getSleepScheduleImportance());
        max+=importanceWeight(a.getSleepScheduleImportance());

        total+=preferenceMatchScore(a.getCleanliness(),b.getCleanliness(),a.getCleanlinessImportance());
        max+=importanceWeight(a.getCleanlinessImportance());

        total+=preferenceMatchScore(a.getNoiseTolerance(),b.getNoiseTolerance(),a.getNoiseToleranceImportance());
        max+=importanceWeight(a.getNoiseToleranceImportance());

        total+=preferenceMatchScore(a.getStudyPreference(),b.getStudyPreference(),a.getStudyPreferenceImportance());
        max+=importanceWeight(a.getStudyPreferenceImportance());

        total+=preferenceMatchScore(a.getVisitorPolicy(),b.getVisitorPolicy(),a.getVisitorPolicyImportance());
        max+=importanceWeight(a.getVisitorPolicyImportance());

        total+=booleanMatchScore(a.getHasPets(),b.getHasPets(),a.getHasPetsImportance());
        max+=importanceWeight(a.getHasPetsImportance());

        total+=booleanMatchScore(a.getAcceptsPets(),b.getAcceptsPets(),a.getAcceptsPetsImportance());
        max+=importanceWeight(a.getAcceptsPetsImportance());

        if(max==0)return 0;
        return (double)total / max * 100;

    }



    /**
     * it takes two enums(preferences) and ImportanceLevel for references
     * if the preferences match (have the same Importnace it returns the weight)
     * if not and the Active User Preference is a MUST_HAVE it should give the lowest value
     * cauz they aren't a match (-99)
     * else it ll give 0 a simple mismatch
     * */
    private int preferenceMatchScore(Enum<?> a, Enum<?> b, ImportanceLevel level) {
        if (level == null) {
            level = ImportanceLevel.NEUTRAL; // Default to NEUTRAL if null
        }
        if(a==b)return importanceWeight(level);
        return (level == ImportanceLevel.MUST_HAVE)?-999:0;
    }
    private int booleanMatchScore(boolean a, boolean b, ImportanceLevel level) {
        if (level == null) {
            level = ImportanceLevel.NEUTRAL; // Default to NEUTRAL if null
        }
        if(a==b)return importanceWeight(level);
        return (level==ImportanceLevel.MUST_HAVE)?-999:0;
    }

    /**
     * Returns the preference_weight
     * each one on its own.
     * */
    private int importanceWeight(ImportanceLevel level) {
        if (level == null) {
            level = ImportanceLevel.NEUTRAL; // Default to NEUTRAL if null
        }
        return switch(level){
            case MUST_HAVE -> 20;
            case PREFERRED -> 10;
            case NEUTRAL -> 5;
        };
    }
    /**
     * for this method we only fetch for the potential matches(suggestions)
     * */
    public List<MatchCandidate> getPersistedSuggestions(User user) {
        // Get matches where current user is the suggester
        List<MatchCandidate> asSuggester = matchSuggestionRepository.findByUserOrderByScoreDesc(user)
                .stream()
                .map(s -> new MatchCandidate(
                        s.getId(),
                        s.getSuggestedUser().getId(),
                        s.getSuggestedUser().getFirstName(),
                        s.getScore(),
                        s.isAcceptedByUser(),
                        s.isAcceptedBySuggested()
                ))
                .toList();
        
        // Get matches where current user is the suggested user
        List<MatchCandidate> asSuggested = matchSuggestionRepository.findBySuggestedUserOrderByScoreDesc(user)
                .stream()
                .map(s -> new MatchCandidate(
                        s.getId(),
                        s.getUser().getId(),
                        s.getUser().getFirstName(),
                        s.getScore(),
                        s.isAcceptedBySuggested(), // Swap the flags for the reverse perspective
                        s.isAcceptedByUser()
                ))
                .toList();
        
        // Combine both lists and handle bidirectional matches properly
        Map<Long, MatchCandidate> matchMap = new HashMap<>();
        
        // Add suggester matches first
        for (MatchCandidate match : asSuggester) {
            matchMap.put(match.id(), match);
        }
        
        // Add suggested matches, but if there's already a match with this user,
        // merge the acceptance status to show the most complete picture
        for (MatchCandidate match : asSuggested) {
            if (matchMap.containsKey(match.id())) {
                // If we already have this user, merge the acceptance status
                MatchCandidate existing = matchMap.get(match.id());
                boolean bothAccepted = existing.acceptedByUser() && match.acceptedByUser();
                boolean bothAcceptedByOther = existing.acceptedBySuggested() && match.acceptedBySuggested();
                
                // Create a merged match with the combined acceptance status
                MatchCandidate merged = new MatchCandidate(
                    existing.matchId(),
                    existing.id(),
                    existing.firstName(),
                    existing.score(),
                    bothAccepted,
                    bothAcceptedByOther
                );
                matchMap.put(match.id(), merged);
            } else {
                matchMap.put(match.id(), match);
            }
        }
        
        return new ArrayList<>(matchMap.values());
    }


}





