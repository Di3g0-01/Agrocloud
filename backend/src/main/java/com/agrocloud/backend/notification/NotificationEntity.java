package com.agrocloud.backend.notification;

import com.agrocloud.backend.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class NotificationEntity {
    @Id public UUID id;
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false) public User recipient;
    @Column(nullable = false, length = 40) public String type;
    @Column(nullable = false, length = 200) public String title;
    @Column(nullable = false, columnDefinition = "TEXT") public String message;
    @Column(name = "resource_id") public UUID resourceId;
    @Column(name = "read_at") public Instant readAt;
    @Column(name = "created_at", nullable = false) public Instant createdAt;

    @PrePersist void create() {
        if (id == null) id = UUID.randomUUID();
        createdAt = Instant.now();
    }
}
