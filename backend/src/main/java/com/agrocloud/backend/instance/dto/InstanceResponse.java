package com.agrocloud.backend.instance.dto;

import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.entity.InstanceStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

public record InstanceResponse(
        UUID id,
        @JsonProperty("nombre") String name,
        @JsonProperty("plantilla") String template,
        @JsonProperty("cliente") String clientOrganization,
        @JsonProperty("usuarioId") UUID ownerUserId,
        @JsonProperty("tipo") String version,
        @JsonProperty("estado") InstanceStatus status,
        @JsonProperty("version") String dbEngineVersion,
        @JsonProperty("uptime") String uptime,
        @JsonProperty("cpu") Double cpuUsagePercentage,
        @JsonProperty("memoria") Double memoryUsagePercentage,
        @JsonProperty("almacenamientoUsadoGb") Double usedStorageGb,
        @JsonProperty("almacenamientoTotalGb") Double totalStorageGb,
        @JsonProperty("region") String region,
        @JsonProperty("host") String host,
        @JsonProperty("puerto") Integer port,
        @JsonProperty("databaseName") String databaseName,
        @JsonProperty("dbUser") String dbUser,
        @JsonProperty("fechaCreacion") LocalDate createdAt
) {
    public static InstanceResponse from(InstanceEntity entity) {
        LocalDate createdLocalDate = entity.getCreatedAt() != null
                ? entity.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate()
                : LocalDate.now();

        return new InstanceResponse(
                entity.getId(),
                entity.getName(),
                entity.getTemplate(),
                entity.getOwner() != null ? entity.getOwner().getOrganizationName() : "Desconocido",
                entity.getOwner() != null ? entity.getOwner().getId() : null,
                entity.getVersion(),
                entity.getStatus(),
                entity.getVersion(),
                entity.getUptime(),
                entity.getCpuUsagePercentage(),
                entity.getMemoryUsagePercentage(),
                entity.getUsedStorageGb(),
                entity.getTotalStorageGb(),
                entity.getRegion(),
                entity.getHost(),
                entity.getPort(),
                entity.getDatabaseName(),
                entity.getDbUser(),
                createdLocalDate
        );
    }
}
