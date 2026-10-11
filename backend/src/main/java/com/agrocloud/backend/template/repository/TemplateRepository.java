package com.agrocloud.backend.template.repository;

import com.agrocloud.backend.template.entity.TemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TemplateRepository extends JpaRepository<TemplateEntity, String> {
    Optional<TemplateEntity> findByNombreIgnoreCase(String nombre);
}
