package com.agrocloud.backend.payment.service;

import com.agrocloud.backend.payment.dto.InvoiceResponse;
import com.agrocloud.backend.payment.entity.InvoiceEntity;
import com.agrocloud.backend.payment.entity.PaymentEntity;
import java.util.UUID;

public interface InvoiceService {
    InvoiceResponse getInvoiceByPaymentId(UUID paymentId);
    InvoiceEntity generateInvoiceForPayment(PaymentEntity payment);
}
