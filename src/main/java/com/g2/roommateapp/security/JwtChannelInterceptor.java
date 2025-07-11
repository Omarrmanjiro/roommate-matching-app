package com.g2.roommateapp.security;

import com.g2.roommateapp.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import com.g2.roommateapp.security.CustomUserDetailsService;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(JwtChannelInterceptor.class);

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Only process if accessor is not null and this is a CONNECT frame
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            logger.info("STOMP CONNECT received");
            List<String> authorization = accessor.getNativeHeader("Authorization");
            logger.info("Authorization header: {}", authorization);

            if (authorization != null && !authorization.isEmpty()) {
                String authHeader = authorization.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String jwt = authHeader.substring(7);
                    String userEmail = jwtService.extractEmail(jwt);
                    logger.info("Extracted email from JWT: {}", userEmail);

                    if (userEmail != null) {
                        try {
                            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                            if (jwtService.isTokenValid(jwt) && userEmail.equals(userDetails.getUsername())) {
                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                                // Always set the user on the accessor for WebSocket session
                                accessor.setUser(authToken);
                                // Optionally set in SecurityContextHolder (not always needed for WebSocket)
                                SecurityContextHolder.getContext().setAuthentication(authToken);
                                logger.info("WebSocket authentication SUCCESS for user: {}", userEmail);
                            } else {
                                logger.warn("JWT is not valid or user email does not match user details");
                            }
                        } catch (Exception e) {
                            logger.error("Exception during WebSocket authentication: {}", e.getMessage(), e);
                        }
                    } else {
                        logger.warn("No userEmail extracted from JWT");
                    }
                } else {
                    logger.warn("Authorization header does not start with Bearer");
                }
            } else {
                logger.warn("No Authorization header present in STOMP CONNECT");
            }
        }
        return message;
    }
}