package com.agrocloud.backend.incident;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.notification.NotificationService;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.security.UserPrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class IncidentCommentService {
    private final IncidentRepository incidents;
    private final IncidentCommentRepository comments;
    private final UserRepository users;
    private final NotificationService notifications;

    public IncidentCommentService(IncidentRepository incidents, IncidentCommentRepository comments,
                                  UserRepository users, NotificationService notifications) {
        this.incidents = incidents;
        this.comments = comments;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<IncidentCommentResponse> list(UUID incidentId, UserPrincipal principal) {
        IncidentEntity incident = accessibleIncident(incidentId, principal);
        return comments.findByIncidentIdOrderByCreatedAtAscIdAsc(incident.id).stream()
                .map(IncidentCommentResponse::from).toList();
    }

    @Transactional
    public IncidentCommentResponse add(UUID incidentId, String text, UserPrincipal principal) {
        IncidentEntity incident = accessibleIncident(incidentId, principal);
        if ("CERRADA".equals(incident.status))
            throw new IllegalStateException("Un ticket cerrado no admite comentarios");
        String body = text == null ? "" : text.trim();
        if (body.isEmpty() || body.length() > 2000)
            throw new IllegalArgumentException("Escribe un comentario de 1 a 2000 caracteres");
        User author = users.findById(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        IncidentComment comment = new IncidentComment();
        comment.incident = incident;
        comment.author = author;
        comment.body = body;
        IncidentCommentResponse result = IncidentCommentResponse.from(comments.saveAndFlush(comment));
        String title = "Nuevo comentario en " + IncidentResponse.from(incident).codigo();
        if (!incident.owner.getId().equals(principal.id()))
            notifications.create(incident.owner, "TICKET_COMENTARIO", title, incident.subject, incident.id);
        if (incident.assignedSupport != null && !incident.assignedSupport.getId().equals(principal.id()))
            notifications.create(incident.assignedSupport, "TICKET_COMENTARIO", title, incident.subject, incident.id);
        for (User admin : users.findByRole_CodeAndStatus(Role.ADMINISTRADOR, AccountStatus.ACTIVO))
            if (!admin.getId().equals(principal.id()))
                notifications.create(admin, "TICKET_COMENTARIO", title, incident.subject, incident.id);
        return result;
    }

    private IncidentEntity accessibleIncident(UUID id, UserPrincipal principal) {
        IncidentEntity incident = incidents.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));
        if (principal.hasRole("ADMINISTRADOR") ||
                (principal.hasRole("CLIENTE") && incident.owner.getId().equals(principal.id())) ||
                (principal.hasRole("SOPORTE") && incident.assignedSupport != null &&
                        incident.assignedSupport.getId().equals(principal.id()))) return incident;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta incidencia");
    }
}
