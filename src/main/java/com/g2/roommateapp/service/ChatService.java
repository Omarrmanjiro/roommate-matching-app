package com.g2.roommateapp.service;

import com.g2.roommateapp.entity.ChatMessage;
import com.g2.roommateapp.repository.ChatMessageRepository;
import com.g2.roommateapp.repository.RoomRepository;
import com.g2.roommateapp.repository.UserRepository;
import com.g2.roommateapp.entity.Room;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.service.NotificationService;
import com.g2.roommateapp.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatRepo;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ChatMessage saveMessage(String roomId, String senderEmail, String content) {
        ChatMessage message = ChatMessage.builder()
                .roomId(roomId)
                .senderEmail(senderEmail)
                .content(content)
                .type(ChatMessage.MessageType.CHAT)
                .timestamp(Instant.now())
                .build();

        ChatMessage savedMessage = chatRepo.save(message);
        
        // Create notification for the other user in the room
        try {
            Optional<Room> roomOpt = roomRepository.findById(Long.parseLong(roomId));
            if (roomOpt.isPresent()) {
                Room room = roomOpt.get();
                User sender = userRepository.findByEmail(senderEmail).orElse(null);
                
                if (sender != null) {
                    // Determine the recipient (the other user in the room)
                    User recipient = null;
                    if (room.getUser1().getId().equals(sender.getId())) {
                        recipient = room.getUser2();
                    } else if (room.getUser2().getId().equals(sender.getId())) {
                        recipient = room.getUser1();
                    }
                    
                    if (recipient != null) {
                        // Include roomId in the notification content for navigation but don't display it
                        String notificationContent = String.format("New message from %s: %s", 
                            sender.getFirstName(), content);
                        
                        notificationService.sendNotification(
                                recipient.getId().toString(),
                                sender.getId().toString(),
                                notificationContent,
                                NotificationType.MESSAGE
                        );
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the message save
            System.err.println("Error creating notification for message: " + e.getMessage());
        }
        
        return savedMessage;
    }

    public List<ChatMessage> getRoomHistory(String roomId) {
        return chatRepo.findByRoomIdOrderByTimestampAsc(roomId);
    }

    public boolean isUserInRoom(String roomId, String userEmail) {
        Optional<Room> roomOpt = roomRepository.findById(Long.parseLong(roomId));
        if (roomOpt.isEmpty()) return false;
        Room room = roomOpt.get();
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return false;
        if (user.equals(room.getUser1()) || user.equals(room.getUser2())) return true;
        if (room.getUsers() != null && room.getUsers().contains(user)) return true;
        return false;
    }
}