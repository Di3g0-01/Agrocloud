package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;
import java.util.List;

/**
 * GoF Decorator Pattern — COMPONENT.
 *
 * Common interface for base plan and decorators.
 */
public interface ContractablePlan {

    /** Total monthly price in GTQ. */
    BigDecimal getMonthlyPrice();

    /** Total storage in GB. */
    double getStorageGb();

    /** Maximum allowed PostgreSQL instances. */
    int getMaxInstances();

    /** Human-readable plan description including active decorators. */
    String getDescription();

    /** List of applied add-ons in order of addition. */
    List<String> getAddons();

    // Default aliases for backwards compatibility with existing callers
    default BigDecimal precioMensual() { return getMonthlyPrice(); }
    default double almacenamientoGb() { return getStorageGb(); }
    default int instanciasPermitidas() { return getMaxInstances(); }
    default String descripcion() { return getDescription(); }
    default List<String> complementos() { return getAddons(); }
}

