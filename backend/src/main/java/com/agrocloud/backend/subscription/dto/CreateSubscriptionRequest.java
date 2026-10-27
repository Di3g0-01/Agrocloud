package com.agrocloud.backend.subscription.dto;

import com.agrocloud.backend.plan.decorator.Complemento;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateSubscriptionRequest(
        @NotBlank(message = "El ID del plan es obligatorio")
        String planId,
        // Opcional: complementos que se apilan sobre el plan base con el patrón Decorator
        List<Complemento> complementos
) {
    /** Mantiene compatible el código que solo envía el plan. */
    public CreateSubscriptionRequest(String planId) {
        this(planId, List.of());
    }
}
