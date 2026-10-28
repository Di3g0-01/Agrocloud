package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;

/** Decorador concreto: agrega respaldos automáticos diarios por Q 25.00 al mes. */
public class RespaldoDiario extends DecoradorPlan {

    static final BigDecimal PRECIO = new BigDecimal("25.00");

    public RespaldoDiario(PlanContratable wrappee) {
        super(wrappee);
    }

    @Override
    protected String nombreComplemento() {
        return "Respaldo diario";
    }

    @Override
    public BigDecimal precioMensual() {
        return super.precioMensual().add(PRECIO);
    }
}
