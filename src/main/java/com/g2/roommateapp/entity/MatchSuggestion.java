package com.g2.roommateapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Data
@NoArgsConstructor
@Entity
@Table(name = "match_suggestions")
public class MatchSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "suggested_user_id")
    private User suggestedUser;

    private double score;
    @Column(name = "accepted")
    private boolean acceptedByUser = false;

    private boolean acceptedBySuggested = false;


    @CreationTimestamp
    private LocalDateTime timestamp;


}

