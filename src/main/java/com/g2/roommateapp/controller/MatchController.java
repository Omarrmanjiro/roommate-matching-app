package com.g2.roommateapp.controller;

import com.g2.roommateapp.dto.MatchAcceptance;
import com.g2.roommateapp.dto.MatchCandidate;
import com.g2.roommateapp.dto.RoomDTO;
import com.g2.roommateapp.entity.MatchSuggestion;
import com.g2.roommateapp.entity.Room;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.repository.MatchSuggestionRepository;
import com.g2.roommateapp.repository.RoomRepository;
import com.g2.roommateapp.repository.UserRepository;
import com.g2.roommateapp.service.JwtService;
import com.g2.roommateapp.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequestMapping("/users/match")
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
    private RoomRepository roomRepository;


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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Match not found");
        }

        MatchSuggestion match = matchOpt.get();

        
        if (match.getUser().equals(currentUser)) {
            match.setAcceptedByUser(true);
        } else if (match.getSuggestedUser().equals(currentUser)) {
            match.setAcceptedBySuggested(true);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized to accept this match");
        }

        matchSuggestionRepository.save(match);

        // Check if both users have accepted to create a room
        if (match.isAcceptedByUser() && match.isAcceptedBySuggested()) {
            Room room = new Room();
            room.setUser1(match.getUser());
            room.setUser2(match.getSuggestedUser());
            roomRepository.save(room);
        }

        return ResponseEntity.ok("Match accepted successfully");
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
}



