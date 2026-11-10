package com.agrocloud.backend.plan.dto;

import com.agrocloud.backend.plan.decorator.PlanAddon;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.List;

public record QuotePlanRequest(
        @JsonAlias("complementos") List<PlanAddon> addons
) {}

