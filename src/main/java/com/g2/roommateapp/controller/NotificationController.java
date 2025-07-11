package com.g2.roommateapp.controller;
import com.g2.roommateapp.entity.Notification;
import com.g2.roommateapp.enums.NotificationType;
import com.g2.roommateapp.repository.NotificationRepository;
import com.g2.roommateapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class NotificationController {
    @Autowired
    private final NotificationService notificationService;
    @Autowired
    private NotificationRepository notificationRepository;
    // Client can mark notifications as read
    @MessageMapping("/notifications/mark-read")
    public void handleMarkAsRead(
            @Payload Long notificationId,
            Principal principal) {

        // Optional: Add permission check

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientId().equals(principal.getName())) {
            throw new SecurityException("Cannot mark others' notifications as read");
        }

        notificationService.markAsRead(notificationId);
    }

    // Match request example
    @MessageMapping("/match/request")
    public void sendMatchRequest(
            @Payload String recipientId,
            Principal principal) {

        notificationService.sendNotification(
                recipientId,
                principal.getName(),
                "New match request!",
                NotificationType.MATCH_REQUEST
        );
    }

    // REST endpoint for testing notifications
    @PostMapping("/test/notification")
    public void testNotification(@RequestParam String recipientEmail, @RequestParam String content) {
        System.out.println("Testing notification to: " + recipientEmail + " with content: " + content);
        notificationService.sendNotification(
                recipientEmail,
                "system",
                content,
                NotificationType.SYSTEM_ALERT
        );
    }
}