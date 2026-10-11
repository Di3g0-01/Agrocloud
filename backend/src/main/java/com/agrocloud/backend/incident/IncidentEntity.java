package com.agrocloud.backend.incident;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.entity.InstanceEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class IncidentEntity {
    @Id public UUID id;
    @Column(name = "ticket_number", nullable = false, unique = true) public Long ticketNumber;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "owner_id", nullable = false) public User owner;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "instance_id", nullable = false) public InstanceEntity instance;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "assigned_support_id") public User assignedSupport;
    @Column(name = "subject", nullable = false, length = 200) public String subject;
    @Column(nullable = false, length = 80) public String category;
    @Column(nullable = false, columnDefinition = "TEXT") public String problem;
    @Column(nullable = false, length = 10) public String priority;
    @Column(nullable = false, length = 20) public String status;
    @Column(name = "diagnostic_guide", columnDefinition = "TEXT") public String diagnosticGuide;
    @Column(name = "resolution_message", length = 2000) public String resolutionMessage;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "resolved_by_id") public User resolvedBy;
    @Column(name = "resolved_at") public Instant resolvedAt;
    @Column(name = "created_at", nullable = false) public Instant createdAt;
    @Column(name = "updated_at", nullable = false) public Instant updatedAt;

    @PrePersist void create() {
        if (id == null) id = UUID.randomUUID();
        createdAt = Instant.now();
        updatedAt = createdAt;
    }
    @PreUpdate void update() { updatedAt = Instant.now(); }
}
