package com.agrocloud.backend.controller;

import com.agrocloud.backend.dto.AuthResponse;
import com.agrocloud.backend.dto.EmailRequest;
import com.agrocloud.backend.dto.EmailTokenRequest;
import com.agrocloud.backend.dto.MessageResponse;
import com.agrocloud.backend.dto.ResetPasswordRequest;
import com.agrocloud.backend.service.EmailAccountService;
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
    private final EmailAccountService emailAccounts;

    public AuthController(
            RegistrationService registrationService,
            LoginService loginService,
            CurrentUserService currentUserService,
            EmailAccountService emailAccounts
    ) {
        this.registrationService = registrationService;
        this.loginService = loginService;
        this.currentUserService = currentUserService;
        this.emailAccounts = emailAccounts;
    }

    @PostMapping("/register")
    ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
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

    @PostMapping("/verify-email")
    AuthResponse verify(@Valid @RequestBody EmailTokenRequest request) {
        return emailAccounts.verify(request.token());
    }

    @PostMapping("/resend-verification")
    MessageResponse resend(@Valid @RequestBody EmailRequest request) {
        return emailAccounts.resend(request.email());
    }

    @PostMapping("/forgot-password")
    MessageResponse forgot(@Valid @RequestBody EmailRequest request) {
        return emailAccounts.forgotPassword(request.email());
    }

    @PostMapping("/reset-password")
    MessageResponse reset(@Valid @RequestBody ResetPasswordRequest request) {
        return emailAccounts.resetPassword(request.token(), request.password());
    }
}
