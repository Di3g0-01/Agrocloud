package com.agrocloud.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agrocloud.backend.dto.LoginRequest;
import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.RoleEntity;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.AccountNotActiveException;
import com.agrocloud.backend.exception.InvalidCredentialsException;
import com.agrocloud.backend.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@ExtendWith(MockitoExtension.class)
class LoginServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuthResponseFactory responseFactory;

    private LoginService service;

    @BeforeEach
    void setUp() {
        service = new LoginService(authenticationManager, userRepository, responseFactory);
    }

    @Test
    void loginAuthenticatesNormalizedEmailAndIssuesToken() {
        User user = user(AccountStatus.ACTIVO);
        when(userRepository.findByEmail("cliente@example.com")).thenReturn(Optional.of(user));

        service.login(new LoginRequest(" CLIENTE@Example.com ", "ClaveSegura123"));

        ArgumentCaptor<UsernamePasswordAuthenticationToken> captor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(captor.capture());
        assertThat(captor.getValue().getPrincipal()).isEqualTo("cliente@example.com");
        verify(responseFactory).create(user);
    }

    @Test
    void loginRejectsWrongPassword() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> service.login(new LoginRequest("cliente@example.com", "incorrecta")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void loginRejectsInactiveAccount() {
        when(userRepository.findByEmail("cliente@example.com"))
                .thenReturn(Optional.of(user(AccountStatus.SUSPENDIDO)));

        assertThatThrownBy(() -> service.login(new LoginRequest("cliente@example.com", "ClaveSegura123")))
                .isInstanceOf(AccountNotActiveException.class);
    }

    @Test
    void loginRejectsLockedAccount() {
        when(authenticationManager.authenticate(any())).thenThrow(new LockedException("locked"));

        assertThatThrownBy(() -> service.login(new LoginRequest("cliente@example.com", "ClaveSegura123")))
                .isInstanceOf(AccountNotActiveException.class);
    }

    private User user(AccountStatus status) {
        User user = new User();
        user.setEmail("cliente@example.com");
        user.setRoleEntity(new RoleEntity(Role.CLIENTE));
        user.setStatus(status);
        return user;
    }
}
