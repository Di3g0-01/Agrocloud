package com.agrocloud.backend.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.RoleEntity;
import com.agrocloud.backend.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET = Base64.getEncoder().encodeToString(
            "agrocloud-test-signing-key-with-at-least-32-bytes".getBytes(StandardCharsets.UTF_8)
    );

    @Test
    void rejectsExistingTokenWhenAccountIsSuspended() {
        JwtService jwtService = new JwtService(SECRET, Duration.ofHours(1));
        User user = activeUser();
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isValid(token, UserPrincipal.from(user))).isTrue();

        user.setStatus(AccountStatus.SUSPENDIDO);

        assertThat(jwtService.isValid(token, UserPrincipal.from(user))).isFalse();
    }

    @Test
    void rejectsTokenWhenEmailBelongsToAnotherAccount() {
        JwtService jwtService = new JwtService(SECRET, Duration.ofHours(1));
        User original = activeUser();
        String token = jwtService.generateToken(original);

        User replacement = activeUser();
        assertThat(replacement.getId()).isNotEqualTo(original.getId());
        assertThat(jwtService.isValid(token, UserPrincipal.from(replacement))).isFalse();
    }

    @Test
    void rejectsExpiredToken() {
        JwtService jwtService = new JwtService(SECRET, Duration.ofSeconds(-1));
        String token = jwtService.generateToken(activeUser());
        assertThatThrownBy(() -> jwtService.extractSubject(token))
                .isInstanceOf(ExpiredJwtException.class);
    }

    private User activeUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("cliente@example.com");
        user.setPasswordHash("bcrypt-hash");
        user.setRoleEntity(new RoleEntity(Role.CLIENTE));
        user.setStatus(AccountStatus.ACTIVO);
        return user;
    }
}
