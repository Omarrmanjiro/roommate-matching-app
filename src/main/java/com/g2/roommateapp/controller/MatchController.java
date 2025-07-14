package com.g2.roommateapp.controller;

import com.g2.roommateapp.dto.MatchAcceptance;
import com.g2.roommateapp.dto.MatchCandidate;
import com.g2.roommateapp.dto.RoomDTO;
import com.g2.roommateapp.entity.MatchSuggestion;
import com.g2.roommateapp.entity.Room;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.enums.NotificationType;
import com.g2.roommateapp.repository.MatchSuggestionRepository;
import com.g2.roommateapp.repository.RoomRepository;
import com.g2.roommateapp.repository.UserRepository;
import com.g2.roommateapp.service.JwtService;
import com.g2.roommateapp.service.MatchingService;
import com.g2.roommateapp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequestMapping("/api/matches")
@RestController
@RequiredArgsConstructor
public class MatchController {
    @Autowired
    private final MatchingService matchingService;
    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final MatchSuggestionRepository matchSuggestionRepository;
    @Autowired
    private final RoomRepository roomRepository;
    @Autowired
    private final NotificationService notificationService;


    @GetMapping("/top")
    public ResponseEntity<List<MatchCandidate>> getTopMatches(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "5") int topN) {
        /**
         * we use jwt
         * generete token
         * use the token to get the email
         * use the email to get the user ^^ <3
         */
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        List<MatchCandidate> matches = matchingService.getTopMatches(currentUser, topN);
        return ResponseEntity.ok(matches);
    }
/***
 * this method is best on the score we get suggestion check the matching service
 * */
    @GetMapping("/suggestions")
    public List<MatchCandidate> getSavedSuggestions(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        return matchingService.getPersistedSuggestions(currentUser);
    }
    /**
     * this method is both a req and acpt
     * if the accepted and accepted_by_suggested column are true
     * good we automatically create a room
     * */

    @PostMapping("/accept")
    public ResponseEntity<String> acceptMatch(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MatchAcceptance request
    ) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        Optional<MatchSuggestion> matchOpt = matchSuggestionRepository.findById(request.getMatchId());
        if (matchOpt.isEmpty()) {
            System.out.println("[ACCEPT] Match not found for id: " + request.getMatchId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Match not found");
        }

        MatchSuggestion match = matchOpt.get();
        System.out.println("[ACCEPT] Found match: " + match.getId() + " - User: " + match.getUser().getEmail() + " -> Suggested: " + match.getSuggestedUser().getEmail());

        // Determine if current user is the suggester or the suggested
        boolean isUser = match.getUser().getId().equals(currentUser.getId());
        boolean isSuggested = match.getSuggestedUser().getId().equals(currentUser.getId());

        if (!isUser && !isSuggested) {
            System.out.println("[ACCEPT] Current user is not part of this match suggestion.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized for this match");
        }

        // Update the correct flag based on which user is accepting
        if (isUser) {
            match.setAcceptedByUser(true);
            System.out.println("[ACCEPT] User " + currentUser.getEmail() + " accepted as the suggester");
        } else if (isSuggested) {
            match.setAcceptedBySuggested(true);
            System.out.println("[ACCEPT] User " + currentUser.getEmail() + " accepted as the suggested user");
        }
        
        matchSuggestionRepository.save(match);
        System.out.println("[ACCEPT] Saved match with acceptedByUser=" + match.isAcceptedByUser() + ", acceptedBySuggested=" + match.isAcceptedBySuggested());

        // Also update the reverse match if it exists
        Optional<MatchSuggestion> reverseOpt = matchSuggestionRepository
                .findByUserIdAndSuggestedUserId(match.getSuggestedUser().getId(), match.getUser().getId());
        
        if (reverseOpt.isPresent()) {
            MatchSuggestion reverse = reverseOpt.get();
            if (isUser) {
                // Current user is the suggester, so update the reverse match's accepted_by_suggested
                reverse.setAcceptedBySuggested(true);
                System.out.println("[ACCEPT] Updated reverse match acceptedBySuggested to true");
            } else if (isSuggested) {
                // Current user is the suggested, so update the reverse match's acceptedByUser
                reverse.setAcceptedByUser(true);
                System.out.println("[ACCEPT] Updated reverse match acceptedByUser to true");
            }
            matchSuggestionRepository.save(reverse);
        }

        // Check for mutual acceptance - simplified logic
        boolean mutualAcceptance = false;
        
        // Check if both users have accepted in this direction
        if (match.isAcceptedByUser() && match.isAcceptedBySuggested()) {
            mutualAcceptance = true;
            System.out.println("[ACCEPT] Both users accepted in this direction");
        } else {
            // Check the reverse direction
            if (reverseOpt.isPresent()) {
                MatchSuggestion reverse = reverseOpt.get();
                System.out.println("[ACCEPT] Found reverse match: " + reverse.getId() + " - acceptedByUser=" + reverse.isAcceptedByUser() + ", acceptedBySuggested=" + reverse.isAcceptedBySuggested());
                
                // For mutual acceptance, we need:
                // User A has accepted User B's suggestion (match.acceptedByUser = true)
                // User B has accepted User A's suggestion (reverse.acceptedByUser = true)
                if (match.isAcceptedByUser() && reverse.isAcceptedByUser()) {
                    mutualAcceptance = true;
                    System.out.println("[ACCEPT] Both users have accepted each other's suggestions");
                }
            } else {
                System.out.println("[ACCEPT] No reverse match found");
            }
        }

        // Create room if mutual acceptance is achieved
        if (mutualAcceptance) {
            // Check if room already exists
            boolean roomExists = roomRepository.existsByUser1AndUser2(match.getUser(), match.getSuggestedUser())
                    || roomRepository.existsByUser2AndUser1(match.getUser(), match.getSuggestedUser());
            
            if (!roomExists) {
                Room room = new Room();
                room.setUser1(match.getUser());
                room.setUser2(match.getSuggestedUser());
                roomRepository.save(room);
                System.out.println("[ACCEPT] ✅ Room created for users: " + match.getUser().getEmail() + " and " + match.getSuggestedUser().getEmail());
                return ResponseEntity.ok("Match accepted and room created!");
            } else {
                System.out.println("[ACCEPT] Room already exists for users: " + match.getUser().getEmail() + " and " + match.getSuggestedUser().getEmail());
                return ResponseEntity.ok("You're already matched with this user");
            }
        } else {
            System.out.println("[ACCEPT] ❌ Both users have not accepted yet. No room created.");
        }

        return ResponseEntity.ok("Match accepted");
    }
    /**
     * Fetch for the rooms nothing special
     * */
    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDTO>> getUserRooms(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtService.extractEmail(token);
        User currentUser = userRepository.findByEmail(email).orElseThrow();

        // Use the correct method for user1/user2 structure
        List<Room> rooms = roomRepository.findByUser1OrUser2(currentUser, currentUser);

        List<RoomDTO> roomDTOs = rooms.stream()
                .map(room -> new RoomDTO(room, currentUser.getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(roomDTOs);
    }


    // When a user sends a match request
    @PostMapping("/matches/request/{targetUserId}")
    public void sendMatchRequest(
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal User currentUser) {

        notificationService.sendNotification(
                targetUserId.toString(),
                currentUser.getId().toString(),
                "New match request from " + currentUser.getFirstName(),
                NotificationType.MATCH_REQUEST
        );
    }
}



