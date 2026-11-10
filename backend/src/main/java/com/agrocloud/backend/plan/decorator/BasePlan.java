package com.agrocloud.backend.plan.decorator;

import com.agrocloud.backend.plan.entity.PlanEntity;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/**
 * GoF Decorator Pattern — CONCRETE COMPONENT.
 */
public class BasePlan implements ContractablePlan {

    private final PlanEntity plan;

    public BasePlan(PlanEntity plan) {
        this.plan = Objects.requireNonNull(plan, "Base plan is required");
    }

    @Override
    public BigDecimal getMonthlyPrice() {
        return plan.getMonthlyPrice();
    }

    @Override
    public double getStorageGb() {
        return plan.getStorageGb();
    }

    @Override
    public int getMaxInstances() {
        return plan.getMaxInstances();
    }

    @Override
    public String getDescription() {
        return plan.getName();
    }

    @Override
    public List<String> getAddons() {
        return List.of();
    }
}

