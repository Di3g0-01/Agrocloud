package com.agrocloud.backend.repository;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.AccountStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole_CodeAndStatus(Role role, AccountStatus status);
}
