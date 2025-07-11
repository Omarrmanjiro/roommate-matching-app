package com.g2.roommateapp.dto;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingNotificationDto {
    private String roomId;
    private String userId;
    private String userEmail;
    private boolean isTyping;
    private Instant timestamp;
}