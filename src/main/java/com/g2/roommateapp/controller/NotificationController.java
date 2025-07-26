package com.g2.roommateapp.controller;
import com.g2.roommateapp.entity.Notification;
import com.g2.roommateapp.enums.NotificationType;
import com.g2.roommateapp.repository.NotificationRepository;
import com.g2.roommateapp.service.NotificationService;
import com.g2.roommateapp.service.JwtService;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.repository.UserRepository;
import com.g2.roommateapp.dto.MatchCandidate;
import com.g2.roommateapp.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class NotificationController {
    @Autowired
    private final NotificationService notificationService;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MatchingService matchingService;

    // REST endpoint to get user notifications
    @GetMapping("/api/notifications")
    @ResponseBody
    public List<Notification> getUserNotifications(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId().toString());
    }

    // REST endpoint to mark notification as read
    @PutMapping("/api/notifications/{id}/read")
    @ResponseBody
    public String markNotificationAsRead(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getRecipientId().equals(user.getId().toString())) {
            throw new SecurityException("Cannot mark others' notifications as read");
        }
        
        notificationService.markAsRead(id);
        return "Notification marked as read";
    }

    // REST endpoint to get unread count
    @GetMapping("/api/notifications/unread-count")
    @ResponseBody
    public Long getUnreadCount(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId().toString());
    }

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

    // Clear old notifications (for testing)
    @DeleteMapping("/api/notifications/clear")
    @ResponseBody
    public String clearNotifications(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<Notification> userNotifications = notificationRepository.findByRecipientId(user.getId().toString());
        notificationRepository.deleteAll(userNotifications);
        
        return "Cleared " + userNotifications.size() + " notifications";
    }

    // Clear notifications with room numbers (old format)
    @DeleteMapping("/api/notifications/clear-old")
    @ResponseBody
    public String clearOldNotifications(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<Notification> userNotifications = notificationRepository.findByRecipientId(user.getId().toString());
        long deletedCount = userNotifications.stream()
                .filter(n -> n.getContent().contains("Room:"))
                .peek(n -> notificationRepository.delete(n))
                .count();
        
        return "Cleared " + deletedCount + " old notifications with room numbers";
    }

    // Create test notification without room number
    @PostMapping("/api/notifications/test")
    @ResponseBody
    public String createTestNotification(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        
        notificationService.sendNotification(
                user.getId().toString(),
                "system",
                "Test message without room number",
                NotificationType.MESSAGE
        );
        
        return "Created test notification";
    }

    // Debug endpoint to check match status
    @GetMapping("/api/matches/debug")
    @ResponseBody
    public String debugMatches(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<MatchCandidate> matches = matchingService.getPersistedSuggestions(user);
        StringBuilder debug = new StringBuilder();
        debug.append("User: ").append(user.getFirstName()).append(" (").append(user.getId()).append(")\n");
        debug.append("Total matches: ").append(matches.size()).append("\n");
        
        for (MatchCandidate match : matches) {
            debug.append("Match ID: ").append(match.matchId())
                 .append(", Other User: ").append(match.firstName()).append(" (").append(match.id()).append(")")
                 .append(", Score: ").append(match.score())
                 .append(", Accepted by user: ").append(match.acceptedByUser())
                 .append(", Accepted by suggested: ").append(match.acceptedBySuggested())
                 .append("\n");
        }
        
        return debug.toString();
    }
}