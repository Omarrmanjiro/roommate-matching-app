package com.g2.roommateapp.dto;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDtO {
    private String id;
    private String roomId;
    private String senderId;
    private String senderEmail; // Instead of username
    private String content;
    private Instant timestamp;
    private MessageType type;

    public enum MessageType {
        CHAT, JOIN, LEAVE, MATCH_REQUEST
    }
}