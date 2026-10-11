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
        String concepto
) {
    public static PaymentResponse from(PaymentEntity entity) {
        return new PaymentResponse(
                entity.getId(),
                entity.getSubscription().getId(),
                entity.getSubscription().getPlan().getName(),
                entity.getAmount(),
                entity.getPaymentDate(),
                entity.getStatus(),
                entity.getReference(),
                entity.getPaymentMethod(),
                entity.getConcept() != null ? entity.getConcept() : "Pago de suscripción - " + entity.getSubscription().getPlan().getName()
        );
    }
}
