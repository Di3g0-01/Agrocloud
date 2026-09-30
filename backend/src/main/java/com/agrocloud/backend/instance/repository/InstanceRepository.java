package com.agrocloud.backend.instance.repository;

import com.agrocloud.backend.instance.entity.InstanceEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstanceRepository extends JpaRepository<InstanceEntity, UUID> {
    List<InstanceEntity> findByOwnerId(UUID ownerId);
    Optional<InstanceEntity> findByIdAndOwnerId(UUID id, UUID ownerId);
    long countByOwnerId(UUID ownerId);
}
