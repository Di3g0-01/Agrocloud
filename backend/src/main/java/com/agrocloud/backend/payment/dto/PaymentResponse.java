package com.agrocloud.backend.payment.dto;

import com.agrocloud.backend.payment.entity.PaymentEntity;
import com.agrocloud.backend.payment.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID suscripcionId,
        String planNombre,
        BigDecimal monto,
        Instant fecha,
        PaymentStatus estado,
        String referencia,
        String metodoPago,
        String concepto,
        String clienteNombre,
        String clienteEmail
) {
    public static PaymentResponse from(PaymentEntity entity) {
        String clientName = "Cliente";
        String clientEmail = "";
        if (entity.getSubscription() != null && entity.getSubscription().getUser() != null) {
            var user = entity.getSubscription().getUser();
            clientName = user.getOrganizationName() != null && !user.getOrganizationName().isBlank()
                    ? user.getOrganizationName()
                    : (user.getContactName() != null && !user.getContactName().isBlank() ? user.getContactName() : user.getEmail());
            clientEmail = user.getEmail();
        }

        return new PaymentResponse(
                entity.getId(),
                entity.getSubscription().getId(),
                entity.getSubscription().getPlan().getName(),
                entity.getAmount(),
                entity.getPaymentDate(),
                entity.getStatus(),
                entity.getReference(),
                entity.getPaymentMethod(),
                entity.getConcept() != null ? entity.getConcept() : "Pago de suscripción - " + entity.getSubscription().getPlan().getName(),
                clientName,
                clientEmail
        );
    }
}
