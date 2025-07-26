package com.g2.roommateapp.dto;

import lombok.Data;



public record MatchCandidate(Long matchId, Long id, String firstName, double score, boolean acceptedByUser, boolean acceptedBySuggested) {}
