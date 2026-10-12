package com.agrocloud.backend.instance.dto;

import com.agrocloud.backend.instance.entity.InstanceMetricEntity;
import com.agrocloud.backend.instance.entity.InstanceStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.UUID;

public record InstanceMetricResponse(
        UUID id,
        @JsonProperty("instanciaId") UUID instanceId,
        @JsonProperty("almacenamientoUsadoGb") Double usedStorageGb,
        @JsonProperty("almacenamientoTotalGb") Double totalStorageGb,
        @JsonProperty("cpuUsoPorcentaje") Double cpuUsagePercentage,
        @JsonProperty("memoriaUsoPorcentaje") Double memoryUsagePercentage,
        @JsonProperty("estado") InstanceStatus status,
        @JsonProperty("timestamp") Instant recordedAt
) {
    public static InstanceMetricResponse from(InstanceMetricEntity entity) {
        return new InstanceMetricResponse(
                entity.getId(),
                entity.getInstance() != null ? entity.getInstance().getId() : null,
                entity.getUsedStorageGb(),
                entity.getTotalStorageGb(),
                entity.getCpuUsagePercentage(),
                entity.getMemoryUsagePercentage(),
                entity.getStatus(),
                entity.getRecordedAt()
        );
    }
}
