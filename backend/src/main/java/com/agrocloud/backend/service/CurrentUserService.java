package com.agrocloud.backend.service;

import com.agrocloud.backend.dto.UserResponse;
import com.agrocloud.backend.exception.InvalidCredentialsException;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(UserPrincipal principal) {
        return userRepository.findById(principal.id())
                .map(UserResponse::from)
                .orElseThrow(InvalidCredentialsException::new);
    }
}
