package com.agrocloud.backend.dto;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String organizationName,
        String contactName,
        String email,
        String phone,
        Role role,
        AccountStatus status,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getOrganizationName(),
                user.getContactName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}
