package com.agrocloud.backend.plan.repository;

import com.agrocloud.backend.plan.entity.PlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanRepository extends JpaRepository<PlanEntity, String> {
}
