package com.agrocloud.backend.incident;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.notification.NotificationService;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.security.UserPrincipal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {
    @Mock IncidentRepository incidents;
    @Mock InstanceRepository instances;
    @Mock UserRepository users;
    @Mock NotificationService notifications;
    IncidentService service;

    @BeforeEach void setUp() {
        service = new IncidentService(incidents, instances, users, notifications);
    }

    @Test void supportListsOnlyAssignedTickets() {
        UUID supportId = UUID.randomUUID();
        when(incidents.findByAssignedSupportIdOrderByCreatedAtDesc(supportId)).thenReturn(List.of());
        assertTrue(service.list(principal(supportId, "SOPORTE")).isEmpty());
        verify(incidents).findByAssignedSupportIdOrderByCreatedAtDesc(supportId);
        verify(incidents, never()).findAllByOrderByCreatedAtDesc();
    }

    @Test void clientCannotOpenTicketForAnotherCustomersInstance() {
        UUID instanceId = UUID.randomUUID();
        User owner = new User();
        owner.setId(UUID.randomUUID());
        InstanceEntity instance = new InstanceEntity();
        instance.setOwner(owner);
        when(instances.findById(instanceId)).thenReturn(Optional.of(instance));
        IncidentRequest request = new IncidentRequest(instanceId, "Error", "Conectividad", "No conecta", "ALTA");

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.create(principal(UUID.randomUUID(), "CLIENTE"), request));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verify(incidents, never()).saveAndFlush(any());
    }

    @Test void newTicketGetsAUniqueReadableCodeWithoutReplacingItsUuid() {
        UUID clientId = UUID.randomUUID();
        UUID instanceId = UUID.randomUUID();
        User owner = new User();
        owner.setId(clientId);
        InstanceEntity instance = new InstanceEntity();
        instance.setId(instanceId);
        instance.setOwner(owner);
        when(instances.findById(instanceId)).thenReturn(Optional.of(instance));
        when(incidents.nextTicketNumber()).thenReturn(12345L);
        when(users.findByRole_CodeAndStatus(Role.ADMINISTRADOR, AccountStatus.ACTIVO)).thenReturn(List.of());
        when(incidents.saveAndFlush(any(IncidentEntity.class))).thenAnswer(invocation -> {
            IncidentEntity saved = invocation.getArgument(0);
            saved.id = UUID.randomUUID();
            return saved;
        });

        IncidentResponse result = service.create(principal(clientId, "CLIENTE"),
                new IncidentRequest(instanceId, "Error", "Conectividad", "No conecta", "ALTA"));

        assertEquals("INC-12345", result.codigo());
        assertNotNull(result.id());
        verify(incidents).nextTicketNumber();
    }

    @Test void onlyAdminCanAssignAnActiveSupportAgent() {
        UUID ticketId = UUID.randomUUID();
        UUID agentId = UUID.randomUUID();
        IncidentEntity incident = incident("ABIERTA");
        User agent = mock(User.class);
        when(agent.getRole()).thenReturn(Role.SOPORTE);
        when(agent.getStatus()).thenReturn(AccountStatus.ACTIVO);
        when(agent.getId()).thenReturn(agentId);
        when(incidents.findById(ticketId)).thenReturn(Optional.of(incident));
        when(users.findById(agentId)).thenReturn(Optional.of(agent));
        when(incidents.saveAndFlush(incident)).thenReturn(incident);

        ResponseStatusException denied = assertThrows(ResponseStatusException.class,
                () -> service.assign(ticketId, agentId, principal(UUID.randomUUID(), "SOPORTE")));
        assertEquals(HttpStatus.FORBIDDEN, denied.getStatusCode());
        IncidentResponse result = service.assign(ticketId, agentId, principal(UUID.randomUUID(), "ADMINISTRADOR"));
        assertEquals(agentId, result.agenteId());
    }

    @Test void assignedSupportCanProgressTicketAndClientCanCloseItPermanently() {
        UUID ticketId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID agentId = UUID.randomUUID();
        IncidentEntity incident = incident("ABIERTA");
        incident.owner.setId(clientId);
        incident.id = ticketId;
        User agent = new User();
        agent.setId(agentId);
        incident.assignedSupport = agent;
        when(incidents.findById(ticketId)).thenReturn(Optional.of(incident));
        when(incidents.saveAndFlush(incident)).thenReturn(incident);

        ResponseStatusException denied = assertThrows(ResponseStatusException.class,
                () -> service.changeStatus(ticketId, "EN_REVISION", null, principal(UUID.randomUUID(), "SOPORTE")));
        assertEquals(HttpStatus.FORBIDDEN, denied.getStatusCode());
        assertEquals("EN_REVISION", service.changeStatus(ticketId, "EN_REVISION", null, principal(agentId, "SOPORTE")).estado());
        assertThrows(IllegalArgumentException.class,
                () -> service.changeStatus(ticketId, "RESUELTA", "  ", principal(agentId, "SOPORTE")));
        IncidentResponse resolved = service.changeStatus(ticketId, "RESUELTA",
                "  Se restauró la conexión y verificamos la instancia.  ", principal(agentId, "SOPORTE"));
        assertEquals("Se restauró la conexión y verificamos la instancia.", resolved.mensajeResolucion());
        assertEquals(agentId, resolved.resueltoPorId());
        assertNotNull(resolved.fechaResolucion());
        verify(notifications).create(eq(incident.owner), eq("TICKET_RESUELTO"),
                eq("Incidencia resuelta INC-00001"), eq(resolved.mensajeResolucion()), eq(ticketId));
        IncidentResponse closed = service.changeStatus(ticketId, "CERRADA", null, principal(clientId, "CLIENTE"));
        assertEquals("CERRADA", closed.estado());
        assertEquals(resolved.mensajeResolucion(), closed.mensajeResolucion());
        assertEquals(agentId, closed.resueltoPorId());
        assertEquals(resolved.fechaResolucion(), closed.fechaResolucion());
        assertThrows(IllegalStateException.class,
                () -> service.changeStatus(ticketId, "ABIERTA", null, principal(clientId, "CLIENTE")));
    }

    @Test void clientCannotListAnotherClientsTickets() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.listClient(UUID.randomUUID(), principal(UUID.randomUUID(), "CLIENTE")));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verifyNoInteractions(incidents);
    }

    @Test void supportActivityIncludesOwnClosedResolutionsAndCurrentPendingTickets() {
        UUID supportId = UUID.randomUUID();
        User agent = new User();
        agent.setId(supportId);
        IncidentEntity pending = incident("EN_REVISION");
        pending.assignedSupport = agent;
        IncidentEntity closed = incident("CERRADA");
        closed.resolvedBy = agent;
        IncidentEntity historical = incident("CERRADA");
        historical.assignedSupport = agent;
        historical.resolutionMessage = "Se restauró el servicio";
        when(incidents.findByAssignedSupportIdOrderByCreatedAtDesc(supportId))
                .thenReturn(List.of(pending, historical));
        when(incidents.findByResolvedByIdOrderByResolvedAtDesc(supportId)).thenReturn(List.of(closed));

        List<IncidentResponse> activity = service.activity(principal(supportId, "SOPORTE"));

        assertEquals(List.of(pending.id, historical.id, closed.id),
                activity.stream().map(IncidentResponse::id).toList());
        assertNull(activity.get(1).resueltoPorId());
        assertEquals(supportId, activity.get(2).resueltoPorId());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class,
                () -> service.activity(principal(UUID.randomUUID(), "CLIENTE"))).getStatusCode());
    }

    @Test void supportActivityDoesNotAttributeAdminsResolutionToAssignedAgent() {
        UUID supportId = UUID.randomUUID();
        User agent = new User();
        agent.setId(supportId);
        User admin = new User();
        admin.setId(UUID.randomUUID());
        IncidentEntity resolvedByAdmin = incident("RESUELTA");
        resolvedByAdmin.assignedSupport = agent;
        resolvedByAdmin.resolvedBy = admin;
        resolvedByAdmin.resolutionMessage = "Solucionado por administración";
        when(incidents.findByAssignedSupportIdOrderByCreatedAtDesc(supportId))
                .thenReturn(List.of(resolvedByAdmin));
        when(incidents.findByResolvedByIdOrderByResolvedAtDesc(supportId)).thenReturn(List.of());

        assertTrue(service.activity(principal(supportId, "SOPORTE")).isEmpty());
    }

    private IncidentEntity incident(String status) {
        IncidentEntity incident = new IncidentEntity();
        incident.id = UUID.randomUUID();
        incident.ticketNumber = 1L;
        incident.status = status;
        incident.owner = new User();
        InstanceEntity instance = new InstanceEntity();
        instance.setId(UUID.randomUUID());
        incident.instance = instance;
        return incident;
    }

    private UserPrincipal principal(UUID id, String role) {
        return new UserPrincipal(id, "user@example.com", "", AccountStatus.ACTIVO,
                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }
}
