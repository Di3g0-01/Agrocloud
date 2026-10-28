package com.agrocloud.backend.plan.decorator;

import java.util.function.UnaryOperator;

/**
 * Catálogo de complementos que el cliente puede pedir desde el frontend.
 *
 * Cada valor sabe qué decorador aplicar. Así el resto del código no depende de las
 * clases concretas de decoradores (reduce dependencias): solo recibe una lista de
 * códigos como ["ALMACENAMIENTO_EXTRA", "RESPALDO_DIARIO"].
 */
public enum Complemento {

    ALMACENAMIENTO_EXTRA(AlmacenamientoExtra::new),
    INSTANCIA_EXTRA(InstanciaExtra::new),
    RESPALDO_DIARIO(RespaldoDiario::new),
    SOPORTE_PRIORITARIO(SoportePrioritario::new);

    private final UnaryOperator<PlanContratable> decorador;

    Complemento(UnaryOperator<PlanContratable> decorador) {
        this.decorador = decorador;
    }

    /** Envuelve el plan recibido en una capa más. */
    public PlanContratable aplicarA(PlanContratable plan) {
        return decorador.apply(plan);
    }
}
