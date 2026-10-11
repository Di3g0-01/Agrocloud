package com.agrocloud.backend.subscription.controller;

import com.agrocloud.backend.security.UserPrincipal;
import com.agrocloud.backend.subscription.dto.CreateSubscriptionRequest;
import com.agrocloud.backend.subscription.dto.SubscriptionResponse;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import com.agrocloud.backend.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/suscripciones")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService service;

    @PostMapping
    public ResponseEntity<SubscriptionResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSubscriptionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createSubscription(principal.id(), request));
    }

    @GetMapping("/activa")
    public ResponseEntity<SubscriptionResponse> getActive(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(service.getActiveSubscription(principal.id()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<SubscriptionResponse>> getMySubscriptions(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(service.getUserSubscriptions(principal.id()));
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptionsByUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (!principal.isAdminOrSupport() && !principal.id().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.getUserSubscriptions(userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SOPORTE')")
    public ResponseEntity<List<SubscriptionResponse>> listAll() {
        return ResponseEntity.ok(service.getAllSubscriptions());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<SubscriptionResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam SubscriptionStatus status
    ) {
        return ResponseEntity.ok(service.updateSubscriptionStatus(id, status));
    }
}
