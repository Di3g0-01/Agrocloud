package com.agrocloud.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import com.agrocloud.backend.service.AccountMailService.AccountMail;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class AccountMailServiceTest {
    @Test
    void sendsBrevoRequestOverHttpsWithVerifiedPersonalSender() {
        JavaMailSender smtp = mock(JavaMailSender.class);
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        AccountMailService service = new AccountMailService(smtp, "AgroCloud <student@gmail.com>",
                "https://agrocloud-three.vercel.app", "brevo", "test-key", builder);
        server.expect(requestTo("https://api.brevo.com/v3/smtp/email"))
                .andExpect(method(HttpMethod.POST)).andExpect(header("api-key", "test-key"))
                .andExpect(jsonPath("$.sender.email").value("student@gmail.com"))
                .andExpect(jsonPath("$.sender.name").value("AgroCloud"))
                .andExpect(jsonPath("$.to[0].email").value("recipient@example.test"))
                .andExpect(jsonPath("$.textContent").value(org.hamcrest.Matchers.containsString("#verify-email=")))
                .andRespond(withStatus(HttpStatus.CREATED));
        service.deliver(new AccountMail("recipient@example.test", "verify-email", "a".repeat(43)));
        server.verify();
        verifyNoInteractions(smtp);
    }

    @Test
    void sendsVerificationAndRecoveryLinksToConfiguredFrontend() {
        JavaMailSender sender = mock(JavaMailSender.class);
        AccountMailService service = new AccountMailService(sender, "AgroCloud <no-reply@example.test>",
                "https://agrocloud-three.vercel.app/", "smtp", "");
        service.deliver(new AccountMail("user@example.test", "verify-email", "a".repeat(43)));
        service.deliver(new AccountMail("user@example.test", "reset-password", "b".repeat(43)));
        ArgumentCaptor<SimpleMailMessage> mail = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender, times(2)).send(mail.capture());
        assertThat(mail.getAllValues().get(0).getText()).contains(
                "https://agrocloud-three.vercel.app/#verify-email=" + "a".repeat(43), "24 horas");
        assertThat(mail.getAllValues().get(1).getText()).contains("#reset-password=" + "b".repeat(43), "30 minutos");
        assertThat(mail.getValue().getTo()).containsExactly("user@example.test");
    }

    @Test
    void rejectsUnsafeFrontendUrlsAndMissingProviderCredentials() {
        JavaMailSender sender = mock(JavaMailSender.class);
        for (String url : new String[]{"http://example.com", "https://example.com?redirect=evil", "https://user:pass@example.com", "https://example.com/#fragment"}) {
            assertThatThrownBy(() -> new AccountMailService(sender, "from@example.test", url, "smtp", ""))
                    .isInstanceOf(IllegalArgumentException.class);
        }
        assertThatThrownBy(() -> new AccountMailService(sender, "from@example.test", "https://example.com", "brevo", ""))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
