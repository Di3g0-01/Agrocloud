package com.agrocloud.backend.plan.service;

import com.agrocloud.backend.plan.dto.PlanResponse;
import com.agrocloud.backend.plan.entity.PlanEntity;
import java.util.List;

public interface PlanService {
    List<PlanResponse> getAllPlans();
    PlanResponse getPlanById(String id);
    PlanEntity findEntityById(String id);
}
