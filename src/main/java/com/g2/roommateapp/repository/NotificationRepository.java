package com.g2.roommateapp.repository;

import com.g2.roommateapp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(String recipientId);
    List<Notification> findByRecipientId(String recipientId);
}