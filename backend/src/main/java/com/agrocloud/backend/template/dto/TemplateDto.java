package com.agrocloud.backend.template.dto;

import java.util.List;

public record TemplateDto(
    String id,
    String nombre,
    String descripcion,
    Integer tablas,
    String version,
    Integer instancias,
    String estado,
    String actualizada,
    List<String> schema
) {}
