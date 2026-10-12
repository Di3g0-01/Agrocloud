package com.agrocloud.backend.incident;

import com.agrocloud.backend.entity.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record IncidentCommentResponse(UUID id, UUID autorId, String autor, Role rolAutor,
                                      String texto, @JsonProperty("destinatario") String targetRole, Instant fecha) {
    public static IncidentCommentResponse from(IncidentComment comment) {
        String name = comment.author != null ? comment.author.getContactName() : "";
        if (name == null || name.isBlank()) name = comment.author != null ? comment.author.getOrganizationName() : "";
        String target = comment.targetRole != null ? comment.targetRole : "CLIENTE";
        Role role = (comment.author != null && comment.author.getRole() != null) ? comment.author.getRole() : Role.CLIENTE;
        UUID autorId = comment.author != null ? comment.author.getId() : null;
        return new IncidentCommentResponse(comment.id, autorId, name,
                role, comment.body, target, comment.createdAt);
    }
}
