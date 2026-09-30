package com.agrocloud.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agrocloud.backend.dto.AdminCreateUserRequest;
import com.agrocloud.backend.dto.AdminUpdateUserRequest;
import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.RoleEntity;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.repository.RoleRepository;
import com.agrocloud.backend.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {
    @Mock UserRepository users;
    @Mock RoleRepository roles;

    @Test
    void administratorCreatesSupportWithHashedPassword() {
        String password = "ClaveSoporte2026!";
        when(roles.getReferenceById(Role.SOPORTE)).thenReturn(new RoleEntity(Role.SOPORTE));
        when(users.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            user.setCreatedAt(Instant.now());
            return user;
        });
        AdminUserService service = new AdminUserService(users, roles, new BCryptPasswordEncoder(4));
        var created = service.create(new AdminCreateUserRequest("AgroCloud", " Ana López ", " ANA@EXAMPLE.COM ", null, password, Role.SOPORTE));
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(users).save(captor.capture());
        User stored = captor.getValue();
        assertThat(stored.getPasswordHash()).isNotEqualTo(password);
        assertThat(new BCryptPasswordEncoder().matches(password, stored.getPasswordHash())).isTrue();
        assertThat(stored.getEmail()).isEqualTo("ana@example.com");
        assertThat(stored.getContactName()).isEqualTo("Ana López");
        assertThat(created.role()).isEqualTo(Role.SOPORTE);
        assertThat(created.status()).isEqualTo(AccountStatus.ACTIVO);
    }

    @Test
    void administratorCannotRemoveOwnAdministrativeAccess() {
        UUID id = UUID.randomUUID();
        User admin = new User();
        admin.setId(id);
        admin.setRoleEntity(new RoleEntity(Role.ADMINISTRADOR));
        admin.setStatus(AccountStatus.ACTIVO);
        when(users.findById(id)).thenReturn(Optional.of(admin));
        AdminUserService service = new AdminUserService(users, roles, new BCryptPasswordEncoder(4));
        var update = new AdminUpdateUserRequest("AgroCloud", "Admin", "admin@example.com", null, null,
                Role.CLIENTE, AccountStatus.ACTIVO);
        assertThatThrownBy(() -> service.update(id, id, update))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("propio rol");
    }
}
