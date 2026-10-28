package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/** Decorador concreto: agrega 50 GB de almacenamiento por Q 40.00 al mes. */
public class AlmacenamientoExtra extends DecoradorPlan {

    static final double GB_EXTRA = 50.0;
    static final BigDecimal PRECIO = new BigDecimal("40.00");

    public AlmacenamientoExtra(PlanContratable wrappee) {
        super(wrappee);
    }

    @Override
    protected String nombreComplemento() {
        return "50 GB extra";
    }

    @Override
    public BigDecimal precioMensual() {
        return super.precioMensual().add(PRECIO);
    }

    @Override
    public double almacenamientoGb() {
        return super.almacenamientoGb() + GB_EXTRA;
    }
}
