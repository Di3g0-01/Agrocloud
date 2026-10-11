package com.agrocloud.backend.incident;

import com.agrocloud.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/incidencias")
public class IncidentController {
    private final IncidentService service;
    private final IncidentCommentService comments;

    public IncidentController(IncidentService service, IncidentCommentService comments) {
        this.service = service;
        this.comments = comments;
    }

    @GetMapping
    public List<IncidentResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return service.list(principal);
    }

    @GetMapping("/actividad")
    public List<IncidentResponse> activity(@AuthenticationPrincipal UserPrincipal principal) {
        return service.activity(principal);
    }

    @GetMapping("/cliente/{id}")
    public List<IncidentResponse> listClient(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return service.listClient(id, principal);
    }

    @GetMapping("/agente/{id}")
    public List<IncidentResponse> listAgent(@PathVariable UUID id, @AuthenticationPrincipal UserPrincipal principal) {
        return service.listAgent(id, principal);
    }

    @PostMapping
    public ResponseEntity<IncidentResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody IncidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(principal, request));
    }

    @PatchMapping("/{id}/asignacion")
    public IncidentResponse assign(@PathVariable UUID id, @Valid @RequestBody AssignmentRequest request,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        return service.assign(id, request.agenteId(), principal);
    }

    @PatchMapping("/{id}/estado")
    public IncidentResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody StatusRequest request,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return service.changeStatus(id, request.estado(), request.mensajeResolucion(), principal);
    }

    // Compatibilidad temporal con el PATCH que consume el frontend actual.
    @PatchMapping("/{id}")
    public IncidentResponse update(@PathVariable UUID id, @RequestBody IncidentUpdateRequest request,
                                   @AuthenticationPrincipal UserPrincipal principal) {
        if (request.estado() != null && request.guiaDiagnostico() != null)
            throw new IllegalArgumentException("Actualiza el estado y la guía en solicitudes separadas");
        if (request.estado() != null)
            return service.changeStatus(id, request.estado(), request.mensajeResolucion(), principal);
        if (request.guiaDiagnostico() != null) return service.updateGuide(id, request.guiaDiagnostico(), principal);
        throw new IllegalArgumentException("No se enviaron cambios");
    }

    public record AssignmentRequest(@NotNull UUID agenteId) {}
    public record StatusRequest(@NotBlank String estado, @Size(max = 2000) String mensajeResolucion) {}
    public record IncidentUpdateRequest(String estado, String guiaDiagnostico, String mensajeResolucion) {}
    public record CommentRequest(@NotBlank @Size(max = 2000) String texto) {}

    @GetMapping("/{id}/comentarios")
    public List<IncidentCommentResponse> listComments(@PathVariable UUID id,
                                                       @AuthenticationPrincipal UserPrincipal principal) {
        return comments.list(id, principal);
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<IncidentCommentResponse> addComment(@PathVariable UUID id,
            @Valid @RequestBody CommentRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(comments.add(id, request.texto(), principal));
    }
}
