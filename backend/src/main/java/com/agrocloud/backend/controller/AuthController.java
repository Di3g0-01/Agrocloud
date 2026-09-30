package com.agrocloud.backend.controller;

import com.agrocloud.backend.dto.AuthResponse;
import com.agrocloud.backend.dto.LoginRequest;
import com.agrocloud.backend.dto.RegisterRequest;
import com.agrocloud.backend.dto.UserResponse;
import com.agrocloud.backend.security.UserPrincipal;
import com.agrocloud.backend.service.CurrentUserService;
import com.agrocloud.backend.service.LoginService;
import com.agrocloud.backend.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final RegistrationService registrationService;
    private final LoginService loginService;
    private final CurrentUserService currentUserService;

    public AuthController(
            RegistrationService registrationService,
            LoginService loginService,
            CurrentUserService currentUserService
    ) {
        this.registrationService = registrationService;
        this.loginService = loginService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/register")
    ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registrationService.register(request));
    }

    @PostMapping("/login")
    ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(loginService.login(request));
    }

    @GetMapping("/me")
    ResponseEntity<UserResponse> currentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(currentUserService.currentUser(principal));
    }
}
