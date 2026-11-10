package com.agrocloud.backend.plan.decorator;

import java.util.function.UnaryOperator;

/**
 * Backwards compatibility alias for PlanAddon.
 */
public enum Complemento {

    ALMACENAMIENTO_EXTRA(ExtraStorageDecorator::new),
    INSTANCIA_EXTRA(ExtraInstanceDecorator::new),
    RESPALDO_DIARIO(DailyBackupDecorator::new),
    SOPORTE_PRIORITARIO(PrioritySupportDecorator::new);

    private final UnaryOperator<ContractablePlan> decorador;

    Complemento(UnaryOperator<ContractablePlan> decorador) {
        this.decorador = decorador;
    }

    public PlanContratable aplicarA(PlanContratable plan) {
        return (PlanContratable) (Object) decorador.apply(plan);
    }
}
