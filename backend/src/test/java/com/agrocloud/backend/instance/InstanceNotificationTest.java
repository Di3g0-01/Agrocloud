package com.agrocloud.backend.instance;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.dto.CreateInstanceRequest;
import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.entity.InstanceStatus;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.instance.service.InstanceServiceImpl;
import com.agrocloud.backend.notification.NotificationService;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.subscription.service.SubscriptionService;
import com.agrocloud.backend.template.entity.TemplateEntity;
import com.agrocloud.backend.template.repository.TemplateRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InstanceNotificationTest {
    @Mock InstanceRepository instances;
    @Mock UserRepository users;
    @Mock SubscriptionService subscriptions;
    @Mock TemplateRepository templates;
    @Mock NotificationService notifications;
    InstanceServiceImpl service;

    @BeforeEach void setUp() {
        service = new InstanceServiceImpl(instances, users, subscriptions, templates, notifications);
    }

    @Test void creationNotifiesOwner() {
        User owner = owner();
        UUID instanceId = UUID.randomUUID();
        TemplateEntity template = new TemplateEntity();
        template.setNombre("Cultivos y parcelas");
        template.setEstado("Activa");
        when(users.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(subscriptions.findActiveSubscriptionEntity(owner.getId())).thenReturn(Optional.empty());
        when(templates.findByNombreIgnoreCase("Cultivos y parcelas")).thenReturn(Optional.of(template));
        when(instances.save(any())).thenAnswer(call -> {
            InstanceEntity entity = call.getArgument(0);
            entity.setId(instanceId);
            return entity;
        });

        service.createInstance(owner.getId(), new CreateInstanceRequest("cultivos", "Cultivos y parcelas"));

        verify(notifications).create(eq(owner), eq("INSTANCIA_CREADA"), any(),
                eq("La instancia cultivos está activa."), eq(instanceId));
    }

    @Test void statusChangeNotifiesOwnerEvenWhenChangedByStaff() {
        InstanceEntity instance = instance();
        when(instances.findById(instance.getId())).thenReturn(Optional.of(instance));
        when(instances.save(instance)).thenReturn(instance);

        service.updateInstanceStatus(instance.getId(), InstanceStatus.suspended);

        assertEquals(InstanceStatus.suspended, instance.getStatus());
        verify(notifications).create(eq(instance.getOwner()), eq("INSTANCIA_ESTADO"), any(),
                eq("La instancia cultivos ahora está suspendida."), eq(instance.getId()));
    }

    @Test void unchangedStatusDoesNotSendDuplicateNotification() {
        InstanceEntity instance = instance();
        when(instances.findById(instance.getId())).thenReturn(Optional.of(instance));

        service.updateInstanceStatus(instance.getId(), InstanceStatus.active);

        verify(instances, never()).save(any());
        verify(notifications, never()).create(any(), any(), any(), any(), any());
    }

    @Test void restartNotifiesOwner() {
        InstanceEntity instance = instance();
        when(instances.findByIdAndOwnerId(instance.getId(), instance.getOwner().getId()))
                .thenReturn(Optional.of(instance));
        when(instances.save(instance)).thenReturn(instance);

        service.restartInstance(instance.getId(), instance.getOwner().getId(), false);

        verify(notifications).create(eq(instance.getOwner()), eq("INSTANCIA_REINICIADA"), any(),
                eq("La instancia cultivos se reinició y está activa."), eq(instance.getId()));
    }

    @Test void deletionNotifiesOwnerWithoutLinkingDeletedInstance() {
        InstanceEntity instance = instance();
        when(instances.findByIdAndOwnerId(instance.getId(), instance.getOwner().getId()))
                .thenReturn(Optional.of(instance));

        service.deleteInstance(instance.getId(), instance.getOwner().getId(), false);

        verify(instances).delete(instance);
        verify(notifications).create(eq(instance.getOwner()), eq("INSTANCIA_ELIMINADA"), any(),
                eq("La instancia cultivos fue eliminada."), eq(null));
    }

    private User owner() {
        User owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setOrganizationName("Finca ejemplo");
        return owner;
    }

    private InstanceEntity instance() {
        InstanceEntity instance = new InstanceEntity();
        instance.setId(UUID.randomUUID());
        instance.setName("cultivos");
        instance.setOwner(owner());
        instance.setStatus(InstanceStatus.active);
        return instance;
    }
}
