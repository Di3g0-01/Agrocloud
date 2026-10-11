package com.agrocloud.backend.payment.dto;

import com.agrocloud.backend.payment.entity.InvoiceEntity;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        UUID pagoId,
        UUID suscripcionId,
        String numeroFactura,
        Instant fechaEmision,
        String clienteNombre,
        String clienteEmail,
        String concepto,
        BigDecimal subtotal,
        BigDecimal impuesto,
        BigDecimal total,
        String metodoPago,
        String referenciaPago,
        String estado
) {
    public static InvoiceResponse from(InvoiceEntity entity) {
        return new InvoiceResponse(
                entity.getId(),
                entity.getPayment().getId(),
                entity.getPayment().getSubscription().getId(),
                entity.getInvoiceNumber(),
                entity.getIssueDate(),
                entity.getCustomerName(),
                entity.getCustomerEmail(),
                entity.getConcept(),
                entity.getSubtotal(),
                entity.getTax(),
                entity.getTotal(),
                entity.getPayment().getPaymentMethod(),
                entity.getPayment().getReference(),
                "PAGADA"
        );
    }
}
