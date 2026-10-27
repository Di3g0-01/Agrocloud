package com.agrocloud.backend.plan;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.agrocloud.backend.plan.decorator.Complemento;
import com.agrocloud.backend.plan.decorator.PlanContratable;
import com.agrocloud.backend.plan.decorator.PlanCotizador;
import com.agrocloud.backend.plan.entity.PlanEntity;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class PlanDecoratorTest {

    private final PlanCotizador cotizador = new PlanCotizador();

    private PlanEntity planPro() {
        PlanEntity plan = new PlanEntity();
        plan.setId("plan-pro");
        plan.setName("Agro Pro");
        plan.setMonthlyPrice(new BigDecimal("100.00"));
        plan.setStorageGb(100.0);
        plan.setMaxInstances(3);
        return plan;
    }

    @Test
    void sinComplementosDevuelveElPlanBase() {
        PlanContratable plan = cotizador.cotizar(planPro(), List.of());

        assertEquals(new BigDecimal("100.00"), plan.precioMensual());
        assertEquals("Agro Pro", plan.descripcion());
        assertEquals(List.of(), plan.complementos());
    }

    @Test
    void apilaVariosComplementosSobreElPlanBase() {
        PlanContratable plan = cotizador.cotizar(planPro(), List.of(
                Complemento.ALMACENAMIENTO_EXTRA,
                Complemento.INSTANCIA_EXTRA,
                Complemento.RESPALDO_DIARIO
        ));

        // 100 + 40 + 60 + 25
        assertEquals(new BigDecimal("225.00"), plan.precioMensual());
        assertEquals(150.0, plan.almacenamientoGb());
        assertEquals(4, plan.instanciasPermitidas());
        assertEquals("Agro Pro + 50 GB extra + 1 instancia extra + Respaldo diario", plan.descripcion());
    }

    @Test
    void elMismoComplementoSePuedeAplicarDosVeces() {
        PlanContratable plan = cotizador.cotizar(planPro(), List.of(
                Complemento.ALMACENAMIENTO_EXTRA,
                Complemento.ALMACENAMIENTO_EXTRA
        ));

        assertEquals(new BigDecimal("180.00"), plan.precioMensual());
        assertEquals(200.0, plan.almacenamientoGb());
    }
}
