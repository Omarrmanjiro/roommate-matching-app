package com.g2.roommateapp.controller;

import com.g2.roommateapp.dto.PreferencesRequest;
import com.g2.roommateapp.dto.PreferencesResponse;
import com.g2.roommateapp.service.JwtService;
import com.g2.roommateapp.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<?> get(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtService.extractId(token);
            PreferencesResponse response = preferencesService.getPreferences(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Failed to get preferences: " + e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<?> update(@RequestHeader("Authorization") String token,
                       @RequestBody PreferencesRequest request) {
        try {
            Long userId = jwtService.extractId(token);
            preferencesService.updatePreferences(userId, request);
            PreferencesResponse response = preferencesService.getPreferences(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Failed to update preferences: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserPreferences(@PathVariable Long userId, 
                                               @RequestHeader("Authorization") String token) {
        try {
            // Verify the requesting user is authenticated
            Long requestingUserId = jwtService.extractId(token);
            
            // Get the target user's preferences
            PreferencesResponse response = preferencesService.getPreferences(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Failed to get user preferences: " + e.getMessage());
        }
    }
}

