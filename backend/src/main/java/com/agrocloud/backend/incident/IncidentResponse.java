package com.agrocloud.backend.incident;

import java.time.Instant;
import java.util.UUID;

public record IncidentResponse(
    UUID id, String cliente, UUID instanciaId, String instanciaNombre, String plantilla,
    String asunto, String categoria, String problema, String prioridad, String estado,
    Instant fecha, Instant actualizado, String guiaDiagnostico
) {
    public static IncidentResponse from(IncidentEntity incident) {
        return new IncidentResponse(
            incident.id, incident.owner.getOrganizationName(), incident.instance.getId(),
            incident.instance.getName(), incident.instance.getTemplate(), incident.subject,
            incident.category, incident.problem, incident.priority, incident.status,
            incident.createdAt, incident.updatedAt, incident.diagnosticGuide
        );
    }
}
