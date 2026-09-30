package com.agrocloud.backend.plan.repository;

import com.agrocloud.backend.plan.entity.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PlanRepository extends JpaRepository<PlanEntity, String> {
}
