package com.agrocloud.backend.subscription.service;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.exception.SubscriptionNotFoundException;
import com.agrocloud.backend.exception.UserNotFoundException;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.notification.NotificationService;
import com.agrocloud.backend.payment.service.PaymentService;
import com.agrocloud.backend.plan.decorator.Complemento;
import com.agrocloud.backend.plan.decorator.PlanContratable;
import com.agrocloud.backend.plan.decorator.PlanCotizador;
import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.service.PlanService;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.subscription.dto.CreateSubscriptionRequest;
import com.agrocloud.backend.subscription.dto.SubscriptionResponse;
import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import com.agrocloud.backend.subscription.repository.SubscriptionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository repository;
    private final UserRepository userRepository;
    private final PlanService planService;
    private final PaymentService paymentService;
    private final InstanceRepository instanceRepository;
    private final PlanCotizador planCotizador;
    private final NotificationService notificationService;

    public SubscriptionServiceImpl(
            SubscriptionRepository repository,
            UserRepository userRepository,
            PlanService planService,
            PaymentService paymentService,
            InstanceRepository instanceRepository,
            PlanCotizador planCotizador,
            NotificationService notificationService
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.planService = planService;
        this.paymentService = paymentService;
        this.instanceRepository = instanceRepository;
        this.planCotizador = planCotizador;
        this.notificationService = notificationService;
    }

    @Override
    public SubscriptionResponse createSubscription(UUID userId, CreateSubscriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        if (findActiveSubscriptionEntity(userId).isPresent()) {
            throw new IllegalStateException("Ya tienes una suscripción activa. Utiliza la opción de cambiar plan.");
        }

        PlanContratable planContratado = validateAndQuotePlan(userId, request);
        cancelPendingSubscriptions(userId);

        SubscriptionEntity newSubscription = buildSubscription(
                user, planService.findEntityById(request.planId()), planContratado, SubscriptionStatus.active);

        List<String> addonNames = request.complementos() != null
                ? request.complementos().stream().map(Enum::name).toList()
                : List.of();
        newSubscription.setAddonsList(addonNames);
        newSubscription.setMaxInstances(planContratado.instanciasPermitidas());
        newSubscription.setStorageGb(planContratado.almacenamientoGb());
        newSubscription.setPendingPaymentAmount(planContratado.precioMensual());
        newSubscription.setPaymentConcept("Contratación de plan - " + planContratado.descripcion());

        SubscriptionEntity saved = repository.save(newSubscription);
        paymentService.registerAutomaticPayment(saved.getId(), saved.getPendingPaymentAmount(), saved.getPaymentConcept());
        notificationService.create(user, "SUSCRIPCION_ACTIVADA", "Suscripción activada",
                "Tu plan " + saved.getPlan().getName() + " está activo. Próxima renovación: "
                        + saved.getNextBillingDate() + ".", saved.getId());

        return SubscriptionResponse.from(saved);
    }

    @Override
    public SubscriptionResponse preparePlanChange(UUID userId, CreateSubscriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        SubscriptionEntity active = findActiveSubscriptionEntity(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("El usuario no posee una suscripción activa"));

        boolean samePlan = active.getPlan().getId().equals(request.planId());
        List<String> currentAddons = active.getAddonsList();
        List<String> requestedAddons = request.complementos() != null
                ? request.complementos().stream().map(Enum::name).toList()
                : List.of();

        if (samePlan && currentAddons.equals(requestedAddons)) {
            throw new IllegalArgumentException("Ya cuentas con esta configuración exacta de plan y complementos.");
        }

        PlanContratable planContratado = validateAndQuotePlan(userId, request);
        cancelPendingSubscriptions(userId);

        SubscriptionEntity pending = buildSubscription(
                user, planService.findEntityById(request.planId()), planContratado, SubscriptionStatus.pending_payment);

        pending.setAddonsList(requestedAddons);
        pending.setMaxInstances(planContratado.instanciasPermitidas());
        pending.setStorageGb(planContratado.almacenamientoGb());

        BigDecimal precioNuevo = planContratado.precioMensual();
        BigDecimal precioActual = active.getAmount() != null ? active.getAmount() : BigDecimal.ZERO;

        if (samePlan) {
            BigDecimal diff = precioNuevo.subtract(precioActual);
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                pending.setPendingPaymentAmount(diff);
                String addonDesc = describeAddonDifference(currentAddons, requestedAddons);
                pending.setPaymentConcept("Ajuste de complementos - " + addonDesc);
            } else {
                pending.setPendingPaymentAmount(BigDecimal.ZERO);
                pending.setPaymentConcept("Ajuste de complementos (Reducción) - Plan " + active.getPlan().getName());
            }
        } else {
            // Cambio de plan
            BigDecimal diff = precioNuevo.subtract(precioActual);
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                pending.setPendingPaymentAmount(diff);
            } else {
                pending.setPendingPaymentAmount(precioNuevo);
            }
            pending.setPaymentConcept("Cambio de plan - " + pending.getPlan().getName());
        }

        return SubscriptionResponse.from(repository.save(pending));
    }

    @Override
    public SubscriptionResponse updateSubscriptionAddons(UUID userId, CreateSubscriptionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        SubscriptionEntity active = findActiveSubscriptionEntity(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("El usuario no posee una suscripción activa"));

        PlanEntity plan = active.getPlan();
        List<Complemento> requestedComplementos = request.complementos() != null
                ? request.complementos()
                : List.of();

        PlanContratable quoted = planCotizador.cotizar(plan, requestedComplementos);

        long currentCount = instanceRepository.countByOwnerId(userId);
        if (currentCount > quoted.instanciasPermitidas()) {
            throw new IllegalArgumentException("No puedes reducir tus complementos: actualmente tienes "
                    + currentCount + " instancia(s) creada(s) y la nueva configuración solo permite "
                    + quoted.instanciasPermitidas() + ". Debes eliminar "
                    + (currentCount - quoted.instanciasPermitidas()) + " instancia(s) antes de quitar el extra.");
        }

        double usedStorageGb = instanceRepository.findByOwnerId(userId).stream()
                .mapToDouble(instance -> instance.getUsedStorageGb() != null ? instance.getUsedStorageGb() : 0.0)
                .sum();
        if (usedStorageGb > quoted.almacenamientoGb()) {
            throw new IllegalArgumentException("No puedes reducir tus complementos: actualmente utilizas "
                    + String.format(java.util.Locale.US, "%.2f", usedStorageGb) + " GB y la nueva configuración permite "
                    + quoted.almacenamientoGb() + " GB.");
        }

        BigDecimal precioNuevo = quoted.precioMensual();
        BigDecimal precioActual = active.getAmount() != null ? active.getAmount() : BigDecimal.ZERO;
        BigDecimal diff = precioNuevo.subtract(precioActual);

        // Si diff > 0, requiere cobro de diferencia inmediata
        if (diff.compareTo(BigDecimal.ZERO) > 0) {
            return preparePlanChange(userId, new CreateSubscriptionRequest(plan.getId(), requestedComplementos));
        }

        // Si diff <= 0 (eliminación de complementos / sin costo adicional):
        // Se aplica inmediatamente sobre la suscripción activa
        List<String> requestedAddonNames = requestedComplementos.stream().map(Enum::name).toList();
        active.setAddonsList(requestedAddonNames);
        active.setMaxInstances(quoted.instanciasPermitidas());
        active.setStorageGb(quoted.almacenamientoGb());
        active.setAmount(precioNuevo);

        SubscriptionEntity saved = repository.save(active);

        notificationService.create(user, "COMPLEMENTOS_ACTUALIZADOS", "Complementos actualizados",
                "Tus complementos han sido modificados exitosamente. Tu nueva cuota mensual será de Q "
                        + saved.getAmount() + " a partir del " + saved.getNextBillingDate() + ".", saved.getId());

        return SubscriptionResponse.from(saved);
    }

    @Override
    public SubscriptionResponse confirmPlanChange(UUID userId, UUID subscriptionId) {
        SubscriptionEntity pending = findOwnedSubscription(userId, subscriptionId);
        if (pending.getStatus() != SubscriptionStatus.pending_payment) {
            if (pending.getStatus() == SubscriptionStatus.active) {
                return SubscriptionResponse.from(pending);
            }
            throw new IllegalStateException("Este cambio de plan ya no está pendiente de pago");
        }

        BigDecimal chargeAmount = pending.getPendingPaymentAmount() != null
                ? pending.getPendingPaymentAmount()
                : pending.getAmount();
        String concept = pending.getPaymentConcept() != null
                ? pending.getPaymentConcept()
                : ("Cambio de plan - " + pending.getPlan().getName());

        // Se registra el cobro antes de reemplazar el plan vigente si hay monto por cobrar
        if (pending.getPendingPaymentAmount() != null) {
            if (chargeAmount.compareTo(BigDecimal.ZERO) > 0) {
                paymentService.registerAutomaticPayment(pending.getId(), chargeAmount, concept);
            }
        } else {
            paymentService.registerAutomaticPayment(pending.getId(), concept);
        }

        for (SubscriptionEntity subscription : repository.findByUserIdOrderByCreatedAtDesc(userId)) {
            if (!subscription.getId().equals(pending.getId())
                    && subscription.getStatus() == SubscriptionStatus.active) {
                subscription.setStatus(SubscriptionStatus.cancelled);
                subscription.setCancelAtPeriodEnd(false);
                subscription.setCancellationDate(LocalDate.now());
                repository.save(subscription);
            }
        }

        LocalDate today = LocalDate.now();
        pending.setStatus(SubscriptionStatus.active);
        pending.setStartDate(today);
        pending.setNextBillingDate(today.plusMonths(1));
        pending.setCancelAtPeriodEnd(false);
        pending.setCancellationDate(null);
        SubscriptionEntity saved = repository.save(pending);

        String notifMsg = chargeAmount.compareTo(BigDecimal.ZERO) > 0
                ? "Tu plan " + saved.getPlan().getName() + " se actualizó exitosamente. Próxima cuota mensual: Q " + saved.getAmount() + "."
                : "Se actualizaron los complementos de tu plan " + saved.getPlan().getName() + ". Tu nueva cuota mensual será de Q " + saved.getAmount() + ".";

        notificationService.create(saved.getUser(), "SUSCRIPCION_CAMBIADA", "Plan actualizado", notifMsg, saved.getId());
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
    public SubscriptionResponse cancelarSubscription(UUID userId, UUID subscriptionId) {
        SubscriptionEntity subscription = findOwnedSubscription(userId, subscriptionId);

        if (subscription.getStatus() == SubscriptionStatus.cancelled) {
            throw new IllegalStateException("La suscripción ya se encuentra cancelada");
        }
        if (subscription.getStatus() != SubscriptionStatus.active) {
            throw new IllegalStateException("Solo se puede programar la cancelación de una suscripción activa");
        }
        if (Boolean.TRUE.equals(subscription.getCancelAtPeriodEnd())) {
            throw new IllegalStateException("La cancelación ya se encuentra programada");
        }

        LocalDate cancellationDate = subscription.getNextBillingDate() != null
                ? subscription.getNextBillingDate()
                : LocalDate.now().plusMonths(1);
        subscription.setCancelAtPeriodEnd(true);
        subscription.setCancellationDate(cancellationDate);
        SubscriptionEntity saved = repository.save(subscription);
        notificationService.create(saved.getUser(), "SUSCRIPCION_CANCELACION_PROGRAMADA",
                "Cancelación programada",
                "Tu plan " + saved.getPlan().getName() + " continuará activo hasta el "
                        + cancellationDate + " y no volverá a renovarse.", saved.getId());

        return SubscriptionResponse.from(saved);
    }

    @Override
    public SubscriptionResponse reactivarSubscription(UUID userId, UUID subscriptionId) {
        SubscriptionEntity subscription = findOwnedSubscription(userId, subscriptionId);
        if (subscription.getStatus() != SubscriptionStatus.active
                || !Boolean.TRUE.equals(subscription.getCancelAtPeriodEnd())) {
            throw new IllegalStateException("La suscripción no tiene una cancelación programada");
        }
        subscription.setCancelAtPeriodEnd(false);
        subscription.setCancellationDate(null);
        SubscriptionEntity saved = repository.save(subscription);
        notificationService.create(saved.getUser(), "SUSCRIPCION_REACTIVADA", "Suscripción reactivada",
                "Tu plan " + saved.getPlan().getName() + " continuará renovándose normalmente.", saved.getId());
        return SubscriptionResponse.from(saved);
    }

    @Override
    @Scheduled(initialDelay = 10_000, fixedDelay = 3_600_000)
    public void processScheduledCancellations() {
        LocalDate today = LocalDate.now();
        List<SubscriptionEntity> due = repository
                .findByStatusAndCancelAtPeriodEndTrueAndCancellationDateLessThanEqual(
                        SubscriptionStatus.active, today);
        for (SubscriptionEntity subscription : due) {
            subscription.setStatus(SubscriptionStatus.cancelled);
            subscription.setCancelAtPeriodEnd(false);
            SubscriptionEntity saved = repository.save(subscription);
            notificationService.create(saved.getUser(), "SUSCRIPCION_CANCELADA", "Suscripción finalizada",
                    "Finalizó el periodo contratado de tu plan " + saved.getPlan().getName() + ".", saved.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SubscriptionEntity> findActiveSubscriptionEntity(UUID userId) {
        return repository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.active);
    }

    @Override
    public SubscriptionEntity ensureActiveEnterpriseSubscription(UUID userId) {
        Optional<SubscriptionEntity> existing = findActiveSubscriptionEntity(userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado con ID: " + userId));

        PlanEntity enterprisePlan;
        try {
            enterprisePlan = planService.findEntityById("plan-enterprise");
        } catch (Exception e) {
            enterprisePlan = planService.getAllPlans().stream()
                    .filter(p -> Boolean.TRUE.equals(p.active()))
                    .max((p1, p2) -> Integer.compare(p1.maxInstances(), p2.maxInstances()))
                    .map(resp -> planService.findEntityById(resp.id()))
                    .orElseGet(() -> {
                        PlanEntity fallback = new PlanEntity();
                        fallback.setId("plan-enterprise");
                        fallback.setName("Agro Enterprise");
                        fallback.setMaxInstances(5);
                        fallback.setStorageGb(250.0);
                        fallback.setMonthlyPrice(new BigDecimal("250.00"));
                        fallback.setActive(true);
                        return fallback;
                    });
        }

        SubscriptionEntity sub = new SubscriptionEntity();
        sub.setId(UUID.randomUUID());
        sub.setUser(user);
        sub.setPlan(enterprisePlan);
        sub.setStatus(SubscriptionStatus.active);
        sub.setStartDate(LocalDate.now());
        sub.setNextBillingDate(LocalDate.now().plusYears(1));
        sub.setAmount(enterprisePlan.getMonthlyPrice() != null ? enterprisePlan.getMonthlyPrice() : BigDecimal.ZERO);
        sub.setMaxInstances(enterprisePlan.getMaxInstances());
        sub.setStorageGb(enterprisePlan.getStorageGb());

        return repository.save(sub);
    }

    private PlanContratable validateAndQuotePlan(UUID userId, CreateSubscriptionRequest request) {
        PlanEntity plan = planService.findEntityById(request.planId());
        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new IllegalArgumentException("Este plan no está disponible para contratar");
        }

        PlanContratable quotedPlan = planCotizador.cotizar(plan, request.complementos());
        long instanceCount = instanceRepository.countByOwnerId(userId);
        if (instanceCount > quotedPlan.instanciasPermitidas()) {
            throw new IllegalArgumentException("Para cambiar a este plan debes eliminar "
                    + (instanceCount - quotedPlan.instanciasPermitidas()) + " instancia(s). Actualmente tienes "
                    + instanceCount + " y el plan '" + quotedPlan.descripcion() + "' solo permite "
                    + quotedPlan.instanciasPermitidas() + ".");
        }

        double usedStorageGb = instanceRepository.findByOwnerId(userId).stream()
                .mapToDouble(instance -> instance.getUsedStorageGb() != null ? instance.getUsedStorageGb() : 0.0)
                .sum();
        if (usedStorageGb > quotedPlan.almacenamientoGb()) {
            throw new IllegalArgumentException("Para cambiar a este plan debes liberar "
                    + String.format(java.util.Locale.US, "%.2f", usedStorageGb - quotedPlan.almacenamientoGb())
                    + " GB. Actualmente utilizas "
                    + String.format(java.util.Locale.US, "%.2f", usedStorageGb) + " GB y el nuevo plan permite "
                    + quotedPlan.almacenamientoGb() + " GB.");
        }
        return quotedPlan;
    }

    private SubscriptionEntity buildSubscription(
            User user,
            PlanEntity plan,
            PlanContratable quotedPlan,
            SubscriptionStatus status) {
        LocalDate today = LocalDate.now();
        SubscriptionEntity subscription = new SubscriptionEntity();
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setAmount(quotedPlan.precioMensual());
        subscription.setStatus(status);
        subscription.setStartDate(today);
        subscription.setNextBillingDate(today.plusMonths(1));
        subscription.setCancelAtPeriodEnd(false);
        subscription.setMaxInstances(quotedPlan.instanciasPermitidas());
        subscription.setStorageGb(quotedPlan.almacenamientoGb());
        return subscription;
    }

    private void cancelPendingSubscriptions(UUID userId) {
        for (SubscriptionEntity subscription : repository.findByUserIdOrderByCreatedAtDesc(userId)) {
            if (subscription.getStatus() == SubscriptionStatus.pending_payment) {
                subscription.setStatus(SubscriptionStatus.cancelled);
                subscription.setCancellationDate(LocalDate.now());
                repository.save(subscription);
            }
        }
    }

    private SubscriptionEntity findOwnedSubscription(UUID userId, UUID subscriptionId) {
        SubscriptionEntity subscription = repository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException(
                        "Suscripción no encontrada con ID: " + subscriptionId));
        if (!subscription.getUser().getId().equals(userId)) {
            throw new SubscriptionNotFoundException("Suscripción no encontrada con ID: " + subscriptionId);
        }
        return subscription;
    }

    private String describeAddonDifference(List<String> oldAddons, List<String> newAddons) {
        List<String> added = new ArrayList<>(newAddons != null ? newAddons : List.of());
        if (oldAddons != null) {
            added.removeAll(oldAddons);
        }
        if (added.isEmpty()) {
            return "Modificación de extras";
        }
        return added.stream().map(a -> switch (a) {
            case "EXTRA_INSTANCE", "INSTANCIA_EXTRA" -> "Instancia extra (+1)";
            case "EXTRA_STORAGE", "ALMACENAMIENTO_EXTRA" -> "50 GB extra";
            case "DAILY_BACKUP", "RESPALDO_DIARIO" -> "Respaldo diario";
            case "PRIORITY_SUPPORT", "SOPORTE_PRIORITARIO" -> "Soporte 24/7";
            default -> a;
        }).collect(java.util.stream.Collectors.joining(", "));
    }
}
