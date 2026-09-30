package com.agrocloud.backend.service;

import com.agrocloud.backend.dto.AuthResponse;
import com.agrocloud.backend.dto.RegisterRequest;
import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.EmailAlreadyRegisteredException;
import com.agrocloud.backend.repository.RoleRepository;
import com.agrocloud.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthResponseFactory responseFactory;

    public RegistrationService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthResponseFactory responseFactory
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.responseFactory = responseFactory;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = EmailAddress.normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyRegisteredException();
        }

        User user = new User();
        user.setOrganizationName(request.organizationName().trim());
        user.setContactName(trimToNull(request.contactName()));
        user.setEmail(email);
        user.setPhone(trimToNull(request.phone()));
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRoleEntity(roleRepository.getReferenceById(Role.CLIENTE));
        user.setStatus(AccountStatus.ACTIVO);

        return responseFactory.create(userRepository.save(user));
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
