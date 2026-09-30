package com.agrocloud.backend.subscription.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateSubscriptionRequest(
        @NotBlank(message = "El ID del plan es obligatorio")
        String planId
) {}
