package com.agrocloud.backend.subscription.service;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.SubscriptionNotFoundException;
import com.agrocloud.backend.exception.UserNotFoundException;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.payment.service.PaymentService;
import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.service.PlanService;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.subscription.dto.CreateSubscriptionRequest;
import com.agrocloud.backend.subscription.dto.SubscriptionResponse;
import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import com.agrocloud.backend.subscription.repository.SubscriptionRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository repository;
    private final UserRepository userRepository;
    private final PlanService planService;
    private final PaymentService paymentService;
    private final InstanceRepository instanceRepository;

    @Override
    public SubscriptionResponse createSubscription(UUID userId, CreateSubscriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        PlanEntity plan = planService.findEntityById(request.planId());
        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new IllegalArgumentException("Este plan no está disponible para contratar");
        }

        long currentInstancesCount = instanceRepository.countByOwnerId(userId);
        if (currentInstancesCount > plan.getMaxInstances()) {
            throw new IllegalArgumentException("Para cambiar a este plan debes eliminar las instancias restantes. Actualmente tienes " + currentInstancesCount + " instancia" + (currentInstancesCount > 1 ? "s" : "") + " y el plan '" + plan.getName() + "' solo permite " + plan.getMaxInstances() + ".");
        }

        // Cancel previous active subscription if changing plans
        repository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.active)
                .ifPresent(previousSub -> {
                    previousSub.setStatus(SubscriptionStatus.cancelled);
                    repository.save(previousSub);
                });

        SubscriptionEntity newSubscription = SubscriptionEntity.builder()
                .user(user)
                .plan(plan)
                .amount(plan.getMonthlyPrice())
                .status(SubscriptionStatus.active)
                .startDate(LocalDate.now())
                .nextBillingDate(LocalDate.now().plusMonths(1))
                .build();

        SubscriptionEntity saved = repository.save(newSubscription);
        paymentService.registerAutomaticPayment(saved.getId(), "Contratación de plan - " + plan.getName());

        return SubscriptionResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getActiveSubscription(UUID userId) {
        return findActiveSubscriptionEntity(userId)
                .map(SubscriptionResponse::from)
                .orElseThrow(() -> new SubscriptionNotFoundException("El usuario no posee una suscripción activa"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getUserSubscriptions(UUID userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(SubscriptionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAllSubscriptions() {
        return repository.findAll().stream()
                .map(SubscriptionResponse::from)
                .toList();
    }

    @Override
    public SubscriptionResponse updateSubscriptionStatus(UUID subscriptionId, SubscriptionStatus status) {
        SubscriptionEntity subscription = repository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Suscripción no encontrada"));
        subscription.setStatus(status);
        return SubscriptionResponse.from(repository.save(subscription));
    }

    @Override
    public SubscriptionResponse renovarSubscription(UUID subscriptionId) {
        SubscriptionEntity subscription = repository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Suscripción no encontrada con ID: " + subscriptionId));

        if (subscription.getStatus() == SubscriptionStatus.cancelled) {
            throw new IllegalStateException("No se puede renovar una suscripción cancelada");
        }

        subscription.setStatus(SubscriptionStatus.active);
        LocalDate baseDate = subscription.getNextBillingDate() != null ? subscription.getNextBillingDate() : LocalDate.now();
        subscription.setNextBillingDate(baseDate.plusMonths(1));

        SubscriptionEntity saved = repository.save(subscription);
        paymentService.registerAutomaticPayment(saved.getId(), "Renovación de suscripción - " + saved.getPlan().getName());

        return SubscriptionResponse.from(saved);
    }

    @Override
    public SubscriptionResponse suspenderSubscription(UUID subscriptionId) {
        SubscriptionEntity subscription = repository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Suscripción no encontrada con ID: " + subscriptionId));

        if (subscription.getStatus() == SubscriptionStatus.suspended) {
            throw new IllegalStateException("La suscripción ya se encuentra suspendida");
        }
        if (subscription.getStatus() == SubscriptionStatus.cancelled) {
            throw new IllegalStateException("No se puede suspender una suscripción cancelada");
        }

        subscription.setStatus(SubscriptionStatus.suspended);
        SubscriptionEntity saved = repository.save(subscription);

        return SubscriptionResponse.from(saved);
    }

    @Override
    public SubscriptionResponse cancelarSubscription(UUID subscriptionId) {
        SubscriptionEntity subscription = repository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Suscripción no encontrada con ID: " + subscriptionId));

        if (subscription.getStatus() == SubscriptionStatus.cancelled) {
            throw new IllegalStateException("La suscripción ya se encuentra cancelada");
        }

        subscription.setStatus(SubscriptionStatus.cancelled);
        SubscriptionEntity saved = repository.save(subscription);

        return SubscriptionResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SubscriptionEntity> findActiveSubscriptionEntity(UUID userId) {
        return repository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.active);
    }
}
