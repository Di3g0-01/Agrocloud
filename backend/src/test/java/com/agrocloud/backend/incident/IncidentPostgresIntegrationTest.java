package com.agrocloud.backend.incident;

import static org.assertj.core.api.Assertions.assertThat;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.instance.repository.InstanceRepository;
import com.agrocloud.backend.notification.NotificationRepository;
import com.agrocloud.backend.repository.RoleRepository;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.template.repository.TemplateRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnabledIfEnvironmentVariable(named = "RUN_DB_INTEGRATION_TESTS", matches = "true")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "spring.lifecycle.timeout-per-shutdown-phase=1s")
class IncidentPostgresIntegrationTest {
    private static final String PASSWORD = "PruebaSegura2026!";
    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper json = new ObjectMapper();

    @Value("${local.server.port}") int port;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired PasswordEncoder passwords;
    @Autowired TemplateRepository templates;
    @Autowired InstanceRepository instances;
    @Autowired IncidentRepository incidents;
    @Autowired IncidentCommentRepository comments;
    @Autowired NotificationRepository notifications;

    @Test
    void completeTicketFlowAndRealtimeNotificationsAreScopedToEachRole() throws Exception {
        assertThat(System.getenv("DB_URL")).as("Solo se permite la base de pruebas")
                .endsWith("/agrocloud_test");
        String suffix = UUID.randomUUID().toString();
        List<User> fixtures = new ArrayList<>();
        List<UUID> createdInstances = new ArrayList<>();
        UUID ticketId = null;
        try {
            User client = createUser("client-" + suffix, Role.CLIENTE, fixtures);
            User outsider = createUser("outsider-" + suffix, Role.CLIENTE, fixtures);
            User admin = createUser("admin-" + suffix, Role.ADMINISTRADOR, fixtures);
            User support = createUser("support-" + suffix, Role.SOPORTE, fixtures);
            User otherSupport = createUser("other-support-" + suffix, Role.SOPORTE, fixtures);
            String clientToken = login(client);
            String outsiderToken = login(outsider);
            String adminToken = login(admin);
            String supportToken = login(support);
            String otherSupportToken = login(otherSupport);

            try (SseClient clientEvents = listen(clientToken); SseClient supportEvents = listen(supportToken)) {
                String template = templates.findAll().stream().filter(t -> "Activa".equals(t.getEstado()))
                        .findFirst().orElseThrow().getNombre();
                HttpResponse<String> firstInstance = request("POST", "/api/v1/instancias",
                        Map.of("nombre", "qa-primera-" + suffix.substring(0, 8), "plantilla", template), clientToken);
                assertStatus(firstInstance, 201);
                UUID firstId = UUID.fromString(parse(firstInstance).path("id").asText());
                createdInstances.add(firstId);
                clientEvents.awaitType("INSTANCIA_CREADA");

                assertStatus(request("POST", "/api/v1/instancias/" + firstId + "/restart", null,
                        clientToken), 200);
                clientEvents.awaitType("INSTANCIA_REINICIADA");
                assertStatus(request("PATCH", "/api/v1/instancias/" + firstId + "/status?status=revision",
                        null, supportToken), 200);
                clientEvents.awaitType("INSTANCIA_ESTADO");
                assertStatus(request("DELETE", "/api/v1/instancias/" + firstId, null, clientToken), 204);
                createdInstances.remove(firstId);
                clientEvents.awaitType("INSTANCIA_ELIMINADA");

                HttpResponse<String> secondInstance = request("POST", "/api/v1/instancias",
                        Map.of("nombre", "qa-ticket-" + suffix.substring(0, 8), "plantilla", template), clientToken);
                assertStatus(secondInstance, 201);
                UUID instanceId = UUID.fromString(parse(secondInstance).path("id").asText());
                createdInstances.add(instanceId);
                clientEvents.awaitType("INSTANCIA_CREADA");
                assertStatus(request("POST", "/api/v1/incidencias", Map.of(
                        "instanciaId", instanceId, "asunto", "Incidencia de integración",
                        "categoria", "Conectividad", "problema", "No conecta", "prioridad", "ALTA"),
                        outsiderToken), 403);

                HttpResponse<String> opened = request("POST", "/api/v1/incidencias", Map.of(
                        "instanciaId", instanceId, "asunto", "Incidencia de integración",
                        "categoria", "Conectividad", "problema", "No conecta", "prioridad", "ALTA"), clientToken);
                assertStatus(opened, 201);
                JsonNode openedBody = parse(opened);
                ticketId = UUID.fromString(openedBody.path("id").asText());
                assertThat(openedBody.path("codigo").asText()).matches("INC-[0-9]{5,}");
                assertThat(openedBody.path("estado").asText()).isEqualTo("ABIERTA");
                assertThat(containsTicket(request("GET", "/api/v1/incidencias", null, adminToken), ticketId)).isTrue();
                assertThat(containsTicket(request("GET", "/api/v1/incidencias", null, outsiderToken), ticketId)).isFalse();
                assertThat(containsTicket(request("GET", "/api/v1/incidencias", null, supportToken), ticketId)).isFalse();
                assertStatus(request("PATCH", "/api/v1/incidencias/" + ticketId + "/asignacion",
                        Map.of("agenteId", support.getId()), clientToken), 403);
                assertStatus(request("PATCH", "/api/v1/incidencias/" + ticketId + "/asignacion",
                        Map.of("agenteId", support.getId()), adminToken), 200);
                assertThat(supportEvents.awaitType("TICKET_ASIGNADO").path("recursoId").asText())
                        .isEqualTo(ticketId.toString());
                clientEvents.awaitType("TICKET_ASIGNADO");
                assertThat(containsTicket(request("GET", "/api/v1/incidencias", null, supportToken), ticketId)).isTrue();
                assertThat(containsTicket(request("GET", "/api/v1/incidencias", null, otherSupportToken), ticketId)).isFalse();
                assertStatus(request("GET", "/api/v1/incidencias/actividad", null, clientToken), 403);
                assertStatus(request("GET", "/api/v1/incidencias/actividad", null, supportToken), 200);

                String commentPath = "/api/v1/incidencias/" + ticketId + "/comentarios";
                assertStatus(request("GET", commentPath, null, outsiderToken), 403);
                assertStatus(request("POST", commentPath, Map.of("texto", "No funciona"), otherSupportToken), 403);
                assertStatus(request("POST", commentPath, Map.of("texto", "Ya reinicié"), clientToken), 201);
                supportEvents.awaitType("TICKET_COMENTARIO");
                assertStatus(request("POST", commentPath, Map.of("texto", "Lo estoy revisando"), supportToken), 201);
                clientEvents.awaitType("TICKET_COMENTARIO");
                assertThat(parse(request("GET", commentPath, null, adminToken)).size()).isEqualTo(2);

                String statusPath = "/api/v1/incidencias/" + ticketId + "/estado";
                assertStatus(request("PATCH", statusPath, Map.of("estado", "EN_REVISION"), otherSupportToken), 403);
                assertStatus(request("PATCH", statusPath, Map.of("estado", "EN_REVISION"), supportToken), 200);
                clientEvents.awaitType("TICKET_EN_REVISION");
                assertStatus(request("PATCH", statusPath, Map.of("estado", "RESUELTA"), supportToken), 400);
                HttpResponse<String> resolved = request("PATCH", statusPath, Map.of(
                        "estado", "RESUELTA", "mensajeResolucion", "Se restauró la conexión."), supportToken);
                assertStatus(resolved, 200);
                assertThat(parse(resolved).path("resueltoPorId").asText()).isEqualTo(support.getId().toString());
                assertThat(parse(resolved).path("fechaResolucion").asText()).isNotBlank();
                assertThat(clientEvents.awaitType("TICKET_RESUELTO").path("mensaje").asText())
                        .isEqualTo("Se restauró la conexión.");
                assertThat(containsTicket(request("GET", "/api/v1/incidencias/actividad", null, supportToken),
                        ticketId)).isTrue();

                assertStatus(request("PATCH", statusPath, Map.of("estado", "CERRADA"), clientToken), 200);
                supportEvents.awaitType("TICKET_CERRADO");
                assertStatus(request("PATCH", statusPath, Map.of("estado", "ABIERTA"), clientToken), 409);
                assertStatus(request("POST", commentPath, Map.of("texto", "Mensaje tardío"), clientToken), 409);
                assertThat(parse(request("GET", commentPath, null, clientToken)).size()).isEqualTo(2);
                assertThat(containsTicket(request("GET", "/api/v1/incidencias/actividad", null, supportToken),
                        ticketId)).isTrue();
                assertThat(containsType(request("GET", "/api/v1/notificaciones", null, adminToken),
                        "TICKET_CREADO")).isTrue();
                JsonNode supportNotifications = parse(request("GET", "/api/v1/notificaciones", null, supportToken));
                String notificationId = supportNotifications.get(0).path("id").asText();
                assertStatus(request("PATCH", "/api/v1/notificaciones/" + notificationId + "/leida",
                        null, clientToken), 404);
                assertStatus(request("PATCH", "/api/v1/notificaciones/" + notificationId + "/leida",
                        null, supportToken), 200);
            }
        } finally {
            if (ticketId != null) {
                comments.deleteAll(comments.findByIncidentIdOrderByCreatedAtAscIdAsc(ticketId));
                incidents.deleteById(ticketId);
            }
            for (UUID id : createdInstances) {
                if (instances.existsById(id)) instances.deleteById(id);
            }
            for (User user : fixtures) {
                notifications.deleteAll(notifications.findByRecipientIdOrderByCreatedAtDesc(user.getId()));
            }
            for (int i = fixtures.size() - 1; i >= 0; i--) users.deleteById(fixtures.get(i).getId());
        }
    }

