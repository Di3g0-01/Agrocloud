package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * GoF Decorator Pattern — BASE DECORATOR.
 */
public abstract class PlanDecorator implements ContractablePlan {

    protected final ContractablePlan wrappee;

    protected PlanDecorator(ContractablePlan wrappee) {
        this.wrappee = Objects.requireNonNull(wrappee, "Wrappee plan cannot be null");
    }

    /** Addon identifier / short name. */
    protected abstract String getAddonName();

    @Override
    public BigDecimal getMonthlyPrice() {
        return wrappee.getMonthlyPrice();
    }

    @Override
    public double getStorageGb() {
        return wrappee.getStorageGb();
    }

    @Override
    public int getMaxInstances() {
        return wrappee.getMaxInstances();
    }

    @Override
    public String getDescription() {
        return wrappee.getDescription() + " + " + getAddonName();
    }

    @Override
    public List<String> getAddons() {
        List<String> list = new ArrayList<>(wrappee.getAddons());
        list.add(getAddonName());
        return List.copyOf(list);
    }
}

