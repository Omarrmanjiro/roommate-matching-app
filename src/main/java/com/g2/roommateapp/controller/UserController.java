package com.g2.roommateapp.controller;

import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    @Autowired
    private UserService userService;

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
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //List of all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
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
