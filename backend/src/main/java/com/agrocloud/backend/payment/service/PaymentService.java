package com.agrocloud.backend.payment.service;

import com.agrocloud.backend.payment.dto.CreatePaymentRequest;
import com.agrocloud.backend.payment.dto.PaymentResponse;
import com.agrocloud.backend.payment.entity.PaymentEntity;
import java.util.List;
import java.util.UUID;

public interface PaymentService {
    PaymentResponse registerPayment(CreatePaymentRequest request);
    PaymentEntity registerAutomaticPayment(UUID subscriptionId, String concept);
    List<PaymentResponse> getPaymentsBySubscription(UUID subscriptionId);
    List<PaymentResponse> getPaymentsByUser(UUID userId);
    List<PaymentResponse> getAllPayments();
    PaymentEntity findEntityById(UUID paymentId);
}
