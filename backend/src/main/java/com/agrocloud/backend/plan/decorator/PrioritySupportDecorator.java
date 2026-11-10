package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/**
 * Concrete Decorator: Adds 24/7 priority SLA support for GTQ 35.00/month.
 */
public class PrioritySupportDecorator extends PlanDecorator {

    static final BigDecimal PRICE = new BigDecimal("35.00");

    public PrioritySupportDecorator(ContractablePlan wrappee) {
        super(wrappee);
    }

    @Override
    protected String getAddonName() {
        return "Priority support";
    }

    @Override
    public BigDecimal getMonthlyPrice() {
        return super.getMonthlyPrice().add(PRICE);
    }
}

