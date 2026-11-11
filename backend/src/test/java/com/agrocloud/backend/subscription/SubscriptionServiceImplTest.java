package com.agrocloud.backend.subscription;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.notification.NotificationService;
import com.agrocloud.backend.payment.service.PaymentService;
import com.agrocloud.backend.plan.decorator.PlanCotizador;
import com.agrocloud.backend.plan.entity.PlanEntity;
import com.agrocloud.backend.plan.service.PlanService;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import com.agrocloud.backend.subscription.repository.SubscriptionRepository;
import com.agrocloud.backend.subscription.service.SubscriptionServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceImplTest {

    @Mock SubscriptionRepository subscriptions;
    @Mock UserRepository users;
    @Mock PlanService plans;
    @Mock PaymentService payments;
    @Mock InstanceRepository instances;
    @Mock NotificationService notifications;
    SubscriptionServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new SubscriptionServiceImpl(
                subscriptions, users, plans, payments, instances, new PlanCotizador(), notifications);
        when(subscriptions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void cancellationKeepsSubscriptionActiveUntilBillingDate() {
        UUID userId = UUID.randomUUID();
        SubscriptionEntity active = subscription(userId, SubscriptionStatus.active, "plan-pro");
        active.setNextBillingDate(LocalDate.now().plusDays(12));
        when(subscriptions.findById(active.getId())).thenReturn(java.util.Optional.of(active));

        var response = service.cancelarSubscription(userId, active.getId());

        assertEquals(SubscriptionStatus.active, response.status());
        assertTrue(response.cancelAtPeriodEnd());
        assertEquals(active.getNextBillingDate(), response.cancellationDate());
    }

    @Test
    void confirmedPaymentActivatesNewPlanAndClosesPreviousOne() {
        UUID userId = UUID.randomUUID();
        SubscriptionEntity current = subscription(userId, SubscriptionStatus.active, "plan-basic");
        current.setCancelAtPeriodEnd(true);
        current.setCancellationDate(LocalDate.now().plusDays(5));
        SubscriptionEntity pending = subscription(userId, SubscriptionStatus.pending_payment, "plan-pro");
        when(subscriptions.findById(pending.getId())).thenReturn(java.util.Optional.of(pending));
        when(subscriptions.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(pending, current));

        var response = service.confirmPlanChange(userId, pending.getId());

        verify(payments).registerAutomaticPayment(pending.getId(), "Cambio de plan - Plan plan-pro");
        assertEquals(SubscriptionStatus.active, response.status());
        assertEquals(LocalDate.now().plusMonths(1), response.nextBillingDate());
        assertEquals(SubscriptionStatus.cancelled, current.getStatus());
        assertFalse(current.getCancelAtPeriodEnd());
        assertEquals(LocalDate.now(), current.getCancellationDate());
    }

    @Test
    void confirmPlanChangeWithDifferentialAmountRegistersExactAmountAndConcept() {
        UUID userId = UUID.randomUUID();
        SubscriptionEntity current = subscription(userId, SubscriptionStatus.active, "plan-finca");
        current.setAmount(new BigDecimal("25.00"));
        current.setMaxInstances(1);

        SubscriptionEntity pending = subscription(userId, SubscriptionStatus.pending_payment, "plan-finca");
        pending.setAmount(new BigDecimal("85.00"));
        pending.setMaxInstances(2);
        pending.setPendingPaymentAmount(new BigDecimal("60.00"));
        pending.setPaymentConcept("Ajuste de complementos - Instancia extra (+1)");

        when(subscriptions.findById(pending.getId())).thenReturn(java.util.Optional.of(pending));
        when(subscriptions.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(pending, current));

        var response = service.confirmPlanChange(userId, pending.getId());

        verify(payments).registerAutomaticPayment(pending.getId(), new BigDecimal("60.00"), "Ajuste de complementos - Instancia extra (+1)");
        assertEquals(SubscriptionStatus.active, response.status());
        assertEquals(2, response.maxInstances());
        assertEquals(new BigDecimal("85.00"), response.amount());
    }

    @Test
    void scheduledCancellationClosesSubscriptionWhenPaidPeriodEnds() {
        SubscriptionEntity due = subscription(UUID.randomUUID(), SubscriptionStatus.active, "plan-basic");
        due.setCancelAtPeriodEnd(true);
        due.setCancellationDate(LocalDate.now());
        when(subscriptions.findByStatusAndCancelAtPeriodEndTrueAndCancellationDateLessThanEqual(
                SubscriptionStatus.active, LocalDate.now())).thenReturn(List.of(due));

        service.processScheduledCancellations();

        assertEquals(SubscriptionStatus.cancelled, due.getStatus());
        assertFalse(due.getCancelAtPeriodEnd());
    }

    @Test
    void continuingSubscriptionRemovesScheduledCancellation() {
        UUID userId = UUID.randomUUID();
        SubscriptionEntity active = subscription(userId, SubscriptionStatus.active, "plan-pro");
        active.setCancelAtPeriodEnd(true);
        active.setCancellationDate(LocalDate.now().plusDays(8));
        when(subscriptions.findById(active.getId())).thenReturn(java.util.Optional.of(active));

        var response = service.reactivarSubscription(userId, active.getId());

        assertFalse(response.cancelAtPeriodEnd());
        assertNull(response.cancellationDate());
    }

    private SubscriptionEntity subscription(UUID userId, SubscriptionStatus status, String planId) {
        User user = new User();
        user.setId(userId);
        PlanEntity plan = new PlanEntity();
        plan.setId(planId);
        plan.setName("Plan " + planId);
        plan.setMonthlyPrice(new BigDecimal("100.00"));
        plan.setStorageGb(100.0);
        plan.setMaxInstances(3);
        plan.setActive(true);

        SubscriptionEntity subscription = new SubscriptionEntity();
        subscription.setId(UUID.randomUUID());
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setStatus(status);
        subscription.setStartDate(LocalDate.now());
        subscription.setNextBillingDate(LocalDate.now().plusMonths(1));
        subscription.setAmount(plan.getMonthlyPrice());
        subscription.setCancelAtPeriodEnd(false);
        return subscription;
    }
}
