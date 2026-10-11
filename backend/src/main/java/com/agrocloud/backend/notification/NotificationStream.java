package com.agrocloud.backend.notification;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
@EnableScheduling
public class NotificationStream {
    private final ConcurrentHashMap<UUID, Set<SseEmitter>> connections = new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID userId) {
        SseEmitter emitter = new SseEmitter(0L);
        connections.computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet()).add(emitter);
        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(ignored -> remove(userId, emitter));
        try {
            emitter.send(SseEmitter.event().name("ready").data("connected"));
        } catch (IOException e) {
            remove(userId, emitter);
            emitter.completeWithError(e);
        }
        return emitter;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onNotification(NotificationService.NotificationCreated event) {
        for (SseEmitter emitter : connections.getOrDefault(event.recipientId(), Set.of())) {
            try {
                emitter.send(SseEmitter.event().id(event.notification().id().toString())
                        .name("notification").data(event.notification()));
            } catch (Exception e) {
                remove(event.recipientId(), emitter);
                emitter.complete();
            }
        }
    }

    @Scheduled(fixedDelay = 25000)
    public void heartbeat() {
        connections.forEach((userId, emitters) -> {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().comment("keepalive"));
                } catch (Exception e) {
                    remove(userId, emitter);
                    emitter.complete();
                }
            }
        });
    }

    private void remove(UUID userId, SseEmitter emitter) {
        connections.computeIfPresent(userId, (ignored, emitters) -> {
            emitters.remove(emitter);
            return emitters.isEmpty() ? null : emitters;
        });
    }
}
