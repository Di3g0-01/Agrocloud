package com.agrocloud.backend.instance.controller;

import com.agrocloud.backend.instance.dto.CreateInstanceRequest;
import com.agrocloud.backend.instance.dto.InstanceResponse;
import com.agrocloud.backend.instance.entity.InstanceStatus;
import com.agrocloud.backend.instance.service.InstanceService;
import com.agrocloud.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/instancias")
@RequiredArgsConstructor
public class InstanceController {

    private final InstanceService service;

    @GetMapping
    public ResponseEntity<List<InstanceResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.isAdminOrSupport()) {
            return ResponseEntity.ok(service.getAllInstances());
        }
        return ResponseEntity.ok(service.getInstancesForUser(principal.id()));
    }

    @GetMapping("/usuario/{userId}")
    public ResponseEntity<List<InstanceResponse>> getByUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (!principal.isAdminOrSupport() && !principal.id().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.getInstancesForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstanceResponse> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(service.getInstanceById(id, principal.id(), principal.isAdminOrSupport()));
    }

    @PostMapping
    public ResponseEntity<InstanceResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateInstanceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createInstance(principal.id(), request));
    }

    @PostMapping("/{id}/restart")
    public ResponseEntity<InstanceResponse> restart(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(service.restartInstance(id, principal.id(), principal.isAdminOrSupport()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SOPORTE_TECNICO')")
    public ResponseEntity<InstanceResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam InstanceStatus status
    ) {
        return ResponseEntity.ok(service.updateInstanceStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        service.deleteInstance(id, principal.id(), principal.isAdminOrSupport());
        return ResponseEntity.noContent().build();
    }
}
