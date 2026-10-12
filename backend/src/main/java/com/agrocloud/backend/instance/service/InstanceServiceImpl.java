package com.agrocloud.backend.instance.service;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.InstanceLimitExceededException;
import com.agrocloud.backend.exception.InstanceNotFoundException;
import com.agrocloud.backend.exception.UserNotFoundException;
import com.agrocloud.backend.instance.dto.CreateInstanceRequest;
import com.agrocloud.backend.instance.dto.InstanceCredentialResponse;
import com.agrocloud.backend.instance.dto.InstanceMetricResponse;
import com.agrocloud.backend.instance.dto.InstanceMonitoringResponse;
import com.agrocloud.backend.instance.dto.InstanceResponse;
import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.entity.InstanceMetricEntity;
import com.agrocloud.backend.instance.entity.InstanceStatus;
import com.agrocloud.backend.instance.repository.InstanceMetricRepository;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.notification.NotificationService;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.security.EncryptionService;
import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.service.SubscriptionService;
import com.agrocloud.backend.template.entity.TemplateEntity;
import com.agrocloud.backend.template.repository.TemplateRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InstanceServiceImpl implements InstanceService {

    private final InstanceRepository repository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final TemplateRepository templateRepository;
    private final NotificationService notifications;
    private final EncryptionService encryptionService;
    private final InstanceMetricRepository metricRepository;

    public InstanceServiceImpl(
            InstanceRepository repository,
            UserRepository userRepository,
            SubscriptionService subscriptionService,
            TemplateRepository templateRepository,
            NotificationService notifications,
            EncryptionService encryptionService,
            InstanceMetricRepository metricRepository
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
        this.templateRepository = templateRepository;
        this.notifications = notifications;
        this.encryptionService = encryptionService;
        this.metricRepository = metricRepository;
    }

    @Override
    @Transactional
    public List<InstanceResponse> getInstancesForUser(UUID userId) {
        List<InstanceEntity> list = repository.findByOwnerId(userId);
        list.forEach(this::updateDynamicMetrics);
        return list.stream()
                .map(InstanceResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public List<InstanceResponse> getAllInstances() {
        List<InstanceEntity> list = repository.findAll();
        list.forEach(this::updateDynamicMetrics);
        return list.stream()
                .map(InstanceResponse::from)
                .toList();
    }

    private void updateDynamicMetrics(InstanceEntity entity) {
        if (entity.getStatus() == InstanceStatus.active) {
            double randomCpu = Math.min(95.0, Math.max(5.0, 14.0 + (Math.random() * 12.0 - 6.0)));
            double randomRam = Math.min(95.0, Math.max(10.0, 30.0 + (Math.random() * 8.0 - 4.0)));
            entity.setCpuUsagePercentage(Math.round(randomCpu * 10.0) / 10.0);
            entity.setMemoryUsagePercentage(Math.round(randomRam * 10.0) / 10.0);
            entity.setUptime("99.9%");
        } else if (entity.getStatus() == InstanceStatus.suspended || entity.getStatus() == InstanceStatus.terminated) {
            entity.setCpuUsagePercentage(0.0);
            entity.setMemoryUsagePercentage(0.0);
            entity.setUptime("0%");
        } else if (entity.getStatus() == InstanceStatus.revision) {
            entity.setCpuUsagePercentage(45.0);
            entity.setMemoryUsagePercentage(60.0);
            entity.setUptime("98.5%");
        }
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
        SubscriptionEntity activeSub = subscriptionService.findActiveSubscriptionEntity(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Debes contratar una suscripción activa para poder crear instancias."));

        int maxAllowedInstances = activeSub.getPlan().getMaxInstances();
        double maxStorageGb = activeSub.getPlan().getStorageGb();

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

        String rawPassword = "AgroPass_" + UUID.randomUUID().toString().substring(0, 8) + "!";
        String encryptedPassword = encryptionService.encrypt(rawPassword);

        InstanceEntity entity = new InstanceEntity();
        entity.setName(request.name());
        entity.setTemplate(template.getNombre());
        entity.setOwner(owner);
        entity.setStatus(InstanceStatus.active);
        entity.setVersion("PostgreSQL 16.2");
        entity.setRegion("us-east-1 (Virginia)");
        entity.setHost("db-" + sanitizedName + ".agrocloud.gt");
        entity.setPort(5432);
        entity.setDatabaseName(databaseName);
        entity.setDbUser(dbUser);
        entity.setEncryptedPassword(encryptedPassword);
        entity.setUsedStorageGb(0.1);
        entity.setTotalStorageGb(maxStorageGb);
        entity.setCpuUsagePercentage(5.0);
        entity.setMemoryUsagePercentage(12.0);
        entity.setUptime("100%");

        InstanceEntity saved = repository.save(entity);
        notifications.create(owner, "INSTANCIA_CREADA", "Instancia creada",
                "La instancia " + saved.getName() + " está activa.", saved.getId());
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

        // Registrar métrica de reinicio
        InstanceMetricEntity metric = new InstanceMetricEntity();
        metric.setInstance(entity);
        metric.setUsedStorageGb(entity.getUsedStorageGb());
        metric.setTotalStorageGb(entity.getTotalStorageGb());
        metric.setCpuUsagePercentage(45.0);
        metric.setMemoryUsagePercentage(60.0);
        metric.setStatus(InstanceStatus.active);
        metric.setRecordedAt(Instant.now());
        metricRepository.save(metric);

        InstanceEntity saved = repository.save(entity);
        notifications.create(saved.getOwner(), "INSTANCIA_REINICIADA", "Instancia reiniciada",
                "La instancia " + saved.getName() + " se reinició y está activa.", saved.getId());
        return InstanceResponse.from(saved);
    }

    @Override
    public InstanceResponse updateInstanceStatus(UUID id, InstanceStatus newStatus) {
        InstanceEntity entity = repository.findById(id)
                .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada"));

        if (entity.getStatus() == newStatus) return InstanceResponse.from(entity);
        entity.setStatus(newStatus);
        InstanceEntity saved = repository.save(entity);
        notifications.create(saved.getOwner(), "INSTANCIA_ESTADO", "Estado de instancia actualizado",
                "La instancia " + saved.getName() + " ahora está " + statusLabel(newStatus) + ".", saved.getId());
        return InstanceResponse.from(saved);
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

        metricRepository.deleteByInstanceId(id);
        repository.delete(entity);
        notifications.create(entity.getOwner(), "INSTANCIA_ELIMINADA", "Instancia eliminada",
                "La instancia " + entity.getName() + " fue eliminada.", null);
    }

    private String statusLabel(InstanceStatus status) {
        return switch (status) {
            case active -> "activa";
            case revision -> "en revisión";
            case suspended -> "suspendida";
            case terminated -> "terminada";
        };
    }

    @Override
    @Transactional(readOnly = true)
    public InstanceCredentialResponse getInstanceCredentials(UUID instanceId, UUID requestingUserId, boolean isAdminOrSupport) {
        InstanceEntity entity;
        if (isAdminOrSupport) {
            entity = repository.findById(instanceId)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada"));
        } else {
            entity = repository.findByIdAndOwnerId(instanceId, requestingUserId)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada o no pertenece a la cuenta"));
        }

        String decryptedPassword = encryptionService.decrypt(entity.getEncryptedPassword());

        return new InstanceCredentialResponse(
                entity.getId(),
                entity.getName(),
                entity.getHost(),
                entity.getPort(),
                entity.getDatabaseName(),
                entity.getDbUser(),
                decryptedPassword,
                entity.getRegion(),
                entity.getVersion()
        );
    }

    @Override
    public InstanceMonitoringResponse getInstanceMetrics(UUID instanceId, UUID requestingUserId, boolean isAdminOrSupport) {
        InstanceEntity entity;
        if (isAdminOrSupport) {
            entity = repository.findById(instanceId)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada"));
        } else {
            entity = repository.findByIdAndOwnerId(instanceId, requestingUserId)
                    .orElseThrow(() -> new InstanceNotFoundException("Instancia no encontrada o no pertenece a la cuenta"));
        }

        List<InstanceMetricEntity> metrics = metricRepository.findTop20ByInstanceIdOrderByRecordedAtDesc(instanceId);

        if (metrics.isEmpty()) {
            metrics = new ArrayList<>();
            Instant now = Instant.now();
            double baseStorage = entity.getUsedStorageGb();
            double maxStorage = entity.getTotalStorageGb();

            for (int i = 10; i >= 0; i--) {
                double cpu = Math.min(95.0, Math.max(5.0, entity.getCpuUsagePercentage() + (Math.random() * 8.0 - 4.0)));
                double ram = Math.min(95.0, Math.max(10.0, entity.getMemoryUsagePercentage() + (Math.random() * 6.0 - 3.0)));
                double storage = Math.min(maxStorage, Math.max(0.1, baseStorage + (i * 0.02)));

                InstanceMetricEntity m = new InstanceMetricEntity();
                m.setInstance(entity);
                m.setUsedStorageGb(Math.round(storage * 100.0) / 100.0);
                m.setTotalStorageGb(maxStorage);
                m.setCpuUsagePercentage(Math.round(cpu * 10.0) / 10.0);
                m.setMemoryUsagePercentage(Math.round(ram * 10.0) / 10.0);
                m.setStatus(entity.getStatus());
                m.setRecordedAt(now.minusSeconds(i * 300L));
                metricRepository.save(m);
                metrics.add(m);
            }
        }

        List<InstanceMetricResponse> historyResponses = metrics.stream()
                .map(InstanceMetricResponse::from)
                .toList();

        double currentStoragePct = Math.round((entity.getUsedStorageGb() / entity.getTotalStorageGb()) * 100.0 * 10.0) / 10.0;

        return new InstanceMonitoringResponse(
                entity.getId(),
                entity.getName(),
                entity.getStatus(),
                entity.getUsedStorageGb(),
                entity.getTotalStorageGb(),
                currentStoragePct,
                entity.getCpuUsagePercentage(),
                entity.getMemoryUsagePercentage(),
                entity.getUptime(),
                historyResponses
        );
    }
}
