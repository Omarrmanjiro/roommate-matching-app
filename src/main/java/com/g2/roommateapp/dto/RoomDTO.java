package com.g2.roommateapp.dto;

import com.g2.roommateapp.entity.Room;
import com.g2.roommateapp.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class RoomDTO {
    private Long id;
    private LocalDateTime createdAt;
    private List<UserInfo> roommates;


    public RoomDTO(Room room, Long currentUserId) {
        this.id = room.getId();
        this.createdAt = room.getCreatedAt();

        // Create list from user1 and user2, filter out current user
        this.roommates = Arrays.asList(room.getUser1(), room.getUser2()).stream()
                .filter(user -> user != null && !user.getId().equals(currentUserId))
                .map(UserInfo::new)
                .collect(Collectors.toList());
    }

    @Data
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;

        public UserInfo(User user) {
            this.id = user.getId();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.email = user.getEmail();
        }
    }
}

