package com.agrocloud.backend.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull(message = "El ID de la suscripción es requerido")
        UUID subscriptionId,

        @NotNull(message = "El monto es requerido")
        @Positive(message = "El monto debe ser mayor a cero")
        BigDecimal monto,

        String referencia,
        String metodoPago,
        String concepto
) {}