    private User createUser(String prefix, Role role, List<User> fixtures) {
        User user = new User();
        user.setOrganizationName("Finca Integración");
        user.setContactName(prefix);
        user.setEmail(prefix + "@example.test");
        user.setPasswordHash(passwords.encode(PASSWORD));
        user.setRoleEntity(roles.getReferenceById(role));
        user.setStatus(AccountStatus.ACTIVO);
        User saved = users.saveAndFlush(user);
        fixtures.add(saved);
        return saved;
    }

    private String login(User user) throws Exception {
        HttpResponse<String> response = request("POST", "/api/v1/auth/login",
                Map.of("email", user.getEmail(), "password", PASSWORD), null);
        assertStatus(response, 200);
        return parse(response).path("token").asText();
    }

    private SseClient listen(String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/v1/notificaciones/stream"))
                .header("Authorization", "Bearer " + token)
                .header("Accept", "text/event-stream")
                .GET().build();
        HttpResponse<InputStream> response = http.send(request, HttpResponse.BodyHandlers.ofInputStream());
        assertThat(response.statusCode()).isEqualTo(200);
        return new SseClient(response.body());
    }

    private HttpResponse<String> request(String method, String path, Object body, String token) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri(path)).timeout(Duration.ofSeconds(10));
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (body != null) builder.header("Content-Type", "application/json");
        builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody() :
                HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body), StandardCharsets.UTF_8));
        return http.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }

    private JsonNode parse(HttpResponse<String> response) throws Exception {
        return json.readTree(response.body());
    }

    private void assertStatus(HttpResponse<String> response, int expected) {
        assertThat(response.statusCode()).as("HTTP %s: %s", response.statusCode(), response.body())
                .isEqualTo(expected);
    }

    private boolean containsTicket(HttpResponse<String> response, UUID id) throws Exception {
        assertStatus(response, 200);
        for (JsonNode ticket : parse(response)) if (id.toString().equals(ticket.path("id").asText())) return true;
        return false;
    }

    private boolean containsType(HttpResponse<String> response, String type) throws Exception {
        assertStatus(response, 200);
        for (JsonNode notification : parse(response))
            if (type.equals(notification.path("tipo").asText())) return true;
        return false;
    }

    private class SseClient implements AutoCloseable {
        private final InputStream input;
        private final BlockingQueue<JsonNode> events = new LinkedBlockingQueue<>();

        SseClient(InputStream input) {
            this.input = input;
            Thread reader = new Thread(this::readEvents, "e04-test-sse");
            reader.setDaemon(true);
            reader.start();
        }

        private void readEvents() {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
                String name = "";
                StringBuilder data = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.isEmpty()) {
                        if ("notification".equals(name) && !data.isEmpty()) events.offer(json.readTree(data.toString()));
                        name = "";
                        data.setLength(0);
                    } else if (line.startsWith("event:")) name = line.substring(6).trim();
                    else if (line.startsWith("data:")) data.append(line.substring(5).trim());
                }
            } catch (Exception ignored) {
                // El cierre del stream al terminar la prueba interrumpe la lectura.
            }
        }

        JsonNode awaitType(String type) throws Exception {
            long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
            while (System.nanoTime() < deadline) {
                JsonNode event = events.poll(Math.max(1, deadline - System.nanoTime()), TimeUnit.NANOSECONDS);
                if (event != null && type.equals(event.path("tipo").asText())) return event;
            }
            throw new AssertionError("No llegó el aviso inmediato " + type);
        }

        @Override public void close() throws Exception { input.close(); }
    }
}
