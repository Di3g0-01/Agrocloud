package com.agrocloud.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class RoleEntity {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "code", length = 20, nullable = false)
    private Role code;

    protected RoleEntity() {
    }

    public RoleEntity(Role code) {
        this.code = code;
    }

    public Role getCode() {
        return code;
    }
}
