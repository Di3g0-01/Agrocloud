package com.agrocloud.backend.plan.decorator;

import com.agrocloud.backend.plan.entity.PlanEntity;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Backwards compatibility delegator for PlanQuoter.
 */
@Component
public class PlanCotizador {

    private final PlanQuoter quoter;

    public PlanCotizador() {
        this.quoter = new PlanQuoter();
    }

    public PlanCotizador(PlanQuoter quoter) {
        this.quoter = quoter != null ? quoter : new PlanQuoter();
    }

    public PlanContratable cotizar(PlanEntity plan, List<Complemento> complementos) {
        List<PlanAddon> addons = new ArrayList<>();
        if (complementos != null) {
            for (Complemento c : complementos) {
                if (c == null) throw new IllegalArgumentException("Complemento no valido");
                addons.add(PlanAddon.valueOf(c.name()));
            }
        }
        ContractablePlan result = quoter.quote(plan, addons);
        return new PlanContratableWrapper(result);
    }

    private static class PlanContratableWrapper implements PlanContratable {
        private final ContractablePlan inner;
        PlanContratableWrapper(ContractablePlan inner) { this.inner = inner; }
        @Override public java.math.BigDecimal getMonthlyPrice() { return inner.getMonthlyPrice(); }
        @Override public double getStorageGb() { return inner.getStorageGb(); }
        @Override public int getMaxInstances() { return inner.getMaxInstances(); }
        @Override public String getDescription() { return inner.getDescription(); }
        @Override public List<String> getAddons() { return inner.getAddons(); }
    }
}
