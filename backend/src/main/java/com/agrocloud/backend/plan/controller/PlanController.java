package com.agrocloud.backend.plan.controller;

import com.agrocloud.backend.plan.dto.CotizacionPlanResponse;
import com.agrocloud.backend.plan.dto.CotizarPlanRequest;
import com.agrocloud.backend.plan.dto.PlanResponse;
import com.agrocloud.backend.plan.dto.UpsertPlanRequest;
import com.agrocloud.backend.plan.service.PlanService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/planes")
public class PlanController {

    private final PlanService service;

    public PlanController(PlanService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PlanResponse>> list() {
        return ResponseEntity.ok(service.getAllPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.getPlanById(id));
    }

    /** Calcula precio, almacenamiento e instancias de un plan con complementos (patrón Decorator). */
    @PostMapping("/{id}/cotizar")
    public ResponseEntity<CotizacionPlanResponse> cotizar(@PathVariable String id, @RequestBody(required = false) CotizarPlanRequest request) {
        return ResponseEntity.ok(service.cotizarPlan(id, request));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PlanResponse> create(@Valid @RequestBody UpsertPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createPlan(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<PlanResponse> update(@PathVariable String id, @Valid @RequestBody UpsertPlanRequest request) {
        return ResponseEntity.ok(service.updatePlan(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}
