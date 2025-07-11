package com.g2.roommateapp.controller;

import com.g2.roommateapp.dto.ChatMessageDtO;
import com.g2.roommateapp.entity.ChatMessage;
import com.g2.roommateapp.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    public void handleMessage(
            @Payload ChatMessageDtO chatMessage,
            Principal principal) {

        String roomId = chatMessage.getRoomId();
        System.out.println("handleMessage called with: " + chatMessage);

        // Only allow if user is in the room
        if (!chatService.isUserInRoom(roomId, principal.getName())) {
            System.out.println("User " + principal.getName() + " is not in room " + roomId);
            return;
        }

        ChatMessage savedMessage = chatService.saveMessage(
                roomId,
                principal.getName(),
                chatMessage.getContent()
        );
        System.out.println("Saved message: " + savedMessage);

        // Map entity to DTO for broadcast
        ChatMessageDtO dto = new ChatMessageDtO();
        dto.setId(savedMessage.getId() != null ? savedMessage.getId().toString() : null);
        dto.setRoomId(savedMessage.getRoomId());
        dto.setSenderEmail(savedMessage.getSenderEmail());
        dto.setContent(savedMessage.getContent());
        dto.setTimestamp(savedMessage.getTimestamp());
        dto.setType(ChatMessageDtO.MessageType.valueOf(savedMessage.getType().name()));

        // Broadcast the DTO
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, dto);
        System.out.println("Broadcasted DTO to /topic/chat/" + roomId);

        // Test: broadcast a string
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, "test-broadcast");
        System.out.println("Broadcasted test string to /topic/chat/" + roomId);
    }

    @MessageMapping("/chat/{roomId}/history")
    @SendToUser("/queue/history/{roomId}")
    public List<ChatMessage> getHistory(
            @DestinationVariable String roomId) {

        return chatService.getRoomHistory(roomId);
    }

    // HTTP endpoint for chat history
    @GetMapping("/chat/{roomId}/history")
    @ResponseBody
    public List<ChatMessage> getChatHistory(
            @PathVariable String roomId,
            Principal principal) {
        
        // Only allow if user is in the room
        if (!chatService.isUserInRoom(roomId, principal.getName())) {
            return List.of(); // Return empty list if not authorized
        }
        
        return chatService.getRoomHistory(roomId);
    }
}