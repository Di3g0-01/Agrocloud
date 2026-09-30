package com.agrocloud.backend.service;

import com.agrocloud.backend.dto.AuthResponse;
import com.agrocloud.backend.dto.LoginRequest;
import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.AccountNotActiveException;
import com.agrocloud.backend.exception.InvalidCredentialsException;
import com.agrocloud.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoginService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final AuthResponseFactory responseFactory;

    public LoginService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            AuthResponseFactory responseFactory
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.responseFactory = responseFactory;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = EmailAddress.normalize(request.email());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (BadCredentialsException | UsernameNotFoundException exception) {
            throw new InvalidCredentialsException();
        } catch (DisabledException | LockedException exception) {
            throw new AccountNotActiveException();
        }

        User user = userRepository.findByEmail(email).orElseThrow(InvalidCredentialsException::new);
        if (user.getStatus() != AccountStatus.ACTIVO) {
            throw new AccountNotActiveException();
        }
        return responseFactory.create(user);
    }
}
