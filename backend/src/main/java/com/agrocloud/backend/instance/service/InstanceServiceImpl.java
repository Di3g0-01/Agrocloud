package com.agrocloud.backend.instance.service;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.InstanceLimitExceededException;
import com.agrocloud.backend.exception.InstanceNotFoundException;
import com.agrocloud.backend.exception.UserNotFoundException;
import com.agrocloud.backend.instance.dto.CreateInstanceRequest;
import com.agrocloud.backend.instance.dto.InstanceResponse;
import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.entity.InstanceStatus;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.service.SubscriptionService;
import com.agrocloud.backend.template.repository.TemplateRepository;
import com.agrocloud.backend.template.entity.TemplateEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InstanceServiceImpl implements InstanceService {

    private final InstanceRepository repository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final TemplateRepository templateRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InstanceResponse> getInstancesForUser(UUID userId) {
        return repository.findByOwnerId(userId).stream()
                .map(InstanceResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InstanceResponse> getAllInstances() {
        return repository.findAll().stream()
                .map(InstanceResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InstanceResponse getInstanceById(UUID id, UUID requestingUserId, boolean isAdminOrSupport) {
        InstanceEntity entity;
        if (isAdminOrSupport) {
            entity = repository.findById(id)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada"));
        } else {
            entity = repository.findByIdAndOwnerId(id, requestingUserId)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada o no pertenece a la cuenta"));
        }
        return InstanceResponse.from(entity);
    }

    @Override
    public InstanceResponse createInstance(UUID ownerId, CreateInstanceRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        long currentCount = repository.countByOwnerId(ownerId);
        Optional<SubscriptionEntity> activeSub = subscriptionService.findActiveSubscriptionEntity(ownerId);

        int maxAllowedInstances = activeSub.map(sub -> sub.getPlan().getMaxInstances()).orElse(1);
        double maxStorageGb = activeSub.map(sub -> sub.getPlan().getStorageGb()).orElse(10.0);

        if (currentCount >= maxAllowedInstances) {
            throw new InstanceLimitExceededException(
                    "Has alcanzado el límite de instancias (" + maxAllowedInstances + ") permitido por tu plan. Actualiza tu plan para crear más instancias."
            );
        }

        String sanitizedName = request.name().toLowerCase().replaceAll("[^a-z0-9_-]", "");
        String databaseName = sanitizedName.replace("-", "_") + "_db";
        String dbUser = "agrouser_" + (owner.getOrganizationName() != null ? owner.getOrganizationName().toLowerCase().replaceAll("[^a-z0-9]", "") : "client");

        String requestedTemplate = request.template() == null ? "Cultivos y parcelas" : request.template().trim();
        TemplateEntity template = templateRepository.findByNombreIgnoreCase(requestedTemplate)
                .orElseThrow(() -> new IllegalArgumentException("La plantilla seleccionada no existe"));
        if (!"Activa".equals(template.getEstado())) {
            throw new IllegalArgumentException("La plantilla seleccionada no está disponible");
        }

        InstanceEntity entity = InstanceEntity.builder()
                .name(request.name())
                .template(template.getNombre())
                .owner(owner)
                .status(InstanceStatus.active)
                .version("PostgreSQL 16.2")
                .region("us-east-1 (Virginia)")
                .host("db-" + sanitizedName + ".agrocloud.gt")
                .port(5432)
                .databaseName(databaseName)
                .dbUser(dbUser)
                .encryptedPassword("pg_sec_key_" + UUID.randomUUID().toString().substring(0, 8))
                .usedStorageGb(0.1)
                .totalStorageGb(maxStorageGb)
                .cpuUsagePercentage(5.0)
                .memoryUsagePercentage(12.0)
                .uptime("100%")
                .build();

        InstanceEntity saved = repository.save(entity);
        return InstanceResponse.from(saved);
    }

    @Override
    public InstanceResponse restartInstance(UUID id, UUID requestingUserId, boolean isAdminOrSupport) {
        InstanceEntity entity;
        if (isAdminOrSupport) {
            entity = repository.findById(id)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada"));
        } else {
            entity = repository.findByIdAndOwnerId(id, requestingUserId)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada o no pertenece a la cuenta"));
        }

        entity.setStatus(InstanceStatus.active);
        entity.setUptime("99.9%");
        return InstanceResponse.from(repository.save(entity));
    }

    @Override
    public InstanceResponse updateInstanceStatus(UUID id, InstanceStatus newStatus) {
        InstanceEntity entity = repository.findById(id)
                .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada"));

        entity.setStatus(newStatus);
        return InstanceResponse.from(repository.save(entity));
    }

    @Override
    public void deleteInstance(UUID id, UUID requestingUserId, boolean isAdminOrSupport) {
        InstanceEntity entity;
        if (isAdminOrSupport) {
            entity = repository.findById(id)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada"));
        } else {
            entity = repository.findByIdAndOwnerId(id, requestingUserId)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada o no pertenece a la cuenta"));
        }

        repository.delete(entity);
    }
}
