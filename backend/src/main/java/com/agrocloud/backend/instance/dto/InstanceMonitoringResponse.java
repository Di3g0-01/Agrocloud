package com.agrocloud.backend.instance.dto;

import com.agrocloud.backend.instance.entity.InstanceStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.UUID;

public record InstanceMonitoringResponse(
        @JsonProperty("instanciaId") UUID instanceId,
        @JsonProperty("nombreInstancia") String instanceName,
        @JsonProperty("estadoActual") InstanceStatus currentStatus,
        @JsonProperty("almacenamientoUsadoGb") Double usedStorageGb,
        @JsonProperty("almacenamientoTotalGb") Double totalStorageGb,
        @JsonProperty("porcentajeAlmacenamientoUsado") Double storagePercentage,
        @JsonProperty("cpuActualPercentage") Double cpuPercentage,
        @JsonProperty("memoriaActualPercentage") Double memoryPercentage,
        @JsonProperty("uptime") String uptime,
        @JsonProperty("historialMetricas") List<InstanceMetricResponse> metricHistory
) {}
