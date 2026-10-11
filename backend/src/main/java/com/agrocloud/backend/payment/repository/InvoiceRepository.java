package com.agrocloud.backend.payment.repository;

import com.agrocloud.backend.payment.entity.InvoiceEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {
    Optional<InvoiceEntity> findByPaymentId(UUID paymentId);
    Optional<InvoiceEntity> findByInvoiceNumber(String invoiceNumber);
}
