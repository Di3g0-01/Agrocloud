package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Patrón Decorator — DECORADOR BASE.
 *
 * Implementa la misma interfaz que el plan y guarda una referencia (wrappee) a
 * cualquier PlanContratable: un PlanBase u otro decorador. Por sí solo no agrega
 * nada; solo delega. Los decoradores concretos heredan de aquí y suman lo suyo.
 */
public abstract class DecoradorPlan implements PlanContratable {

    protected final PlanContratable wrappee;

    protected DecoradorPlan(PlanContratable wrappee) {
        this.wrappee = Objects.requireNonNull(wrappee, "El plan a decorar es obligatorio");
    }

    /** Nombre corto del complemento, usado en la descripción y en la lista de complementos. */
    protected abstract String nombreComplemento();

    @Override
    public BigDecimal precioMensual() {
        return wrappee.precioMensual();
    }

    @Override
    public double almacenamientoGb() {
        return wrappee.almacenamientoGb();
    }

    @Override
    public int instanciasPermitidas() {
        return wrappee.instanciasPermitidas();
    }

    @Override
    public String descripcion() {
        return wrappee.descripcion() + " + " + nombreComplemento();
    }

    @Override
    public List<String> complementos() {
        List<String> lista = new ArrayList<>(wrappee.complementos());
        lista.add(nombreComplemento());
        return List.copyOf(lista);
    }
}
