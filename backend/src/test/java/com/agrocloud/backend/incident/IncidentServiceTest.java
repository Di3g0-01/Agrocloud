package com.agrocloud.backend.incident;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.entity.InstanceEntity;
import com.agrocloud.backend.instance.repository.InstanceRepository;
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
    IncidentService service;

    @BeforeEach void setUp() {
        service = new IncidentService(incidents, instances, users);
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
        IncidentResponse closed = service.changeStatus(ticketId, "CERRADA", null, principal(clientId, "CLIENTE"));
        assertEquals("CERRADA", closed.estado());
        assertEquals(resolved.mensajeResolucion(), closed.mensajeResolucion());
        assertThrows(IllegalStateException.class,
                () -> service.changeStatus(ticketId, "ABIERTA", null, principal(clientId, "CLIENTE")));
    }

    @Test void clientCannotListAnotherClientsTickets() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.listClient(UUID.randomUUID(), principal(UUID.randomUUID(), "CLIENTE")));
        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verifyNoInteractions(incidents);
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
