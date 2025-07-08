package com.g2.roommateapp.service;

import com.g2.roommateapp.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    // Secure key used to sign and verify the token
    private static final String SECRET = "my-super-secret-key-123456789012345678901234"; // must be at least 32 characters

    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));


    // Token expiration = 24 hours
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    /**
     * Generates a JWT token with user's email, id, and role.
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("id", user.getId())               // ✅ Include user ID
                .claim("role", user.getRole())           // Optional: include role
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    /**
     * Extract email (subject) from token
     */
    public String extractEmail(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(cleanToken(token))
                .getBody()
                .getSubject();
    }

    /**
     * Extract user ID from token
     */
    public Long extractId(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(cleanToken(token))
                .getBody()
                .get("id", Long.class);
    }

    /**
     * Helper to remove Bearer prefix from Authorization header
     */
    public String cleanToken(String token) {
        return token.replace("Bearer", "").trim();
    }

    /**
     * Optional: Validate token expiration or signature, etc.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(cleanToken(token));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
