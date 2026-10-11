package com.agrocloud.backend.plan.service;

import com.agrocloud.backend.plan.dto.PlanResponse;
import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.dto.UpsertPlanRequest;
import java.util.List;

public interface PlanService {
    List<PlanResponse> getAllPlans();
    PlanResponse getPlanById(String id);
    PlanEntity findEntityById(String id);
    PlanResponse createPlan(UpsertPlanRequest request);
    PlanResponse updatePlan(String id, UpsertPlanRequest request);
    void deletePlan(String id);
}
