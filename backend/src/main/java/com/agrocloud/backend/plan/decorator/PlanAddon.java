package com.agrocloud.backend.plan.decorator;

import java.util.function.UnaryOperator;

/**
 * Catalog of available plan add-ons.
 *
 * Each value wraps the plan with its concrete decorator.
 */
public enum PlanAddon {

    EXTRA_STORAGE(ExtraStorageDecorator::new),
    EXTRA_INSTANCE(ExtraInstanceDecorator::new),
    DAILY_BACKUP(DailyBackupDecorator::new),
    PRIORITY_SUPPORT(PrioritySupportDecorator::new),

    // Backward compatible aliases
    ALMACENAMIENTO_EXTRA(ExtraStorageDecorator::new),
    INSTANCIA_EXTRA(ExtraInstanceDecorator::new),
    RESPALDO_DIARIO(DailyBackupDecorator::new),
    SOPORTE_PRIORITARIO(PrioritySupportDecorator::new);

    private final UnaryOperator<ContractablePlan> decorator;

    PlanAddon(UnaryOperator<ContractablePlan> decorator) {
        this.decorator = decorator;
    }

    /** Wraps the target plan with this decorator layer. */
    public ContractablePlan applyTo(ContractablePlan plan) {
        return decorator.apply(plan);
    }

    public PlanContratable aplicarA(PlanContratable plan) {
        return (PlanContratable) applyTo(plan);
    }
}

