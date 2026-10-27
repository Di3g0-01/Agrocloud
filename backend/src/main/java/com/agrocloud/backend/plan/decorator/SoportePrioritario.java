package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/** Decorador concreto: agrega soporte prioritario 24/7 por Q 35.00 al mes. */
public class SoportePrioritario extends DecoradorPlan {

    static final BigDecimal PRECIO = new BigDecimal("35.00");

    public SoportePrioritario(PlanContratable wrappee) {
        super(wrappee);
    }

    @Override
    protected String nombreComplemento() {
        return "Soporte prioritario";
    }

    @Override
    public BigDecimal precioMensual() {
        return super.precioMensual().add(PRECIO);
    }
}
