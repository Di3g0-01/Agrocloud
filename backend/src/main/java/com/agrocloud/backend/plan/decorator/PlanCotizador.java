package com.agrocloud.backend.plan.decorator;

import com.agrocloud.backend.plan.entity.PlanEntity;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Patrón Decorator — CLIENTE.
 *
 * Arma la "pila" de decoradores a partir del plan base y de los complementos que
 * pidió el usuario, trabajando siempre a través de la interfaz PlanContratable.
 */
@Component
public class PlanCotizador {

    public PlanContratable cotizar(PlanEntity plan, List<Complemento> complementos) {
        PlanContratable pila = new PlanBase(plan);
        if (complementos == null) {
            return pila;
        }
        for (Complemento complemento : complementos) {
            if (complemento == null) {
                throw new IllegalArgumentException("Complemento no válido");
            }
            pila = complemento.aplicarA(pila);
        }
        return pila;
    }
}
