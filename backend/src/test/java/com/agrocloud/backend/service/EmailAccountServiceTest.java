package com.agrocloud.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.repository.UserRepository;
import com.agrocloud.backend.service.AccountMailService.AccountMail;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class EmailAccountServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(4);
    private final AuthResponseFactory responses = mock(AuthResponseFactory.class);
    private final EmailAccountService service = new EmailAccountService(users, passwords, events, responses);
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("cliente@example.com");
        user.setEmailVerified(false);
        user.setStatus(AccountStatus.PENDIENTE);
    }

    @Test
    void verificationStoresOnlyDigestAndCanBeUsedOnce() {
        service.sendVerification(user);
        AccountMail mail = lastMail();
        assertThat(mail.token()).hasSize(43);
        assertThat(user.getVerificationTokenHash()).hasSize(64).isNotEqualTo(mail.token());
        assertThat(user.getVerificationExpiresAt()).isAfter(Instant.now().plusSeconds(86300));
        when(users.findByVerificationTokenHash(EmailAccountService.hash(mail.token()))).thenReturn(Optional.of(user));
        service.verify(mail.token());
        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVO);
        assertThat(user.getVerificationTokenHash()).isNull();
        verify(responses).create(user);
        assertThatThrownBy(() -> service.verify(mail.token())).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void expiredOrSuspendedVerificationCannotActivateAccount() {
        service.sendVerification(user);
        AccountMail mail = lastMail();
        when(users.findByVerificationTokenHash(any())).thenReturn(Optional.of(user));
        user.setVerificationExpiresAt(Instant.now().minusSeconds(1));
        assertThatThrownBy(() -> service.verify(mail.token())).isInstanceOf(IllegalArgumentException.class);
        user.setVerificationExpiresAt(Instant.now().plusSeconds(3600));
        user.setStatus(AccountStatus.SUSPENDIDO);
        assertThatThrownBy(() -> service.verify(mail.token())).isInstanceOf(IllegalArgumentException.class);
        assertThat(user.isEmailVerified()).isFalse();
    }

    @Test
    void resendingIsThrottledAndReplacesPreviousLink() {
        when(users.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        service.resend(" CLIENTE@Example.com ");
        String firstHash = user.getVerificationTokenHash();
        service.resend(user.getEmail());
        verify(events, times(1)).publishEvent(any(AccountMail.class));
        user.setVerificationSentAt(Instant.now().minusSeconds(61));
        service.resend(user.getEmail());
        verify(events, times(2)).publishEvent(any(AccountMail.class));
        assertThat(user.getVerificationTokenHash()).isNotEqualTo(firstHash);
    }

    @Test
    void recoveryUsesGenericResponseAndSkipsUnknownUnverifiedOrSuspendedUsers() {
        String absent = service.forgotPassword("missing@example.com").message();
        when(users.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        assertThat(service.forgotPassword(user.getEmail()).message()).isEqualTo(absent);
        user.setEmailVerified(true);
        user.setStatus(AccountStatus.SUSPENDIDO);
        assertThat(service.forgotPassword(user.getEmail()).message()).isEqualTo(absent);
        verifyNoInteractions(events);
    }

    @Test
    void recoveryHashesPasswordRevokesSessionsAndConsumesLink() {
        user.setEmailVerified(true);
        user.setStatus(AccountStatus.ACTIVO);
        when(users.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        service.forgotPassword(user.getEmail());
        service.forgotPassword(user.getEmail());
        verify(events, times(1)).publishEvent(any(AccountMail.class));
        AccountMail mail = lastMail();
        assertThat(mail.action()).isEqualTo("reset-password");
        when(users.findByResetTokenHash(EmailAccountService.hash(mail.token()))).thenReturn(Optional.of(user));
        service.resetPassword(mail.token(), "NuevaClave2026!");
        assertThat(passwords.matches("NuevaClave2026!", user.getPasswordHash())).isTrue();
        assertThat(user.getAuthVersion()).isEqualTo(1);
        assertThat(user.getResetTokenHash()).isNull();
        assertThatThrownBy(() -> service.resetPassword(mail.token(), "OtraClave2026!"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void recoveryRejectsExpiredLinksAndPasswordsBeyondBcryptByteLimit() {
        user.setEmailVerified(true);
        user.setStatus(AccountStatus.ACTIVO);
        when(users.findByEmailForUpdate(user.getEmail())).thenReturn(Optional.of(user));
        service.forgotPassword(user.getEmail());
        AccountMail mail = lastMail();
        when(users.findByResetTokenHash(any())).thenReturn(Optional.of(user));
        user.setResetExpiresAt(Instant.now().minusSeconds(1));
        assertThatThrownBy(() -> service.resetPassword(mail.token(), "NuevaClave2026!"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.resetPassword(mail.token(), "á".repeat(37)))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(user.getAuthVersion()).isZero();
        assertThat(user.getPasswordHash()).isNull();
    }

    @Test
    void verificationAndRecoveryTokensAreNotInterchangeable() {
        service.sendVerification(user);
        String token = lastMail().token();
        assertThatThrownBy(() -> service.resetPassword(token, "NuevaClave2026!"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.verify("invalid"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private AccountMail lastMail() {
        ArgumentCaptor<AccountMail> captor = ArgumentCaptor.forClass(AccountMail.class);
        verify(events, atLeastOnce()).publishEvent(captor.capture());
        return captor.getValue();
    }
}
