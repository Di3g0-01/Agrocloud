package com.agrocloud.backend.plan.dto;

import com.agrocloud.backend.plan.decorator.PlanContratable;
import java.math.BigDecimal;
import java.util.List;

public record CotizacionPlanResponse(
        String planId,
        String descripcion,
        BigDecimal precioMensual,
        Double almacenamientoGb,
        Integer instanciasPermitidas,
        List<String> complementos
) {
    public static CotizacionPlanResponse from(String planId, PlanContratable plan) {
        return new CotizacionPlanResponse(
                planId,
                plan.descripcion(),
                plan.precioMensual(),
                plan.almacenamientoGb(),
                plan.instanciasPermitidas(),
                plan.complementos()
        );
    }
}
