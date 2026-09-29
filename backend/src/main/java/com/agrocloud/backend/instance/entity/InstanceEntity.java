package com.agrocloud.backend.instance.entity;

import com.agrocloud.backend.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "instances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstanceEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String template;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String version = "PostgreSQL 16.2";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InstanceStatus status = InstanceStatus.active;

    @Builder.Default
    @Column(nullable = false, length = 100)
    private String region = "us-east-1 (Virginia)";

    @Column(nullable = false, length = 150)
    private String host;

    @Builder.Default
    @Column(nullable = false)
    private Integer port = 5432;

    @Column(name = "database_name", nullable = false, length = 100)
    private String databaseName;

    @Column(name = "db_user", nullable = false, length = 100)
    private String dbUser;

    @Column(name = "encrypted_password", nullable = false, length = 255)
    private String encryptedPassword;

    @Builder.Default
    @Column(name = "used_storage_gb", nullable = false)
    private Double usedStorageGb = 0.5;

    @Builder.Default
    @Column(name = "total_storage_gb", nullable = false)
    private Double totalStorageGb = 10.0;

    @Builder.Default
    @Column(name = "cpu_usage_percentage", nullable = false)
    private Double cpuUsagePercentage = 15.0;

    @Builder.Default
    @Column(name = "memory_usage_percentage", nullable = false)
    private Double memoryUsagePercentage = 30.0;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String uptime = "99.9%";

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public InstanceStatus getStatus() { return status; }
    public void setStatus(InstanceStatus status) { this.status = status; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }

    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }

    public String getDatabaseName() { return databaseName; }
    public void setDatabaseName(String databaseName) { this.databaseName = databaseName; }

    public String getDbUser() { return dbUser; }
    public void setDbUser(String dbUser) { this.dbUser = dbUser; }

    public String getEncryptedPassword() { return encryptedPassword; }
    public void setEncryptedPassword(String encryptedPassword) { this.encryptedPassword = encryptedPassword; }

    public Double getUsedStorageGb() { return usedStorageGb; }
    public void setUsedStorageGb(Double usedStorageGb) { this.usedStorageGb = usedStorageGb; }

    public Double getTotalStorageGb() { return totalStorageGb; }
    public void setTotalStorageGb(Double totalStorageGb) { this.totalStorageGb = totalStorageGb; }

    public Double getCpuUsagePercentage() { return cpuUsagePercentage; }
    public void setCpuUsagePercentage(Double cpuUsagePercentage) { this.cpuUsagePercentage = cpuUsagePercentage; }

    public Double getMemoryUsagePercentage() { return memoryUsagePercentage; }
    public void setMemoryUsagePercentage(Double memoryUsagePercentage) { this.memoryUsagePercentage = memoryUsagePercentage; }

    public String getUptime() { return uptime; }
    public void setUptime(String uptime) { this.uptime = uptime; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
