package com.agrocloud.backend.incident;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.entity.InstanceEntity;
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
class IncidentCommentServiceTest {
    @Mock IncidentRepository incidents;
    @Mock IncidentCommentRepository comments;
    @Mock UserRepository users;
    @Mock NotificationService notifications;
    IncidentCommentService service;

    @BeforeEach void setUp() {
        service = new IncidentCommentService(incidents, comments, users, notifications);
    }

    @Test void onlyOwnerAssignedSupportAndAdminCanReadComments() {
        IncidentEntity ticket = ticket();
        UUID agentId = UUID.randomUUID();
        User agent = new User();
        agent.setId(agentId);
        ticket.assignedSupport = agent;
        when(incidents.findById(ticket.id)).thenReturn(Optional.of(ticket));
        when(comments.findByIncidentIdOrderByCreatedAtAscIdAsc(ticket.id)).thenReturn(List.of());

        assertTrue(service.list(ticket.id, principal(ticket.owner.getId(), "CLIENTE")).isEmpty());
        assertTrue(service.list(ticket.id, principal(agentId, "SOPORTE")).isEmpty());
        assertTrue(service.list(ticket.id, principal(UUID.randomUUID(), "ADMINISTRADOR")).isEmpty());
        ResponseStatusException denied = assertThrows(ResponseStatusException.class,
                () -> service.list(ticket.id, principal(UUID.randomUUID(), "CLIENTE")));
        assertEquals(HttpStatus.FORBIDDEN, denied.getStatusCode());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class,
                () -> service.list(ticket.id, principal(UUID.randomUUID(), "SOPORTE"))).getStatusCode());
    }

    @Test void clientCommentIsPersistedAndNotifiesAssignedSupport() {
        IncidentEntity ticket = ticket();
        ticket.ticketNumber = 42L;
        User agent = new User();
        agent.setId(UUID.randomUUID());
        ticket.assignedSupport = agent;
        User author = mock(User.class);
        when(author.getId()).thenReturn(ticket.owner.getId());
        when(author.getContactName()).thenReturn("Cliente real");
        when(author.getRole()).thenReturn(Role.CLIENTE);
        when(incidents.findById(ticket.id)).thenReturn(Optional.of(ticket));
        when(users.findById(ticket.owner.getId())).thenReturn(Optional.of(author));
        when(users.findByRole_CodeAndStatus(Role.ADMINISTRADOR, AccountStatus.ACTIVO)).thenReturn(List.of());
        when(comments.saveAndFlush(any())).thenAnswer(call -> {
            IncidentComment comment = call.getArgument(0);
            comment.id = UUID.randomUUID();
            comment.createdAt = java.time.Instant.now();
            return comment;
        });

        IncidentCommentResponse result = service.add(ticket.id, "  Necesito ayuda  ",
                principal(ticket.owner.getId(), "CLIENTE"));

        assertEquals("Necesito ayuda", result.texto());
        assertEquals("Cliente real", result.autor());
        verify(notifications).create(eq(agent), eq("TICKET_COMENTARIO"),
                eq("Nuevo comentario en INC-00042"), eq(ticket.subject), eq(ticket.id));
        verify(notifications, never()).create(eq(ticket.owner), any(), any(), any(), any());
    }

    @Test void closedTicketRejectsNewComments() {
        IncidentEntity ticket = ticket();
        ticket.status = "CERRADA";
        when(incidents.findById(ticket.id)).thenReturn(Optional.of(ticket));
        assertThrows(IllegalStateException.class,
                () -> service.add(ticket.id, "Hola", principal(ticket.owner.getId(), "CLIENTE")));
        verifyNoInteractions(comments, notifications);
    }

    @Test void foreignClientCannotPost() {
        IncidentEntity ticket = ticket();
        when(incidents.findById(ticket.id)).thenReturn(Optional.of(ticket));
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException.class,
                () -> service.add(ticket.id, "Hola", principal(UUID.randomUUID(), "CLIENTE"))).getStatusCode());
        verifyNoInteractions(comments, notifications);
    }

    @Test void assignedSupportCommentNotifiesClientAndActiveAdmin() {
        IncidentEntity ticket = ticket();
        User agent = mock(User.class);
        UUID agentId = UUID.randomUUID();
        when(agent.getId()).thenReturn(agentId);
        when(agent.getContactName()).thenReturn("Agente real");
        when(agent.getRole()).thenReturn(Role.SOPORTE);
        ticket.assignedSupport = agent;
        User admin = new User();
        admin.setId(UUID.randomUUID());
        when(incidents.findById(ticket.id)).thenReturn(Optional.of(ticket));
        when(users.findById(agentId)).thenReturn(Optional.of(agent));
        when(users.findByRole_CodeAndStatus(Role.ADMINISTRADOR, AccountStatus.ACTIVO))
                .thenReturn(List.of(admin));
        when(comments.saveAndFlush(any())).thenAnswer(call -> {
            IncidentComment comment = call.getArgument(0);
            comment.id = UUID.randomUUID();
            comment.createdAt = java.time.Instant.now();
            return comment;
        });

        IncidentCommentResponse result = service.add(ticket.id, "Ya revisé la instancia",
                principal(agentId, "SOPORTE"));

        assertEquals(Role.SOPORTE, result.rolAutor());
        verify(notifications).create(eq(ticket.owner), eq("TICKET_COMENTARIO"), anyString(),
                eq(ticket.subject), eq(ticket.id));
        verify(notifications).create(eq(admin), eq("TICKET_COMENTARIO"), anyString(),
                eq(ticket.subject), eq(ticket.id));
        verify(notifications, never()).create(eq(agent), any(), any(), any(), any());
    }

    @Test void invalidBodyDoesNotCreateCommentOrNotification() {
        IncidentEntity ticket = ticket();
        when(incidents.findById(ticket.id)).thenReturn(Optional.of(ticket));
        assertThrows(IllegalArgumentException.class,
                () -> service.add(ticket.id, "   ", principal(ticket.owner.getId(), "CLIENTE")));
        assertThrows(IllegalArgumentException.class,
                () -> service.add(ticket.id, "x".repeat(2001), principal(ticket.owner.getId(), "CLIENTE")));
        verifyNoInteractions(comments, notifications);
    }

    private IncidentEntity ticket() {
        IncidentEntity ticket = new IncidentEntity();
        ticket.id = UUID.randomUUID();
        ticket.ticketNumber = 1L;
        ticket.subject = "No inicia";
        ticket.status = "ABIERTA";
        InstanceEntity instance = new InstanceEntity();
        instance.setId(UUID.randomUUID());
        ticket.instance = instance;
        User owner = new User();
        owner.setId(UUID.randomUUID());
        ticket.owner = owner;
        return ticket;
    }

    private UserPrincipal principal(UUID id, String role) {
        return new UserPrincipal(id, "user@example.com", "", AccountStatus.ACTIVO,
                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }
}
