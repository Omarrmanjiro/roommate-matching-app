package com.g2.roommateapp.service;
import com.g2.roommateapp.dto.*;
import com.g2.roommateapp.entity.MatchSuggestion;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.entity.UserPreferences;
import com.g2.roommateapp.enums.ImportanceLevel;
import com.g2.roommateapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MatchingService {
    @Autowired
    private MatchSuggestionRepository matchSuggestionRepository;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    public MatchingService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        List<User> allUser=userRepository.findAllExcept(currentUser.getId());
        List<MatchCandidate> candidates=new ArrayList<>();

        for(User other:allUser){
            if(other.getPreferences()==null)continue;
            double score =calculateCompatibility(currentUser.getPreferences(),other.getPreferences());


            if (score > 0) {
                candidates.add(new MatchCandidate(other.getId(), other.getFirstName(), score));

                matchSuggestionRepository.findByUserAndSuggestedUser(currentUser, other)
                        .ifPresentOrElse(existing -> {
                            existing.setScore(score);
                            matchSuggestionRepository.save(existing);
                        }, () -> {
                            MatchSuggestion suggestion = new MatchSuggestion();
                            suggestion.setUser(currentUser);
                            suggestion.setSuggestedUser(other);
                            suggestion.setScore(score);
                            matchSuggestionRepository.save(suggestion);
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
    private double calculateCompatibility(UserPreferences a,UserPreferences b){
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

        total+=booleanMatchScore(a.isHasPets(),b.isHasPets(),a.getHasPetsImportance());
        max+=importanceWeight(a.getHasPetsImportance());

        total+=booleanMatchScore(a.isAcceptsPets(),b.isAcceptsPets(),a.getAcceptsPetsImportance());
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
    private int preferenceMatchScore(Enum<?>a, Enum<?>b, ImportanceLevel level){
        if(a==b)return importanceWeight(level);
        return (level == ImportanceLevel.MUST_HAVE)?-999:0;
    }
    private int booleanMatchScore(boolean a,boolean b,ImportanceLevel level){
        if(a==b)return importanceWeight(level);
        return (level==ImportanceLevel.MUST_HAVE)?-999:0;
    }

    /**
     * Returns the preference_weight
     * each one on its own.
     * */
    private int importanceWeight(ImportanceLevel level){
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
        return matchSuggestionRepository.findByUserOrderByScoreDesc(user)
                .stream()
                .map(s -> new MatchCandidate(
                        s.getSuggestedUser().getId(),
                        s.getSuggestedUser().getFirstName(),
                        s.getScore()
                ))
                .toList();
    }



}





