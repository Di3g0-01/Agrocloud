package com.agrocloud.backend.plan.decorator;

import java.math.BigDecimal;
import java.util.List;

/**
 * Patrón Decorator — COMPONENTE.
 *
 * Interfaz común para el plan base y para todos los complementos que lo envuelven.
 * El resto del sistema (servicios, controladores) solo conoce esta interfaz, así que
 * le da igual si trabaja con un plan simple o con uno decorado con varios complementos.
 */
public interface PlanContratable {

    /** Precio mensual total en quetzales. */
    BigDecimal precioMensual();

    /** Almacenamiento total en GB. */
    double almacenamientoGb();

    /** Número máximo de instancias PostgreSQL permitidas. */
    int instanciasPermitidas();

    /** Descripción legible, por ejemplo "Agro Pro + 50 GB extra + Respaldo diario". */
    String descripcion();

    /** Lista de complementos aplicados, en el orden en que se apilaron. */
    List<String> complementos();
}
