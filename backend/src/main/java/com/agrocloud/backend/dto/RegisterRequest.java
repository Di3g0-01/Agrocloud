package com.agrocloud.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El nombre de la finca o empresa es obligatorio")
        @Size(max = 150, message = "El nombre de la organización no puede superar 150 caracteres")
        @JsonAlias("nombreEmpresa")
        String organizationName,

        @Size(max = 150, message = "El nombre del contacto no puede superar 150 caracteres")
        @JsonAlias("contactoNombre")
        String contactName,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El correo electrónico no tiene un formato válido")
        @Size(max = 254, message = "El correo electrónico no puede superar 254 caracteres")
        String email,

        @Size(max = 30, message = "El teléfono no puede superar 30 caracteres")
        @Pattern(regexp = "^[+0-9() .-]*$", message = "El teléfono contiene caracteres no válidos")
        @JsonAlias("telefono")
        String phone,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password
) {
}
