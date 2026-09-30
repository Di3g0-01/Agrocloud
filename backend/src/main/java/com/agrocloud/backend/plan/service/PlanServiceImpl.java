package com.agrocloud.backend.plan.service;

import com.agrocloud.backend.exception.PlanNotFoundException;
import com.agrocloud.backend.plan.dto.PlanResponse;
import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.repository.PlanRepository;
import java.util.List;
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
}
