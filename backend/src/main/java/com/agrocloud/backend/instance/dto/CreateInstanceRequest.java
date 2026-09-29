package com.agrocloud.backend.instance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateInstanceRequest(
        @NotBlank(message = "El nombre de la instancia es obligatorio")
        @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "El nombre de la instancia solo debe contener letras, números y guiones")
        @JsonProperty("nombre") String name,

        @JsonProperty("plantilla") String template
) {}
