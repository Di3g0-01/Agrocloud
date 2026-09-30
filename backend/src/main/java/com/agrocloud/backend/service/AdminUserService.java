package com.agrocloud.backend.service;

import com.agrocloud.backend.dto.AdminCreateUserRequest;
import com.agrocloud.backend.dto.AdminUpdateUserRequest;
import com.agrocloud.backend.dto.UserResponse;
import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.EmailAlreadyRegisteredException;
import com.agrocloud.backend.exception.UserNotFoundException;
import com.agrocloud.backend.repository.RoleRepository;
import com.agrocloud.backend.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder passwords;

    public AdminUserService(UserRepository users, RoleRepository roles, PasswordEncoder passwords) {
        this.users = users;
        this.roles = roles;
        this.passwords = passwords;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return users.findAll().stream()
                .sorted(Comparator.comparing((User u) -> u.getCreatedAt()).reversed())
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse get(UUID id) {
        return UserResponse.from(find(id));
    }

    @Transactional
    public UserResponse create(AdminCreateUserRequest request) {
        String email = EmailAddress.normalize(request.email());
        if (users.existsByEmail(email)) throw new EmailAlreadyRegisteredException();
        User user = new User();
        user.setOrganizationName(request.organizationName().trim());
        user.setContactName(optional(request.contactName()));
        user.setEmail(email);
        user.setPhone(optional(request.phone()));
        user.setPasswordHash(passwords.encode(request.password()));
        user.setRoleEntity(roles.getReferenceById(request.role()));
        user.setStatus(AccountStatus.ACTIVO);
        return UserResponse.from(users.save(user));
    }

    @Transactional
    public UserResponse update(UUID id, UUID actingAdminId, AdminUpdateUserRequest request) {
        User user = find(id);
        if (id.equals(actingAdminId)
                && (request.role() != user.getRole() || request.status() != AccountStatus.ACTIVO)) {
            throw new IllegalArgumentException("No puedes cambiar tu propio rol ni suspender tu cuenta");
        }
        String email = EmailAddress.normalize(request.email());
        if (!email.equals(user.getEmail()) && users.existsByEmail(email)) {
            throw new EmailAlreadyRegisteredException();
        }
        user.setOrganizationName(request.organizationName().trim());
        user.setContactName(optional(request.contactName()));
        user.setEmail(email);
        user.setPhone(optional(request.phone()));
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwords.encode(request.password()));
        }
        user.setRoleEntity(roles.getReferenceById(request.role()));
        user.setStatus(request.status());
        return UserResponse.from(users.save(user));
    }

    private User find(UUID id) {
        return users.findById(id).orElseThrow(UserNotFoundException::new);
    }

    private String optional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
