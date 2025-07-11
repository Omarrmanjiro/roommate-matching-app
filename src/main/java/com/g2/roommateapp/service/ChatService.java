package com.g2.roommateapp.service;

import com.g2.roommateapp.entity.ChatMessage;
import com.g2.roommateapp.repository.ChatMessageRepository;
import com.g2.roommateapp.repository.RoomRepository;
import com.g2.roommateapp.repository.UserRepository;
import com.g2.roommateapp.entity.Room;
import com.g2.roommateapp.entity.User;
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

    public ChatMessage saveMessage(String roomId, String senderEmail, String content) {
        ChatMessage message = ChatMessage.builder()
                .roomId(roomId)
                .senderEmail(senderEmail)
                .content(content)
                .type(ChatMessage.MessageType.CHAT)
                .timestamp(Instant.now())
                .build();

        return chatRepo.save(message);
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