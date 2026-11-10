package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/**
 * Concrete Decorator: Adds 1 additional PostgreSQL database instance for GTQ 60.00/month.
 */
public class ExtraInstanceDecorator extends PlanDecorator {

    static final BigDecimal PRICE = new BigDecimal("60.00");

    public ExtraInstanceDecorator(ContractablePlan wrappee) {
        super(wrappee);
    }

    @Override
    protected String getAddonName() {
        return "1 extra instance";
    }

    @Override
    public BigDecimal getMonthlyPrice() {
        return super.getMonthlyPrice().add(PRICE);
    }

    @Override
    public int getMaxInstances() {
        return super.getMaxInstances() + 1;
    }
}

