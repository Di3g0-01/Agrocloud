package com.agrocloud.backend.instance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record CreateCustomTableRequest(
        @NotBlank(message = "El nombre de la tabla es obligatorio")
        @Pattern(regexp = "^[a-zA-Z][a-zA-Z0-9_]{1,40}$", message = "El nombre de la tabla debe comenzar con una letra y contener solo letras, números y guiones bajos (máx 40 caracteres)")
        String tableName,

        @NotEmpty(message = "Debes definir al menos una columna")
        List<ColumnDefinition> columns
) {
    public record ColumnDefinition(
            @NotBlank(message = "El nombre de la columna es obligatorio")
            @Pattern(regexp = "^[a-zA-Z][a-zA-Z0-9_]{0,40}$", message = "Nombre de columna no válido")
            String name,

            @NotBlank(message = "El tipo de dato es obligatorio")
            @Pattern(regexp = "(?i)^(VARCHAR|TEXT|INTEGER|BIGINT|NUMERIC|BOOLEAN|DATE|TIMESTAMP|SERIAL|BIGSERIAL)$", message = "Tipo de dato SQL no soportado o no seguro")
            String type,

            Integer length,
            Boolean nullable,
            Boolean primaryKey,
            String defaultValue
    ) {}
}
