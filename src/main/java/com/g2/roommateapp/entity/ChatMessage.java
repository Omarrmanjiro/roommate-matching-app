package com.g2.roommateapp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId; // Format: "user1Id_user2Id" or "matchId"
    private String senderEmail;
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    private Instant timestamp;

    public enum MessageType {
        CHAT, JOIN, LEAVE, MATCH_REQUEST
    }
}