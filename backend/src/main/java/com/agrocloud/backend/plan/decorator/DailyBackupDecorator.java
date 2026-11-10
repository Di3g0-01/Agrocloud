package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/**
 * Concrete Decorator: Adds automated daily snapshots for GTQ 25.00/month.
 */
public class DailyBackupDecorator extends PlanDecorator {

    static final BigDecimal PRICE = new BigDecimal("25.00");

    public DailyBackupDecorator(ContractablePlan wrappee) {
        super(wrappee);
    }

    @Override
    protected String getAddonName() {
        return "Daily backup";
    }

    @Override
    public BigDecimal getMonthlyPrice() {
        return super.getMonthlyPrice().add(PRICE);
    }
}

