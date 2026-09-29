package com.agrocloud.backend.plan.service;

import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.repository.PlanRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PlanDataInitializer implements CommandLineRunner {

    private final PlanRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            List<PlanEntity> defaultPlans = List.of(
                    PlanEntity.builder()
                            .id("plan-finca")
                            .name("Finca")
                            .storageGb(10.0)
                            .monthlyPrice(new BigDecimal("25.00"))
                            .description("Ideal para pequeños productores y fincas que inician la digitalización de sus registros.")
                            .maxInstances(1)
                            .popular(false)
                            .build(),
                    PlanEntity.builder()
                            .id("plan-productor")
                            .name("Productor")
                            .storageGb(50.0)
                            .monthlyPrice(new BigDecimal("60.00"))
                            .description("Diseñado para productores agrícolas con un volumen creciente de datos operativos.")
                            .maxInstances(1)
                            .popular(true)
                            .build(),
                    PlanEntity.builder()
                            .id("plan-agro-pro")
                            .name("Agro Pro")
                            .storageGb(100.0)
                            .monthlyPrice(new BigDecimal("120.00"))
                            .description("Para mediano y gran productor que requiere alta disponibilidad y respaldos automatizados.")
                            .maxInstances(2)
                            .popular(false)
                            .build(),
                    PlanEntity.builder()
                            .id("plan-enterprise")
                            .name("Agro Enterprise")
                            .storageGb(250.0)
                            .monthlyPrice(new BigDecimal("250.00"))
                            .description("Solución integral para cooperativas y empresas agroindustriales con alta demanda.")
                            .maxInstances(5)
                            .popular(false)
                            .build()
            );
            repository.saveAll(defaultPlans);
        }
    }
}
