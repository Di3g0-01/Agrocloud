package com.agrocloud.backend.plan.decorator;

import com.agrocloud.backend.plan.entity.PlanEntity;

/**
 * Backwards compatibility alias for BasePlan.
 */
public class PlanBase extends BasePlan implements PlanContratable {
    public PlanBase(PlanEntity plan) {
        super(plan);
    }
}
