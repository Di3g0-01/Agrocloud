package com.agrocloud.backend.plan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpsertPlanRequest(
    @NotBlank String nombre,
    @NotNull @DecimalMin("1.00") Double almacenamientoGb,
    @NotNull @DecimalMin("0.00") BigDecimal precioMensual,
    String descripcion,
    @NotNull @Min(1) Integer instanciasPermitidas,
    Boolean popular,
    Boolean activo
) {}
