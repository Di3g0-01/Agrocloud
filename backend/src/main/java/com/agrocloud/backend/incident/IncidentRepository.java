package com.agrocloud.backend.incident;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<IncidentEntity, UUID> {
    List<IncidentEntity> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    List<IncidentEntity> findAllByOrderByCreatedAtDesc();
}
