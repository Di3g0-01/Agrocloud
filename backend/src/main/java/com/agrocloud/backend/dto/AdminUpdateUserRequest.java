package com.agrocloud.backend.dto;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
        @NotBlank @Size(max = 150) String organizationName,
        @Size(max = 150) String contactName,
        @NotBlank @Email @Size(max = 254) String email,
        @Size(max = 30) @Pattern(regexp = "^[+0-9() .-]*$") String phone,
        @Size(min = 8, max = 72) String password,
        @NotNull Role role,
        @NotNull AccountStatus status
) {
}
