package com.agrocloud.backend.repository;

import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<RoleEntity, Role> {
}
