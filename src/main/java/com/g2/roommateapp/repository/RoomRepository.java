package com.g2.roommateapp.repository;

import com.g2.roommateapp.entity.Room;
import com.g2.roommateapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    // Optional: to avoid duplicate room creation
    boolean existsByUser1AndUser2(User user1, User user2);
    boolean existsByUser2AndUser1(User user2, User user1);
    List<Room> findByUser1OrUser2(User user1, User user2);

}
