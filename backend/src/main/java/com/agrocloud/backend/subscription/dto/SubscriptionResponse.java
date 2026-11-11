package com.agrocloud.backend.subscription.dto;

import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        String planId,
        @JsonProperty("planNombre") String planName,
        @JsonProperty("usuarioId") UUID userId,
        @JsonProperty("estado") SubscriptionStatus status,
        @JsonProperty("fechaInicio") LocalDate startDate,
        @JsonProperty("fechaProximoPago") LocalDate nextBillingDate,
        @JsonProperty("monto") BigDecimal amount,
        @JsonProperty("cancelacionProgramada") Boolean cancelAtPeriodEnd,
        @JsonProperty("fechaCancelacion") LocalDate cancellationDate,
        @JsonProperty("complementos") List<String> complementos,
        @JsonProperty("maxInstancias") Integer maxInstances,
        @JsonProperty("almacenamientoGb") Double storageGb
) {
    public static SubscriptionResponse from(SubscriptionEntity subscription) {
        int effectiveMax = subscription.getMaxInstances() != null
                ? subscription.getMaxInstances()
                : (subscription.getPlan() != null && subscription.getPlan().getMaxInstances() != null
                    ? subscription.getPlan().getMaxInstances()
                    : 1);

        double effectiveStorage = subscription.getStorageGb() != null
                ? subscription.getStorageGb()
                : (subscription.getPlan() != null && subscription.getPlan().getStorageGb() != null
                    ? subscription.getPlan().getStorageGb()
                    : 10.0);

        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getPlan() != null ? subscription.getPlan().getId() : null,
                subscription.getPlan() != null ? subscription.getPlan().getName() : null,
                subscription.getUser() != null ? subscription.getUser().getId() : null,
                subscription.getStatus(),
                subscription.getStartDate(),
                subscription.getNextBillingDate(),
                subscription.getAmount(),
                Boolean.TRUE.equals(subscription.getCancelAtPeriodEnd()),
                subscription.getCancellationDate(),
                subscription.getAddonsList() != null ? subscription.getAddonsList() : List.of(),
                effectiveMax,
                effectiveStorage
        );
    }
}
