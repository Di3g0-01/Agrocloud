package com.agrocloud.backend.subscription.dto;

import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        String planId,
        @JsonProperty("planNombre") String planName,
        @JsonProperty("usuarioId") UUID userId,
        @JsonProperty("estado") SubscriptionStatus status,
        @JsonProperty("fechaInicio") LocalDate startDate,
        @JsonProperty("fechaProximoPago") LocalDate nextBillingDate,
        @JsonProperty("monto") BigDecimal amount
) {
    public static SubscriptionResponse from(SubscriptionEntity subscription) {
        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getPlan().getId(),
                subscription.getPlan().getName(),
                subscription.getUser().getId(),
                subscription.getStatus(),
                subscription.getStartDate(),
                subscription.getNextBillingDate(),
                subscription.getAmount()
        );
    }
}
