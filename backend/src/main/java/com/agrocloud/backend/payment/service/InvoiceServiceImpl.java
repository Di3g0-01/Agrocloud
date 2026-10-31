package com.agrocloud.backend.payment.service;

import com.agrocloud.backend.entity.User;
import com.agrocloud.backend.payment.dto.InvoiceResponse;
import com.agrocloud.backend.payment.entity.InvoiceEntity;
import com.agrocloud.backend.payment.entity.PaymentEntity;
import com.agrocloud.backend.payment.repository.InvoiceRepository;
import com.agrocloud.backend.payment.repository.PaymentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public InvoiceResponse getInvoiceByPaymentId(UUID paymentId) {
        InvoiceEntity invoice = invoiceRepository.findByPaymentId(paymentId)
                .orElseGet(() -> {
                    PaymentEntity payment = paymentRepository.findById(paymentId)
                            .orElseThrow(() -> new IllegalArgumentException("No se encontró pago para el ID indicado: " + paymentId));
                    return generateInvoiceForPayment(payment);
                });
        return InvoiceResponse.from(invoice);
    }

    @Override
    public InvoiceEntity generateInvoiceForPayment(PaymentEntity payment) {
        return invoiceRepository.findByPaymentId(payment.getId())
                .orElseGet(() -> {
                    BigDecimal total = payment.getAmount();
                    // Assuming tax is included in total (e.g. 12% IVA: subtotal = total / 1.12)
                    BigDecimal subtotal = total.divide(BigDecimal.valueOf(1.12), 2, RoundingMode.HALF_UP);
                    BigDecimal tax = total.subtract(subtotal);

                    User user = payment.getSubscription().getUser();
                    String customerName = user.getContactName() != null && !user.getContactName().isBlank()
                            ? user.getContactName()
                            : (user.getOrganizationName() != null ? user.getOrganizationName() : "Cliente AgroCloud");
                    String customerEmail = user.getEmail();

                    String invoiceNum = "FAC-" + System.currentTimeMillis();

                    InvoiceEntity newInvoice = InvoiceEntity.builder()
                            .payment(payment)
                            .invoiceNumber(invoiceNum)
                            .issueDate(Instant.now())
                            .subtotal(subtotal)
                            .tax(tax)
                            .total(total)
                            .customerName(customerName)
                            .customerEmail(customerEmail)
                            .concept(payment.getConcept() != null ? payment.getConcept() : "Pago de suscripción - " + payment.getSubscription().getPlan().getName())
                            .build();

                    return invoiceRepository.save(newInvoice);
                });
    }
}
