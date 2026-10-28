package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/** Decorador concreto: permite una instancia PostgreSQL adicional por Q 60.00 al mes. */
public class InstanciaExtra extends DecoradorPlan {

    static final BigDecimal PRECIO = new BigDecimal("60.00");

    public InstanciaExtra(PlanContratable wrappee) {
        super(wrappee);
    }

    @Override
    protected String nombreComplemento() {
        return "1 instancia extra";
    }

    @Override
    public BigDecimal precioMensual() {
        return super.precioMensual().add(PRECIO);
    }

    @Override
    public int instanciasPermitidas() {
        return super.instanciasPermitidas() + 1;
    }
}
