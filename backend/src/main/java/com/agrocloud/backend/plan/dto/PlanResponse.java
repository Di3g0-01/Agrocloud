package com.agrocloud.backend.plan.dto;

import com.agrocloud.backend.plan.entity.PlanEntity;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

public record PlanResponse(
        String id,
        @JsonProperty("nombre") String name,
        @JsonProperty("almacenamientoGb") Double storageGb,
        @JsonProperty("precioMensual") BigDecimal monthlyPrice,
        @JsonProperty("descripcion") String description,
        @JsonProperty("instanciasPermitidas") Integer maxInstances,
        @JsonProperty("popular") Boolean popular,
        @JsonProperty("activo") Boolean active
) {
    public static PlanResponse from(PlanEntity plan) {
        return new PlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getStorageGb(),
                plan.getMonthlyPrice(),
                plan.getDescription(),
                plan.getMaxInstances(),
                plan.getPopular(),
                plan.getActive()
        );
    }
}
