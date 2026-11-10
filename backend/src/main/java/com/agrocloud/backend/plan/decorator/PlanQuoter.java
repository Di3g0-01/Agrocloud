package com.agrocloud.backend.plan.decorator;

import com.agrocloud.backend.plan.entity.PlanEntity;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * GoF Decorator Pattern — CLIENT / QUOTATION SERVICE.
 *
 * Stacks decorators onto the base plan dynamically.
 */
@Component
public class PlanQuoter {

    public ContractablePlan quote(PlanEntity plan, List<PlanAddon> addons) {
        ContractablePlan stack = new BasePlan(plan);
        if (addons == null) {
            return stack;
        }
        for (PlanAddon addon : addons) {
            if (addon == null) {
                throw new IllegalArgumentException("Addon cannot be null");
            }
            stack = addon.applyTo(stack);
        }
        return stack;
    }
}

