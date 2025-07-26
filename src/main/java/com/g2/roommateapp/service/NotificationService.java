package com.g2.roommateapp.service;

import com.g2.roommateapp.entity.Notification;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.enums.NotificationType;
import com.g2.roommateapp.repository.NotificationRepository;
import com.g2.roommateapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor // Lombok will handle constructor injection
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository; // Add this line
    private final SimpMessagingTemplate messagingTemplate;

    public void sendRealTimeNotification(Long recipientId, String message) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + recipientId));

        Notification notification = Notification.builder()
                .recipientId(recipient.getId().toString())
                .senderId("system")
                .content(message)
                .type(NotificationType.MATCH_REQUEST)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                recipient.getId().toString(),
                "/queue/notifications",
                notification
        );
    }


    public void sendNotification(String recipientId, String senderId,
                                 String content, NotificationType type) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .content(content)
                .type(type)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        notificationRepository.save(notification);

        // Since the WebSocket user destination is set to email, we use the email directly
        System.out.println("Sending notification to user: " + recipientId + " with content: " + content);
        
        messagingTemplate.convertAndSendToUser(
                recipientId, // Use email directly since that's what the WebSocket user destination is set to
                "/queue/notifications",
                notification
        );
    }


    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);

            // Optional: Send update to client
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipientId(),
                    "/queue/notifications/read",
                    Map.of("id", notificationId, "status", "read")
            );
        });
    }
}