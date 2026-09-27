package com.agrocloud.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.Role;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.repository.RoleRepository;
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
class AuthPostgresIntegrationTest {

    private final HttpClient http = HttpClient.newHttpClient();
    private final ObjectMapper json = new ObjectMapper();

    @Value("${local.server.port}")
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registrationLoginAndProtectedSessionUsePostgres() throws Exception {
        assertThat(System.getenv("DB_URL")).as("Las pruebas solo pueden usar agrocloud_test")
                .endsWith("/agrocloud_test");
        String email = "qa-" + UUID.randomUUID() + "@example.test";
        String secondEmail = "qa-" + UUID.randomUUID() + "@example.test";
        String password = "ClaveSegura2026!";
        String registerBody = json.writeValueAsString(Map.of(
                "organizationName", "Finca Integracion",
                "contactName", "Persona de Prueba",
                "email", email.toUpperCase(),
                "password", password
        ));

        try {
        HttpResponse<String> registration = post("/api/v1/auth/register", registerBody);
        assertThat(registration.statusCode()).isEqualTo(201);
        JsonNode registered = json.readTree(registration.body());
        assertThat(registered.path("user").path("email").asText()).isEqualTo(email);
        assertThat(registered.path("user").path("role").asText()).isEqualTo("CLIENTE");
        String token = registered.path("token").asText();
        assertThat(token).isNotBlank();

        User stored = userRepository.findByEmail(email).orElseThrow();
        assertThat(stored.getRole()).isEqualTo(Role.CLIENTE);
        assertThat(stored.getStatus()).isEqualTo(AccountStatus.ACTIVO);
        assertThat(stored.getPasswordHash()).isNotEqualTo(password);
        assertThat(passwordEncoder.matches(password, stored.getPasswordHash())).isTrue();
        assertThat(roleRepository.count()).isEqualTo(3);

        String secondRegistrationBody = json.writeValueAsString(Map.of(
                "organizationName", "Finca Compartida",
                "email", secondEmail,
                "password", password
        ));
        assertThat(post("/api/v1/auth/register", secondRegistrationBody).statusCode()).isEqualTo(201);
        assertThat(userRepository.findByEmail(secondEmail).orElseThrow().getRole()).isEqualTo(Role.CLIENTE);
        assertThat(roleRepository.count()).isEqualTo(3);

        HttpResponse<String> currentUser = get("/api/v1/auth/me", token);
        assertThat(currentUser.statusCode()).isEqualTo(200);
        assertThat(json.readTree(currentUser.body()).path("email").asText()).isEqualTo(email);
        assertThat(get("/api/v1/auth/me", null).statusCode()).isEqualTo(401);

        HttpResponse<String> duplicate = post("/api/v1/auth/register", registerBody);
        assertThat(duplicate.statusCode()).isEqualTo(409);
        assertThat(json.readTree(duplicate.body()).path("message").asText())
                .contains("Ya existe una cuenta");

        String wrongPassword = json.writeValueAsString(Map.of("email", email, "password", "Incorrecta2026!"));
        HttpResponse<String> rejectedLogin = post("/api/v1/auth/login", wrongPassword);
        assertThat(rejectedLogin.statusCode()).isEqualTo(401);
        assertThat(json.readTree(rejectedLogin.body()).path("message").asText())
                .contains("incorrectos");

        String loginBody = json.writeValueAsString(Map.of("email", email.toUpperCase(), "password", password));
        HttpResponse<String> login = post("/api/v1/auth/login", loginBody);
        assertThat(login.statusCode()).isEqualTo(200);
        String loginToken = json.readTree(login.body()).path("token").asText();
        assertThat(loginToken).isNotBlank();
        assertThat(get("/api/v1/auth/me", loginToken).statusCode()).isEqualTo(200);
        } finally {
            userRepository.findByEmail(secondEmail).ifPresent(userRepository::delete);
            userRepository.findByEmail(email).ifPresent(userRepository::delete);
        }
    }

    private HttpResponse<String> post(String path, String body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).GET();
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }
}
