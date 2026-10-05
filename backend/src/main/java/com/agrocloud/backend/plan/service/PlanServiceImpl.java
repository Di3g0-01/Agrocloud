package com.agrocloud.backend.plan.service;

import com.agrocloud.backend.exception.PlanNotFoundException;
import com.agrocloud.backend.plan.dto.PlanResponse;
import com.agrocloud.backend.plan.dto.UpsertPlanRequest;
import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.repository.PlanRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlanServiceImpl implements PlanService {

    private final PlanRepository repository;

    @Override
    public List<PlanResponse> getAllPlans() {
        return repository.findAll().stream()
                .map(PlanResponse::from)
                .toList();
    }

    @Override
    public PlanResponse getPlanById(String id) {
        return PlanResponse.from(findEntityById(id));
    }

    @Override
    public PlanEntity findEntityById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new PlanNotFoundException("Plan with ID '" + id + "' was not found"));
    }

    @Override
    @Transactional
    public PlanResponse createPlan(UpsertPlanRequest request) {
        PlanEntity plan = new PlanEntity();
        plan.setId("plan-" + UUID.randomUUID().toString().substring(0, 12));
        apply(plan, request);
        return PlanResponse.from(repository.save(plan));
    }

    @Override
    @Transactional
    public PlanResponse updatePlan(String id, UpsertPlanRequest request) {
        PlanEntity plan = findEntityById(id);
        apply(plan, request);
        return PlanResponse.from(repository.save(plan));
    }

    @Override
    @Transactional
    public void deletePlan(String id) {
        repository.delete(findEntityById(id));
    }

    private void apply(PlanEntity plan, UpsertPlanRequest request) {
        plan.setName(request.nombre().trim());
        plan.setStorageGb(request.almacenamientoGb());
        plan.setMonthlyPrice(request.precioMensual());
        plan.setDescription(request.descripcion());
        plan.setMaxInstances(request.instanciasPermitidas());
        plan.setPopular(Boolean.TRUE.equals(request.popular()));
        plan.setActive(request.activo() == null || request.activo());
    }
}
