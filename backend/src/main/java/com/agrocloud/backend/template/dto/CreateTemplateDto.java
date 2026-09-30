package com.agrocloud.backend.template.dto;

import java.util.List;

public record CreateTemplateDto(
    String nombre,
    String descripcion,
    String version,
    String estado,
    List<String> schema
) {}
