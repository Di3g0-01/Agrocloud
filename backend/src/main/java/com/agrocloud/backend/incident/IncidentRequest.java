package com.agrocloud.backend.incident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record IncidentRequest(
    @NotNull UUID instanciaId,
    @NotBlank String asunto,
    @NotBlank String categoria,
    @NotBlank String problema,
    @NotBlank String prioridad
) {}
