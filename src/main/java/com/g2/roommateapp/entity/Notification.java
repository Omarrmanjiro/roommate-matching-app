package com.g2.roommateapp.entity;

import com.g2.roommateapp.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipientId; // Matches user ID or email
    private String senderId;
    private String content;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private boolean isRead;
    private Instant createdAt;

}