package com.g2.roommateapp.controller;

import com.g2.roommateapp.dto.PreferencesRequest;
import com.g2.roommateapp.dto.PreferencesResponse;
import com.g2.roommateapp.service.JwtService;
import com.g2.roommateapp.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;
    private final JwtService jwtService;

    @GetMapping
    public PreferencesResponse get(@RequestHeader("Authorization") String token) {
        Long userId = jwtService.extractId(token);
        return preferencesService.getPreferences(userId);
    }

    @PutMapping
    public void update(@RequestHeader("Authorization") String token,
                       @RequestBody PreferencesRequest request) {
        Long userId = jwtService.extractId(token);
        preferencesService.updatePreferences(userId, request);
    }
}

