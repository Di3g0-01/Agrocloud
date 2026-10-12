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
    List<IncidentEntity> findByResolvedByIdOrderByResolvedAtDesc(UUID supportId);
    List<IncidentEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(i) > 0 FROM IncidentEntity i WHERE i.instance.id = :instanceId AND i.status = :status AND i.id <> :excludeId")
    boolean existsByInstanceIdAndStatusAndIdNot(@org.springframework.data.repository.query.Param("instanceId") UUID instanceId,
                                                @org.springframework.data.repository.query.Param("status") String status,
                                                @org.springframework.data.repository.query.Param("excludeId") UUID excludeId);
}
