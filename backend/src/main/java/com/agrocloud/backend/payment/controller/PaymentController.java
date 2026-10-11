package com.agrocloud.backend.payment.controller;

import com.agrocloud.backend.payment.dto.CreatePaymentRequest;
import com.agrocloud.backend.payment.dto.PaymentResponse;
import com.agrocloud.backend.payment.service.PaymentService;
import com.agrocloud.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> registerPayment(
            @Valid @RequestBody CreatePaymentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.registerPayment(request));
    }

    @GetMapping("/suscripcion/{subscriptionId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsBySubscription(
            @PathVariable UUID subscriptionId
    ) {
        return ResponseEntity.ok(paymentService.getPaymentsBySubscription(subscriptionId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(principal.id()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SOPORTE')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
