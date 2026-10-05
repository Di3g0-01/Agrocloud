package com.agrocloud.backend.incident;

import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/incidencias")
public class IncidentController {
    private final IncidentRepository incidents;
    private final InstanceRepository instances;

    public IncidentController(IncidentRepository incidents, InstanceRepository instances) {
        this.incidents = incidents;
        this.instances = instances;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<IncidentResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        List<IncidentEntity> rows = principal.isAdminOrSupport()
            ? incidents.findAllByOrderByCreatedAtDesc()
            : incidents.findByOwnerIdOrderByCreatedAtDesc(principal.id());
        return rows.stream().map(IncidentResponse::from).toList();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<IncidentResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody IncidentRequest request) {
        InstanceEntity instance = instances.findById(request.instanciaId())
            .orElseThrow(() -> new IllegalArgumentException("Instancia no encontrada"));
        if (!principal.isAdminOrSupport() && !instance.getOwner().getId().equals(principal.id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String priority = request.prioridad().toUpperCase();
        if (!List.of("ALTA", "MEDIA", "BAJA").contains(priority))
            throw new IllegalArgumentException("Prioridad no válida");
        IncidentEntity incident = new IncidentEntity();
        incident.owner = instance.getOwner();
        incident.instance = instance;
        incident.subject = request.asunto().trim();
        incident.category = request.categoria().trim();
        incident.problem = request.problema().trim();
        incident.priority = priority;
        incident.status = "ABIERTA";
        return ResponseEntity.status(HttpStatus.CREATED).body(IncidentResponse.from(incidents.save(incident)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SOPORTE')")
    @Transactional
    public IncidentResponse update(@PathVariable UUID id, @RequestBody IncidentUpdateRequest request) {
        IncidentEntity incident = incidents.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada"));
        if (request.estado() != null) {
            if (!List.of("ABIERTA", "EN_REVISION", "RESUELTA").contains(request.estado()))
                throw new IllegalArgumentException("Estado no válido");
            incident.status = request.estado();
        }
        if (request.guiaDiagnostico() != null) incident.diagnosticGuide = request.guiaDiagnostico();
        return IncidentResponse.from(incidents.save(incident));
    }

    public record IncidentUpdateRequest(String estado, String guiaDiagnostico) {}
}
