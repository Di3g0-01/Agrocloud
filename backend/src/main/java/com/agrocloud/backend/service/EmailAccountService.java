package com.agrocloud.backend.service;

import com.agrocloud.backend.dto.MessageResponse;
import com.agrocloud.backend.dto.AuthResponse;
import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.service.AccountMailService.AccountMail;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmailAccountService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String GENERIC = "Si el correo corresponde a una cuenta habilitada para esta acción, recibirás un enlace. Revisa también la carpeta de spam.";
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final ApplicationEventPublisher events;
    private final AuthResponseFactory responses;

    public EmailAccountService(UserRepository users, PasswordEncoder passwords, ApplicationEventPublisher events,
            AuthResponseFactory responses) {
        this.users = users;
        this.passwords = passwords;
        this.events = events;
        this.responses = responses;
    }

    public void sendVerification(User user) {
        Instant now = Instant.now();
        if (user.getVerificationSentAt() != null && user.getVerificationSentAt().plusSeconds(60).isAfter(now)) return;
        String token = newToken();
        user.setVerificationTokenHash(hash(token));
        user.setVerificationExpiresAt(now.plus(Duration.ofHours(24)));
        user.setVerificationSentAt(now);
        events.publishEvent(new AccountMail(user.getEmail(), "verify-email", token));
    }

    @Transactional
    public MessageResponse resend(String email) {
        users.findByEmailForUpdate(EmailAddress.normalize(email))
                .filter(u -> !u.isEmailVerified() && u.getStatus() == AccountStatus.PENDIENTE)
                .ifPresent(this::sendVerification);
        return new MessageResponse(GENERIC);
    }

    @Transactional
    public AuthResponse verify(String token) {
        User user = users.findByVerificationTokenHash(hash(token)).orElseThrow(EmailAccountService::invalidLink);
        if (user.getVerificationExpiresAt() == null || !user.getVerificationExpiresAt().isAfter(Instant.now())
                || user.isEmailVerified() || user.getStatus() != AccountStatus.PENDIENTE) throw invalidLink();
        user.setEmailVerified(true);
        user.setStatus(AccountStatus.ACTIVO);
        user.setVerificationTokenHash(null);
        user.setVerificationExpiresAt(null);
        return responses.create(user);
    }

    @Transactional
    public MessageResponse forgotPassword(String email) {
        users.findByEmailForUpdate(EmailAddress.normalize(email))
                .filter(u -> u.isEmailVerified() && u.getStatus() == AccountStatus.ACTIVO)
                .ifPresent(user -> {
                    Instant now = Instant.now();
                    if (user.getResetSentAt() != null && user.getResetSentAt().plusSeconds(60).isAfter(now)) return;
                    String token = newToken();
                    user.setResetTokenHash(hash(token));
                    user.setResetExpiresAt(now.plus(Duration.ofMinutes(30)));
                    user.setResetSentAt(now);
                    events.publishEvent(new AccountMail(user.getEmail(), "reset-password", token));
                });
        return new MessageResponse(GENERIC);
    }

    @Transactional
    public MessageResponse resetPassword(String token, String password) {
        validatePassword(password);
        User user = users.findByResetTokenHash(hash(token)).orElseThrow(EmailAccountService::invalidLink);
        if (user.getResetExpiresAt() == null || !user.getResetExpiresAt().isAfter(Instant.now())
                || !user.isEmailVerified() || user.getStatus() != AccountStatus.ACTIVO) throw invalidLink();
        user.setPasswordHash(passwords.encode(password));
        user.setAuthVersion(user.getAuthVersion() + 1);
        user.setResetTokenHash(null);
        user.setResetExpiresAt(null);
        return new MessageResponse("Contraseña actualizada. Inicia sesión con tu nueva contraseña.");
    }

    static void validatePassword(String password) {
        if (password == null || password.isBlank() || password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres y como máximo 72 bytes.");
        }
    }

    private static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String token) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) throw invalidLink();
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private static IllegalArgumentException invalidLink() {
        return new IllegalArgumentException("El enlace no es válido o ya caducó. Solicita uno nuevo.");
    }
}
