package com.agrocloud.backend.plan.decorator;

/**
 * Backwards compatibility alias for PlanDecorator.
 */
public abstract class DecoradorPlan extends PlanDecorator implements PlanContratable {
    protected DecoradorPlan(ContractablePlan wrappee) {
        super(wrappee);
    }

    @Override
    protected String getAddonName() {
        return nombreComplemento();
    }

    protected abstract String nombreComplemento();
}
