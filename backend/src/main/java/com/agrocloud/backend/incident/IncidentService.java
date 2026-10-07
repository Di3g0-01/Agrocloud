package com.agrocloud.backend.incident;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.security.UserPrincipal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class IncidentService {
    private final IncidentRepository incidents;
    private final InstanceRepository instances;
    private final UserRepository users;

    public IncidentService(IncidentRepository incidents, InstanceRepository instances, UserRepository users) {
        this.incidents = incidents;
        this.instances = instances;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> list(UserPrincipal principal) {
        List<IncidentEntity> rows = principal.hasRole("ADMINISTRADOR")
                ? incidents.findAllByOrderByCreatedAtDesc()
                : principal.hasRole("SOPORTE")
                    ? incidents.findByAssignedSupportIdOrderByCreatedAtDesc(principal.id())
                    : incidents.findByOwnerIdOrderByCreatedAtDesc(principal.id());
        return rows.stream().map(IncidentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> listClient(UUID clientId, UserPrincipal principal) {
        if (!principal.hasRole("ADMINISTRADOR") &&
                !(principal.hasRole("CLIENTE") && principal.id().equals(clientId)))
            throw forbidden("No puedes consultar las incidencias de otro cliente");
        return incidents.findByOwnerIdOrderByCreatedAtDesc(clientId).stream()
                .map(IncidentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentResponse> listAgent(UUID agentId, UserPrincipal principal) {
        if (!principal.hasRole("ADMINISTRADOR") &&
                !(principal.hasRole("SOPORTE") && principal.id().equals(agentId)))
            throw forbidden("No puedes consultar las incidencias de otro agente");
        return incidents.findByAssignedSupportIdOrderByCreatedAtDesc(agentId).stream()
                .map(IncidentResponse::from).toList();
    }

    @Transactional
    public IncidentResponse create(UserPrincipal principal, IncidentRequest request) {
        if (!principal.hasRole("CLIENTE")) throw forbidden("Solo el cliente puede abrir tickets");
        InstanceEntity instance = instances.findById(request.instanciaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instancia no encontrada"));
        if (!instance.getOwner().getId().equals(principal.id()))
            throw forbidden("La instancia no pertenece al cliente");
        String priority = request.prioridad().trim().toUpperCase(Locale.ROOT);
        if (!List.of("ALTA", "MEDIA", "BAJA").contains(priority))
            throw new IllegalArgumentException("Prioridad no válida");

        IncidentEntity incident = new IncidentEntity();
        incident.ticketNumber = incidents.nextTicketNumber();
        incident.owner = instance.getOwner();
        incident.instance = instance;
        incident.subject = request.asunto().trim();
        incident.category = request.categoria().trim();
        incident.problem = request.problema().trim();
        incident.priority = priority;
        incident.status = "ABIERTA";
        return IncidentResponse.from(incidents.saveAndFlush(incident));
    }

    @Transactional
    public IncidentResponse assign(UUID id, UUID agentId, UserPrincipal principal) {
        if (!principal.hasRole("ADMINISTRADOR")) throw forbidden("Solo Admin puede asignar tickets");
        IncidentEntity incident = find(id);
        if ("CERRADA".equals(incident.status)) throw new IllegalStateException("Un ticket cerrado no se puede asignar");
        User agent = users.findById(agentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agente no encontrado"));
        if (agent.getRole() != Role.SOPORTE || agent.getStatus() != AccountStatus.ACTIVO)
            throw new IllegalArgumentException("El agente debe tener rol Soporte y estar activo");
        incident.assignedSupport = agent;
        return IncidentResponse.from(incidents.saveAndFlush(incident));
    }

    @Transactional
    public IncidentResponse changeStatus(UUID id, String requestedStatus, String resolutionMessage,
                                         UserPrincipal principal) {
        IncidentEntity incident = find(id);
        String next = requestedStatus == null ? "" : requestedStatus.trim().toUpperCase(Locale.ROOT);
        if ("CERRADA".equals(incident.status)) throw new IllegalStateException("Un ticket cerrado no se puede reabrir");
        if (resolutionMessage != null && !"RESUELTA".equals(next))
            throw new IllegalArgumentException("El mensaje de resolución solo se envía al resolver");

        if ("CERRADA".equals(next)) {
            if (!principal.hasRole("ADMINISTRADOR") &&
                    !(principal.hasRole("CLIENTE") && incident.owner.getId().equals(principal.id())))
                throw forbidden("Solo el cliente propietario o Admin puede cerrar el ticket");
        } else {
            requireAssignedAgentOrAdmin(incident, principal);
            if (incident.assignedSupport == null)
                throw new IllegalStateException("Admin debe asignar el ticket antes de atenderlo");
            boolean valid = ("ABIERTA".equals(incident.status) && "EN_REVISION".equals(next))
                    || ("EN_REVISION".equals(incident.status) && "RESUELTA".equals(next));
            if (!valid) throw new IllegalStateException("Transición de estado no permitida");
        }
        if ("RESUELTA".equals(next)) {
            String message = resolutionMessage == null ? "" : resolutionMessage.trim();
            if (message.isEmpty() || message.length() > 2000)
                throw new IllegalArgumentException("Explica al cliente cómo se resolvió (máximo 2000 caracteres)");
            incident.resolutionMessage = message;
        }
        incident.status = next;
        return IncidentResponse.from(incidents.saveAndFlush(incident));
    }

    @Transactional
    public IncidentResponse updateGuide(UUID id, String guide, UserPrincipal principal) {
        IncidentEntity incident = find(id);
        requireAssignedAgentOrAdmin(incident, principal);
        if ("CERRADA".equals(incident.status)) throw new IllegalStateException("El ticket está cerrado");
        incident.diagnosticGuide = guide == null ? null : guide.trim();
        return IncidentResponse.from(incidents.saveAndFlush(incident));
    }

    private IncidentEntity find(UUID id) {
        return incidents.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada"));
    }

    private void requireAssignedAgentOrAdmin(IncidentEntity incident, UserPrincipal principal) {
        if (principal.hasRole("ADMINISTRADOR")) return;
        if (principal.hasRole("SOPORTE") && incident.assignedSupport != null &&
                incident.assignedSupport.getId().equals(principal.id())) return;
        throw forbidden("El ticket no está asignado a este agente");
    }

    private ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
