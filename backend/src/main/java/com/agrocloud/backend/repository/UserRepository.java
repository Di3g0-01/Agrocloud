package com.agrocloud.backend.repository;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.AccountStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.email = :email")
    Optional<User> findByEmailForUpdate(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<User> findByVerificationTokenHash(String hash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<User> findByResetTokenHash(String hash);

    boolean existsByEmail(String email);

    List<User> findByRole_CodeAndStatus(Role role, AccountStatus status);
}
