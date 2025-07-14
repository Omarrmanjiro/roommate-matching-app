package com.g2.roommateapp.controller;

import com.g2.roommateapp.dto.UserDTO;
import com.g2.roommateapp.dto.ProfileUpdateRequest;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.service.UserService;
import com.g2.roommateapp.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/Auth")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;

    //creating user
    @PostMapping
    public ResponseEntity<String> createUser(@Valid @RequestBody User user) {
        if (userService.emailExists(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        userService.createUser(user);
        return ResponseEntity.ok("User created successfully");
    }

    //Getting a single user
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(UserDTO::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    //Get current user profile
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getCurrentUserProfile(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtService.extractId(token);
            return userService.getUserById(userId)
                    .map(UserDTO::new)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }
    
    //Update current user profile
    @PutMapping("/profile")
    public ResponseEntity<String> updateCurrentUserProfile(@RequestHeader("Authorization") String token, 
                                                          @Valid @RequestBody ProfileUpdateRequest request) {
        try {
            Long userId = jwtService.extractId(token);
            return userService.updateUserProfile(userId, request)
                    .map(user -> ResponseEntity.ok("Profile updated successfully"))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(403).build();
        }
    }
    
    //Test authentication endpoint
    @GetMapping("/test")
    public ResponseEntity<String> testAuth(@RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtService.extractId(token);
            return ResponseEntity.ok("Authentication successful! User ID: " + userId);
        } catch (Exception e) {
            return ResponseEntity.status(403).body("Authentication failed: " + e.getMessage());
        }
    }

    //List of all users
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    //updating user
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @Valid @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser)
                .map(user -> ResponseEntity.ok("User updated successfully"))
                .orElse(ResponseEntity.notFound().build());
    }

    //deleting user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok("User deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

}
