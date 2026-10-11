package com.agrocloud.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.repository.RoleRepository;
import com.agrocloud.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnabledIfEnvironmentVariable(named = "RUN_DB_INTEGRATION_TESTS", matches = "true")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AdminSecurityPostgresIntegrationTest {
    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper json = new ObjectMapper();

    @Value("${local.server.port}") int port;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired PasswordEncoder passwords;

    @Test
    void rolePermissionsAndAdminUserLifecycle() throws Exception {
        assertTestDatabase();
        String suffix = UUID.randomUUID().toString();
        String clientEmail = "client-" + suffix + "@example.test";
        String adminEmail = "admin-" + suffix + "@example.test";
        String supportEmail = "support-" + suffix + "@example.test";
        String clientPassword = "ClienteSegura2026!";
        String adminPassword = "AdminSegura2026!";
        String supportPassword = "SoporteSegura2026!";
        User admin = new User();
        admin.setOrganizationName("AgroCloud");
        admin.setContactName("Administrador de Prueba");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwords.encode(adminPassword));
        admin.setRoleEntity(roles.getReferenceById(Role.ADMINISTRADOR));
        admin.setStatus(AccountStatus.ACTIVO);
        users.saveAndFlush(admin);
        try {
            assertThat(get("/api/v1/usuarios", null).statusCode()).isEqualTo(401);
            assertThat(get("/api/v1/usuarios", "token-invalido").statusCode()).isEqualTo(401);
            assertThat(get("/api/v1/auth/me", null).statusCode()).isEqualTo(401);
            assertThat(get("/api/v1/planes", null).statusCode()).isEqualTo(200);
            assertThat(post("/api/v1/planes", "{}", null).statusCode()).isEqualTo(401);
            assertThat(get("/api/v1/instancias", null).statusCode()).isEqualTo(401);
            assertThat(get("/api/v1/suscripciones", null).statusCode()).isEqualTo(401);

            HttpResponse<String> registration = post("/api/v1/auth/register", body(Map.of(
                    "organizationName", "Finca Prueba", "email", clientEmail,
                    "password", clientPassword, "role", "ADMINISTRADOR"
            )), null);
            assertThat(registration.statusCode()).isEqualTo(201);
            assertThat(json.readTree(registration.body()).path("user").path("role").asText()).isEqualTo("CLIENTE");
            String clientToken = json.readTree(registration.body()).path("token").asText();
            assertThat(get("/api/v1/usuarios", clientToken).statusCode()).isEqualTo(403);
            assertThat(post("/api/v1/usuarios", "{}", clientToken).statusCode()).isEqualTo(403);

            String adminToken = login(adminEmail, adminPassword);
            HttpResponse<String> created = post("/api/v1/usuarios", body(Map.of(
                    "organizationName", "AgroCloud", "contactName", "Soporte de Prueba",
                    "email", supportEmail, "password", supportPassword, "role", "SOPORTE"
            )), adminToken);
            assertThat(created.statusCode()).isEqualTo(201);
            JsonNode support = json.readTree(created.body());
            String supportId = support.path("id").asText();
            assertThat(support.path("role").asText()).isEqualTo("SOPORTE");
            assertThat(support.has("passwordHash")).isFalse();
            assertThat(get("/api/v1/usuarios/" + supportId, adminToken).statusCode()).isEqualTo(200);
            assertThat(json.readTree(get("/api/v1/usuarios", adminToken).body()).isArray()).isTrue();
            assertThat(get("/api/v1/usuarios/" + UUID.randomUUID(), adminToken).statusCode()).isEqualTo(404);
            HttpResponse<String> invalidId = get("/api/v1/usuarios/no-es-uuid", adminToken);
            assertThat(invalidId.statusCode()).isEqualTo(400);
            assertThat(json.readTree(invalidId.body()).path("message").asText()).contains("URL");
            HttpResponse<String> invalidRole = post("/api/v1/usuarios", body(Map.of(
                    "organizationName", "AgroCloud", "email", "wrong-" + suffix + "@example.test",
                    "password", supportPassword, "role", "SUPERVISOR"
            )), adminToken);
            assertThat(invalidRole.statusCode()).isEqualTo(400);
            assertThat(json.readTree(invalidRole.body()).path("message").asText()).contains("JSON");
            assertThat(post("/api/v1/usuarios", body(Map.of(
                    "organizationName", "AgroCloud", "email", supportEmail.toUpperCase(),
                    "password", supportPassword, "role", "SOPORTE"
            )), adminToken).statusCode()).isEqualTo(409);
            assertThat(put("/api/v1/usuarios/" + supportId, body(Map.of(
                    "organizationName", "AgroCloud", "email", adminEmail,
                    "role", "SOPORTE", "status", "ACTIVO"
            )), adminToken).statusCode()).isEqualTo(409);
            assertThat(users.findById(UUID.fromString(supportId)).orElseThrow().getEmail()).isEqualTo(supportEmail);

            String supportToken = login(supportEmail, supportPassword);
            assertThat(get("/api/v1/usuarios", supportToken).statusCode()).isEqualTo(403);
            HttpResponse<String> suspended = put("/api/v1/usuarios/" + supportId, body(Map.of(
                    "organizationName", "AgroCloud", "contactName", "Soporte de Prueba",
                    "email", supportEmail, "role", "SOPORTE", "status", "SUSPENDIDO"
            )), adminToken);
            assertThat(suspended.statusCode()).isEqualTo(200);
            assertThat(post("/api/v1/auth/login", body(Map.of("email", supportEmail, "password", supportPassword)), null)
                    .statusCode()).isEqualTo(403);
            assertThat(get("/api/v1/auth/me", supportToken).statusCode()).isEqualTo(401);

            HttpResponse<String> selfDemotion = put("/api/v1/usuarios/" + admin.getId(), body(Map.of(
                    "organizationName", "AgroCloud", "email", adminEmail,
                    "role", "CLIENTE", "status", "ACTIVO"
            )), adminToken);
            assertThat(selfDemotion.statusCode()).isEqualTo(400);
            assertThat(users.findById(admin.getId()).orElseThrow().getRole()).isEqualTo(Role.ADMINISTRADOR);
        } finally {
            users.findByEmail(supportEmail).ifPresent(users::delete);
            users.findByEmail(clientEmail).ifPresent(users::delete);
            users.delete(admin);
        }
    }

    @Test
    void invalidRequestsReturnValidationErrorsWithoutSavingAccounts() throws Exception {
        assertTestDatabase();
        String email = "invalid-" + UUID.randomUUID() + "@example.test";
        try {
            HttpResponse<String> invalid = post("/api/v1/auth/register", body(Map.of(
                    "organizationName", " ", "email", email,
                    "password", "short", "phone", "abc!"
            )), null);
            assertThat(invalid.statusCode()).isEqualTo(400);
            JsonNode errors = json.readTree(invalid.body()).path("fieldErrors");
            assertThat(errors.has("organizationName")).isTrue();
            assertThat(errors.has("password")).isTrue();
            assertThat(errors.has("phone")).isTrue();
            assertThat(users.findByEmail(email)).isEmpty();
            HttpResponse<String> malformed = post("/api/v1/auth/register", "{\"organizationName\":", null);
            assertThat(malformed.statusCode()).isEqualTo(400);
            assertThat(json.readTree(malformed.body()).path("message").asText()).contains("JSON");
        } finally {
            users.findByEmail(email).ifPresent(users::delete);
        }
    }

    @Test
    void corsAllowsLocalFrontendAndRejectsUnknownOrigins() throws Exception {
        assertTestDatabase();
        HttpResponse<String> allowed = preflight("http://localhost:5173");
        assertThat(allowed.statusCode()).isEqualTo(200);
        assertThat(allowed.headers().firstValue("Access-Control-Allow-Origin"))
                .hasValue("http://localhost:5173");
        assertThat(preflight("https://otro-sitio.example").statusCode()).isEqualTo(403);
    }

    private void assertTestDatabase() {
        assertThat(System.getenv("DB_URL")).as("Las pruebas solo pueden usar agrocloud_test")
                .endsWith("/agrocloud_test");
    }

    private String login(String email, String password) throws Exception {
        HttpResponse<String> response = post("/api/v1/auth/login", body(Map.of("email", email, "password", password)), null);
        assertThat(response.statusCode()).isEqualTo(200);
        return json.readTree(response.body()).path("token").asText();
    }

    private String body(Object value) throws Exception {
        return json.writeValueAsString(value);
    }

    private HttpResponse<String> preflight(String origin) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/usuarios"))
                .header("Origin", origin)
                .header("Access-Control-Request-Method", "GET")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .build();
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        return request("GET", path, null, token);
    }

    private HttpResponse<String> post(String path, String body, String token) throws Exception {
        return request("POST", path, body, token);
    }

    private HttpResponse<String> put(String path, String body, String token) throws Exception {
        return request("PUT", path, body, token);
    }

    private HttpResponse<String> request(String method, String path, String body, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body != null) request.header("Content-Type", "application/json");
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
}
