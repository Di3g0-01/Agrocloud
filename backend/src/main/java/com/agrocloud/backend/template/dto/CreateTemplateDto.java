package com.agrocloud.backend.template.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTemplateDto(
    @NotBlank @Size(max = 100) String nombre,
    @NotBlank String descripcion,
    String version,
    String estado,
    List<@NotBlank String> schema
) {}
