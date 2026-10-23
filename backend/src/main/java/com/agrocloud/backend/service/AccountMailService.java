package com.agrocloud.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.AddressException;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class AccountMailService {
    private static final Logger log = LoggerFactory.getLogger(AccountMailService.class);
    private final JavaMailSender sender;
    private final String from;
    private final String frontendUrl;
    private final RestClient apiClient;
    private final InternetAddress senderAddress;

    @Autowired
    public AccountMailService(JavaMailSender sender,
            @Value("${app.mail.from}") String from,
            @Value("${app.frontend-url}") String frontendUrl,
            @Value("${app.mail.provider}") String provider,
            @Value("${app.mail.brevo-api-key}") String brevoApiKey) {
        this(sender, from, frontendUrl, provider, brevoApiKey, httpBuilder());
    }

    AccountMailService(JavaMailSender sender, String from, String frontendUrl,
            String provider, String brevoApiKey, RestClient.Builder apiBuilder) {
        URI uri = URI.create(frontendUrl);
        if (uri.getHost() == null || uri.getRawQuery() != null || uri.getRawFragment() != null
                || uri.getUserInfo() != null || !("https".equals(uri.getScheme())
                || ("http".equals(uri.getScheme()) && "localhost".equals(uri.getHost())))) {
            throw new IllegalArgumentException("APP_FRONTEND_URL debe ser una URL HTTPS sin parámetros");
        }
        this.sender = sender;
        this.from = from;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        try {
            this.senderAddress = new InternetAddress(from);
            senderAddress.validate();
        } catch (AddressException invalid) {
            throw new IllegalArgumentException("MAIL_FROM debe ser un correo válido");
        }
        if (!List.of("smtp", "brevo").contains(provider)) {
            throw new IllegalArgumentException("MAIL_PROVIDER debe ser smtp o brevo");
        }
        if (provider.equals("brevo")) {
            if (brevoApiKey.isBlank()) throw new IllegalArgumentException("Falta BREVO_API_KEY");
            this.apiClient = apiBuilder.baseUrl("https://api.brevo.com/v3")
                    .defaultHeader("api-key", brevoApiKey).build();
        } else {
            this.apiClient = null;
        }
    }

    private static RestClient.Builder httpBuilder() {
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(5));
        return RestClient.builder().requestFactory(factory);
    }

    // Deliver only after the database commits. No token is logged, even if SMTP fails.
    // Async delivery also keeps recovery responses independent of SMTP/account existence.
    @Async
    @TransactionalEventListener
    public void deliver(AccountMail event) {
        boolean verify = event.action().equals("verify-email");
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(from);
        mail.setTo(event.email());
        mail.setSubject(verify ? "Confirma tu correo en AgroCloud" : "Recupera tu contraseña de AgroCloud");
        mail.setText((verify ? "Confirma tu correo para activar tu cuenta:\n\n"
                : "Para elegir una nueva contraseña, abre este enlace:\n\n")
                + frontendUrl + "/#" + event.action() + "=" + event.token()
                + "\n\nEl enlace caduca en " + (verify ? "24 horas" : "30 minutos")
                + " y solo puede usarse una vez.\n"
                + "Si no solicitaste esta acción, puedes ignorar este mensaje.");
        try {
            if (apiClient == null) {
                sender.send(mail);
            } else {
                apiClient.post().uri("/smtp/email").contentType(org.springframework.http.MediaType.APPLICATION_JSON).body(Map.of(
                        "sender", Map.of("email", senderAddress.getAddress(),
                                "name", senderAddress.getPersonal() == null ? "AgroCloud" : senderAddress.getPersonal()),
                        "to", List.of(Map.of("email", event.email())),
                        "subject", mail.getSubject(), "textContent", mail.getText()))
                        .retrieve().toBodilessEntity();
            }
        } catch (org.springframework.mail.MailException | RestClientException failure) {
            log.error("No se pudo enviar un correo de cuenta. Revisa la configuración del proveedor y solicita otro enlace.");
        }
    }

    public record AccountMail(String email, String action, String token) {}

    @Configuration
    @EnableAsync
    static class AsyncMailConfiguration {}
}
