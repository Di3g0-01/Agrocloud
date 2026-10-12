package com.agrocloud.backend.plan.service;

import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.repository.PlanRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PlanDataInitializer implements CommandLineRunner {

    private final PlanRepository repository;

    public PlanDataInitializer(PlanRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            List<PlanEntity> defaultPlans = List.of(
                    createPlan("plan-finca", "Finca", 10.0, new BigDecimal("25.00"),
                            "Ideal para pequeños productores y fincas que inician la digitalización de sus registros.", 1, false),
                    createPlan("plan-productor", "Productor", 50.0, new BigDecimal("60.00"),
                            "Diseñado para productores agrícolas con un volumen creciente de datos operativos.", 1, true),
                    createPlan("plan-agro-pro", "Agro Pro", 100.0, new BigDecimal("120.00"),
                            "Para mediano y gran productor que requiere alta disponibilidad y respaldos automatizados.", 2, false),
                    createPlan("plan-enterprise", "Agro Enterprise", 250.0, new BigDecimal("250.00"),
                            "Solución integral para cooperativas y empresas agroindustriales con alta demanda.", 5, false)
            );
            repository.saveAll(defaultPlans);
        }
    }

    private PlanEntity createPlan(String id, String name, Double storageGb, BigDecimal monthlyPrice,
                                  String description, Integer maxInstances, Boolean popular) {
        PlanEntity plan = new PlanEntity();
        plan.setId(id);
        plan.setName(name);
        plan.setStorageGb(storageGb);
        plan.setMonthlyPrice(monthlyPrice);
        plan.setDescription(description);
        plan.setMaxInstances(maxInstances);
        plan.setPopular(popular);
        plan.setActive(true);
        return plan;
    }
}
