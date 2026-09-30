package com.agrocloud.backend.service;

import com.agrocloud.backend.dto.AuthResponse;
import com.agrocloud.backend.dto.UserResponse;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.security.JwtService;
import org.springframework.stereotype.Component;

@Component
public class AuthResponseFactory {

    private final JwtService jwtService;

    public AuthResponseFactory(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public AuthResponse create(User user) {
        return AuthResponse.bearer(
                jwtService.generateToken(user),
                jwtService.expirationSeconds(),
                UserResponse.from(user)
        );
    }
}
