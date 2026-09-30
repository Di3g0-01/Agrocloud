package com.agrocloud.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agrocloud.backend.dto.RegisterRequest;
import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.RoleEntity;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.EmailAlreadyRegisteredException;
import com.agrocloud.backend.repository.RoleRepository;
import com.agrocloud.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private AuthResponseFactory responseFactory;

    @Test
    void registrationStoresBcryptHashAndAssignsClientRole() {
        String password = "ClaveSegura123";
        RegisterRequest request = new RegisterRequest(
                "Finca Los Pinos", " Carlos Monterroso ", " CARLOS@Example.COM ",
                "+502 4455-6677", password
        );
        when(roleRepository.getReferenceById(Role.CLIENTE)).thenReturn(new RoleEntity(Role.CLIENTE));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        new RegistrationService(userRepository, roleRepository, new BCryptPasswordEncoder(4), responseFactory)
                .register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("carlos@example.com");
        assertThat(saved.getContactName()).isEqualTo("Carlos Monterroso");
        assertThat(saved.getPasswordHash()).isNotEqualTo(password).startsWith("$2a$");
        assertThat(new BCryptPasswordEncoder().matches(password, saved.getPasswordHash())).isTrue();
        assertThat(saved.getRole()).isEqualTo(Role.CLIENTE);
        assertThat(saved.getStatus()).isEqualTo(AccountStatus.ACTIVO);
        verify(responseFactory).create(saved);
    }

    @Test
    void registrationRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "Finca Los Pinos", null, "CLIENTE@Example.com", null, "ClaveSegura123"
        );
        when(userRepository.existsByEmail("cliente@example.com")).thenReturn(true);

        RegistrationService service = new RegistrationService(
                userRepository, roleRepository, new BCryptPasswordEncoder(4), responseFactory
        );
        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(EmailAlreadyRegisteredException.class);
    }
}
