package com.agrocloud.backend.notification;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(UUID id, String tipo, String titulo, String mensaje,
                                   UUID recursoId, Instant fecha, boolean leida) {
    public static NotificationResponse from(NotificationEntity entity) {
        return new NotificationResponse(entity.id, entity.type, entity.title,
                entity.message, entity.resourceId, entity.createdAt, entity.readAt != null);
    }
}
