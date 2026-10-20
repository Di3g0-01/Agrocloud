package com.agrocloud.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

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
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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
    private final BlockingQueue<SimpleMailMessage> outbox = new LinkedBlockingQueue<>();
    @MockitoBean private JavaMailSender mailSender;

    @BeforeEach
    void captureMail() {
        outbox.clear();
        doAnswer(call -> { outbox.add(call.getArgument(0)); return null; })
                .when(mailSender).send(any(SimpleMailMessage.class));
    }

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
        assertThat(registered.has("token")).isFalse();
        assertThat(registered.path("message").asText()).contains("correo");

        User stored = userRepository.findByEmail(email).orElseThrow();
        assertThat(stored.getRole()).isEqualTo(Role.CLIENTE);
        assertThat(stored.getStatus()).isEqualTo(AccountStatus.PENDIENTE);
        assertThat(stored.isEmailVerified()).isFalse();
        assertThat(stored.getPasswordHash()).isNotEqualTo(password);
        assertThat(passwordEncoder.matches(password, stored.getPasswordHash())).isTrue();
        assertThat(roleRepository.count()).isEqualTo(3);

        String credentials = json.writeValueAsString(Map.of("email", email, "password", password));
        assertThat(post("/api/v1/auth/login", credentials).statusCode()).isEqualTo(403);
        String verification = awaitToken(email, "verify-email");
        assertThat(post("/api/v1/auth/reset-password", json.writeValueAsString(Map.of(
                "token", verification, "password", "NuevaClave2026!"))).statusCode()).isEqualTo(400);
        String verificationBody = json.writeValueAsString(Map.of("token", verification));
        HttpResponse<String> verified = post("/api/v1/auth/verify-email", verificationBody);
        assertThat(verified.statusCode()).isEqualTo(200);
        String token = json.readTree(verified.body()).path("token").asText();
        assertThat(token).isNotBlank();
        assertThat(get("/api/v1/auth/me", token).statusCode()).isEqualTo(200);
        assertThat(get("/api/v1/suscripciones/me", token).statusCode()).isEqualTo(200);
        assertThat(post("/api/v1/auth/verify-email", verificationBody).statusCode()).isEqualTo(400);
        assertThat(userRepository.findByEmail(email).orElseThrow().isEmailVerified()).isTrue();

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

        String recoveryBody = json.writeValueAsString(Map.of("email", email));
        HttpResponse<String> recovery = post("/api/v1/auth/forgot-password", recoveryBody);
        assertThat(recovery.statusCode()).isEqualTo(200);
        assertThat(post("/api/v1/auth/forgot-password", json.writeValueAsString(Map.of(
                "email", "missing-" + UUID.randomUUID() + "@example.test"))).body()).isEqualTo(recovery.body());
        String resetToken = awaitToken(email, "reset-password");
        assertThat(post("/api/v1/auth/verify-email", json.writeValueAsString(Map.of(
                "token", resetToken))).statusCode()).isEqualTo(400);
        String resetBody = json.writeValueAsString(Map.of("token", resetToken, "password", "NuevaClave2026!"));
        HttpRequest resetRequest = HttpRequest.newBuilder(uri("/api/v1/auth/reset-password"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(resetBody, StandardCharsets.UTF_8)).build();
        var firstReset = http.sendAsync(resetRequest, HttpResponse.BodyHandlers.ofString());
        var secondReset = http.sendAsync(resetRequest, HttpResponse.BodyHandlers.ofString());
        assertThat(java.util.List.of(firstReset.get().statusCode(), secondReset.get().statusCode()))
                .containsExactlyInAnyOrder(200, 400);
        assertThat(post("/api/v1/auth/reset-password", resetBody).statusCode()).isEqualTo(400);
        assertThat(get("/api/v1/auth/me", loginToken).statusCode()).isEqualTo(401);
        assertThat(post("/api/v1/auth/login", credentials).statusCode()).isEqualTo(401);
        assertThat(post("/api/v1/auth/login", json.writeValueAsString(Map.of(
                "email", email, "password", "NuevaClave2026!"))).statusCode()).isEqualTo(200);
        } finally {
            userRepository.findByEmail(secondEmail).ifPresent(userRepository::delete);
            userRepository.findByEmail(email).ifPresent(userRepository::delete);
        }
    }

    private String awaitToken(String email, String action) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
        while (System.nanoTime() < deadline) {
            SimpleMailMessage mail = outbox.poll(1, TimeUnit.SECONDS);
            if (mail != null && mail.getTo()[0].equals(email)) {
                var match = Pattern.compile("#" + action + "=([A-Za-z0-9_-]{43})").matcher(mail.getText());
                if (match.find()) return match.group(1);
            }
        }
        throw new AssertionError("No llegó el correo de prueba: " + action);
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
