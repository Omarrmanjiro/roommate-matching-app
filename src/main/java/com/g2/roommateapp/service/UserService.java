package com.g2.roommateapp.service;

import com.g2.roommateapp.dto.LoginRequest;
import com.g2.roommateapp.dto.RegisterRequest;
import com.g2.roommateapp.dto.ProfileUpdateRequest;
import com.g2.roommateapp.entity.User;
import com.g2.roommateapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    public void register(RegisterRequest registerRequest){
        User user = new User();
        user.setEmail(registerRequest.email);
        user.setPassword(passwordEncoder.encode(registerRequest.password));
        user.setFirstName(registerRequest.firstName);
        user.setLastName(registerRequest.lastName);
        user.setRole(registerRequest.role != null ? registerRequest.role : "USER");
        user.setStatus("INACTIVE");
        userRepository.save(user);
    }

    public String Login(LoginRequest request){
        User user=userRepository.findByEmail(request.email)
                .orElseThrow(()->new RuntimeException("User not found ") );
        if(!passwordEncoder.matches(request.password,user.getPassword())){
            throw new RuntimeException("Wrong password");
        }
        user.setStatus("ACTIVE");
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        return jwtService.generateToken(user);
    }


    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("INACTIVE");
        userRepository.save(user);
    }


    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(User user) {
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setFirstName(user.getFirstName());
        newUser.setLastName(user.getLastName());
        newUser.setStatus("INACTIVE"); // Set status as INACTIVE by default
        newUser.setRole("USER");
        return userRepository.save(newUser);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setEmail(updatedUser.getEmail());
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            if (updatedUser.getPassword() != null) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            return userRepository.save(user);
        });
    }

    public Optional<User> updateUserProfile(Long id, ProfileUpdateRequest request) {
        return userRepository.findById(id).map(user -> {
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            // Only update password if provided
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            return userRepository.save(user);
        });
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
