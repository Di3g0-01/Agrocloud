package com.agrocloud.backend.notification;

import com.agrocloud.backend.entity.User;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {
    private final NotificationRepository repository;
    private final ApplicationEventPublisher events;

    public NotificationService(NotificationRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    public void create(User recipient, String type, String title, String message, UUID resourceId) {
        NotificationEntity entity = new NotificationEntity();
        entity.recipient = recipient;
        entity.type = type;
        entity.title = title;
        entity.message = message;
        entity.resourceId = resourceId;
        repository.save(entity);
        events.publishEvent(new NotificationCreated(recipient.getId(), NotificationResponse.from(entity)));
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(UUID userId) {
        return repository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from).toList();
    }

    @Transactional
    public NotificationResponse markRead(UUID notificationId, UUID userId) {
        NotificationEntity entity = repository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificación no encontrada"));
        if (entity.readAt == null) entity.readAt = Instant.now();
        return NotificationResponse.from(entity);
    }

    public record NotificationCreated(UUID recipientId, NotificationResponse notification) {}
}
