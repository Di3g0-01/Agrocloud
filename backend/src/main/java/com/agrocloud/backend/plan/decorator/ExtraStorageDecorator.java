package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/**
 * Concrete Decorator: Adds 50 GB storage for GTQ 40.00/month.
 */
public class ExtraStorageDecorator extends PlanDecorator {

    static final double EXTRA_GB = 50.0;
    static final BigDecimal PRICE = new BigDecimal("40.00");

    public ExtraStorageDecorator(ContractablePlan wrappee) {
        super(wrappee);
    }

    @Override
    protected String getAddonName() {
        return "50 GB extra";
    }

    @Override
    public BigDecimal getMonthlyPrice() {
        return super.getMonthlyPrice().add(PRICE);
    }

    @Override
    public double getStorageGb() {
        return super.getStorageGb() + EXTRA_GB;
    }
}

