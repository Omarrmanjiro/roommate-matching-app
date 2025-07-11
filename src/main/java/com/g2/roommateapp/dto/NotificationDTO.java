package com.g2.roommateapp.dto;

import com.g2.roommateapp.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String senderId;
    private String recipientId;
    private String content;
    private NotificationType type;
    private boolean isRead;
    private Instant createdAt;
}