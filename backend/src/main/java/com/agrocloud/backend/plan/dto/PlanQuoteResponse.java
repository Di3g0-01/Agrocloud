package com.agrocloud.backend.plan.dto;

import com.agrocloud.backend.plan.decorator.ContractablePlan;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

public record PlanQuoteResponse(
        String planId,
        @JsonProperty("descripcion") String description,
        @JsonProperty("precioMensual") BigDecimal monthlyPrice,
        @JsonProperty("almacenamientoGb") Double storageGb,
        @JsonProperty("instanciasPermitidas") Integer maxInstances,
        @JsonProperty("complementos") List<String> addons
) {
    public static PlanQuoteResponse from(String planId, ContractablePlan plan) {
        return new PlanQuoteResponse(
                planId,
                plan.getDescription(),
                plan.getMonthlyPrice(),
                plan.getStorageGb(),
                plan.getMaxInstances(),
                plan.getAddons()
        );
    }
}

