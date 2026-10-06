package com.agrocloud.backend.incident;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface IncidentRepository extends JpaRepository<IncidentEntity, UUID> {
    @Query(value = "SELECT nextval('incident_ticket_number_seq')", nativeQuery = true)
    Long nextTicketNumber();
    List<IncidentEntity> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    List<IncidentEntity> findByAssignedSupportIdOrderByCreatedAtDesc(UUID supportId);
    List<IncidentEntity> findAllByOrderByCreatedAtDesc();
}
