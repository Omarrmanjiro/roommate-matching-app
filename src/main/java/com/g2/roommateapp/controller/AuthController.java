package com.g2.roommateapp.controller;


import com.g2.roommateapp.dto.LoginRequest;
import com.g2.roommateapp.dto.RegisterRequest;
import com.g2.roommateapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/Auth")

public class AuthController {
    @Autowired private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest request) {
        userService.register(request);
        return ResponseEntity.ok("User registration success");
    }
    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@RequestBody LoginRequest request) {
        String token = userService.Login(request);
        return ResponseEntity.ok(Map.of("token",token));
    }
}
