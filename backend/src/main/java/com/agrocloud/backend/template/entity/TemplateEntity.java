package com.agrocloud.backend.template.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agrocloud_plantillas")
public class TemplateEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 1000)
    private String descripcion;

    private Integer tablas;

    private String version;

    private Integer instancias;

    private String estado;

    @Column(length = 2000)
    private String schemaTables;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TemplateEntity() {}

    public TemplateEntity(String id, String nombre, String descripcion, Integer tablas, String version, Integer instancias, String estado, String schemaTables) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tablas = tablas;
        this.version = version;
        this.instancias = instancias;
        this.estado = estado;
        this.schemaTables = schemaTables;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getTablas() { return tablas; }
    public void setTablas(Integer tablas) { this.tablas = tablas; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public Integer getInstancias() { return instancias; }
    public void setInstancias(Integer instancias) { this.instancias = instancias; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getSchemaTables() { return schemaTables; }
    public void setSchemaTables(String schemaTables) { this.schemaTables = schemaTables; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
