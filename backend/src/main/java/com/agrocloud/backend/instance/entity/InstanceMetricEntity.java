package com.agrocloud.backend.instance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "instance_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstanceMetricEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "instance_id", nullable = false)
    private InstanceEntity instance;

    @Column(name = "used_storage_gb", nullable = false)
    private Double usedStorageGb;

    @Column(name = "total_storage_gb", nullable = false)
    private Double totalStorageGb;

    @Column(name = "cpu_usage_percentage", nullable = false)
    private Double cpuUsagePercentage;

    @Column(name = "memory_usage_percentage", nullable = false)
    private Double memoryUsagePercentage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InstanceStatus status;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (recordedAt == null) {
            recordedAt = Instant.now();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public InstanceEntity getInstance() { return instance; }
    public void setInstance(InstanceEntity instance) { this.instance = instance; }

    public Double getUsedStorageGb() { return usedStorageGb; }
    public void setUsedStorageGb(Double usedStorageGb) { this.usedStorageGb = usedStorageGb; }

    public Double getTotalStorageGb() { return totalStorageGb; }
    public void setTotalStorageGb(Double totalStorageGb) { this.totalStorageGb = totalStorageGb; }

    public Double getCpuUsagePercentage() { return cpuUsagePercentage; }
    public void setCpuUsagePercentage(Double cpuUsagePercentage) { this.cpuUsagePercentage = cpuUsagePercentage; }

    public Double getMemoryUsagePercentage() { return memoryUsagePercentage; }
    public void setMemoryUsagePercentage(Double memoryUsagePercentage) { this.memoryUsagePercentage = memoryUsagePercentage; }

    public InstanceStatus getStatus() { return status; }
    public void setStatus(InstanceStatus status) { this.status = status; }

    public Instant getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
}
