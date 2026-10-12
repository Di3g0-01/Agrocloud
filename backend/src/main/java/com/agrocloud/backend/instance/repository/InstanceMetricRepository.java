package com.agrocloud.backend.instance.repository;

import com.agrocloud.backend.instance.entity.InstanceMetricEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstanceMetricRepository extends JpaRepository<InstanceMetricEntity, UUID> {
    List<InstanceMetricEntity> findTop20ByInstanceIdOrderByRecordedAtDesc(UUID instanceId);
    void deleteByInstanceId(UUID instanceId);
}
