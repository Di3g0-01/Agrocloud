package com.agrocloud.backend.plan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "service_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanEntity {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "storage_gb", nullable = false)
    private Double storageGb;

    @Column(name = "monthly_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_instances", nullable = false)
    private Integer maxInstances;

    @Builder.Default
    @Column(name = "is_popular", nullable = false)
    private Boolean popular = false;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getStorageGb() { return storageGb; }
    public void setStorageGb(Double storageGb) { this.storageGb = storageGb; }

    public BigDecimal getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(BigDecimal monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getMaxInstances() { return maxInstances; }
    public void setMaxInstances(Integer maxInstances) { this.maxInstances = maxInstances; }

    public Boolean getPopular() { return popular; }
    public void setPopular(Boolean popular) { this.popular = popular; }
}
