package com.agrocloud.backend.notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
    List<NotificationEntity> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
    Optional<NotificationEntity> findByIdAndRecipientId(UUID id, UUID recipientId);
}
