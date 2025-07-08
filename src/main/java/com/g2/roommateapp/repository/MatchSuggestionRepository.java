package com.g2.roommateapp.repository;

import com.g2.roommateapp.entity.MatchSuggestion;
import com.g2.roommateapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchSuggestionRepository extends JpaRepository<MatchSuggestion, Long> {
    Optional<MatchSuggestion> findByUserAndSuggestedUser(User user, User suggestedUser);
    List<MatchSuggestion> findAllByUser(User user);
    List<MatchSuggestion> findByUserOrderByScoreDesc(User user);
}

