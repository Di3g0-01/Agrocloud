package com.agrocloud.backend.payment.service;

import com.agrocloud.backend.exception.SubscriptionNotFoundException;
import com.agrocloud.backend.payment.dto.CreatePaymentRequest;
import com.agrocloud.backend.payment.dto.PaymentResponse;
import com.agrocloud.backend.payment.entity.PaymentEntity;
import com.agrocloud.backend.payment.entity.PaymentStatus;
import com.agrocloud.backend.payment.repository.PaymentRepository;
import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.repository.SubscriptionRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceService invoiceService;

    @Override
    public PaymentResponse registerPayment(CreatePaymentRequest request) {
        SubscriptionEntity subscription = subscriptionRepository.findById(request.subscriptionId())
                .orElseThrow(() -> new SubscriptionNotFoundException("Suscripción no encontrada con ID: " + request.subscriptionId()));

        String ref = (request.referencia() != null && !request.referencia().isBlank())
                ? request.referencia()
                : "REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String method = (request.metodoPago() != null && !request.metodoPago().isBlank())
                ? request.metodoPago()
                : "TARJETA";

        String concept = (request.concepto() != null && !request.concepto().isBlank())
                ? request.concepto()
                : "Pago de suscripción - " + subscription.getPlan().getName();

        PaymentEntity payment = PaymentEntity.builder()
                .subscription(subscription)
                .amount(request.monto())
                .paymentDate(Instant.now())
                .status(PaymentStatus.COMPLETED)
                .reference(ref)
                .paymentMethod(method)
                .concept(concept)
                .build();

        PaymentEntity saved = paymentRepository.save(payment);
        invoiceService.generateInvoiceForPayment(saved);

        return PaymentResponse.from(saved);
    }

    @Override
    public PaymentEntity registerAutomaticPayment(UUID subscriptionId, String concept) {
        SubscriptionEntity subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Suscripción no encontrada con ID: " + subscriptionId));

        PaymentEntity payment = PaymentEntity.builder()
                .subscription(subscription)
                .amount(subscription.getAmount())
                .paymentDate(Instant.now())
                .status(PaymentStatus.COMPLETED)
                .reference("REF-RENOV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .paymentMethod("TARJETA")
                .concept(concept != null ? concept : "Renovación de suscripción - " + subscription.getPlan().getName())
                .build();

        PaymentEntity saved = paymentRepository.save(payment);
        invoiceService.generateInvoiceForPayment(saved);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsBySubscription(UUID subscriptionId) {
        return paymentRepository.findBySubscriptionIdOrderByPaymentDateDesc(subscriptionId).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByUser(UUID userId) {
        return paymentRepository.findBySubscriptionUserIdOrderByPaymentDateDesc(userId).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc().stream()
                .map(PaymentResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentEntity findEntityById(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Pago no encontrado con ID: " + paymentId));
    }
}
