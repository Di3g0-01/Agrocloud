package com.agrocloud.backend.payment.controller;

import com.agrocloud.backend.payment.dto.InvoiceResponse;
import com.agrocloud.backend.payment.service.InvoiceService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/facturas")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/{pagoId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByPaymentId(@PathVariable UUID pagoId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByPaymentId(pagoId));
    }

    @GetMapping("/pago/{pagoId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByPaymentIdAlias(@PathVariable UUID pagoId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByPaymentId(pagoId));
    }
}
