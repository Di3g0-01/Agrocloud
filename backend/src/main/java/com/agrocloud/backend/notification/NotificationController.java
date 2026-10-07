package com.agrocloud.backend.notification;

import com.agrocloud.backend.security.UserPrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/notificaciones")
public class NotificationController {
    private final NotificationService service;
    private final NotificationStream stream;

    public NotificationController(NotificationService service, NotificationStream stream) {
        this.service = service;
        this.stream = stream;
    }

    @GetMapping
    public List<NotificationResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return service.list(principal.id());
    }

    @PatchMapping("/{id}/leida")
    public NotificationResponse markRead(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return service.markRead(id, principal.id());
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal UserPrincipal principal) {
        return stream.subscribe(principal.id());
    }
}
