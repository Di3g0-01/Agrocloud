package com.agrocloud.backend.incident;

import com.agrocloud.backend.entity.Role;
import java.time.Instant;
import java.util.UUID;

public record IncidentCommentResponse(UUID id, UUID autorId, String autor, Role rolAutor,
                                      String texto, Instant fecha) {
    public static IncidentCommentResponse from(IncidentComment comment) {
        String name = comment.author.getContactName();
        if (name == null || name.isBlank()) name = comment.author.getOrganizationName();
        return new IncidentCommentResponse(comment.id, comment.author.getId(), name,
                comment.author.getRole(), comment.body, comment.createdAt);
    }
}
