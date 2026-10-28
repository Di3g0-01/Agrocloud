package com.agrocloud.backend.plan.decorator;

import com.agrocloud.backend.plan.entity.PlanEntity;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/**
 * Patrón Decorator — COMPONENTE CONCRETO.
 *
 * Es el "producto base": el plan tal como está guardado en la base de datos
 * (Agro Starter, Agro Pro, Agro Enterprise...), sin ningún complemento.
 */
public class PlanBase implements PlanContratable {

    private final PlanEntity plan;

    public PlanBase(PlanEntity plan) {
        this.plan = Objects.requireNonNull(plan, "El plan base es obligatorio");
    }

    @Override
    public BigDecimal precioMensual() {
        return plan.getMonthlyPrice();
    }

    @Override
    public double almacenamientoGb() {
        return plan.getStorageGb();
    }

    @Override
    public int instanciasPermitidas() {
        return plan.getMaxInstances();
    }

    @Override
    public String descripcion() {
        return plan.getName();
    }

    @Override
    public List<String> complementos() {
        return List.of();
    }
}
