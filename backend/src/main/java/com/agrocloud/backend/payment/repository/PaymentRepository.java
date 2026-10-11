package com.agrocloud.backend.payment.repository;

import com.agrocloud.backend.payment.entity.PaymentEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {
    List<PaymentEntity> findBySubscriptionIdOrderByPaymentDateDesc(UUID subscriptionId);
    List<PaymentEntity> findBySubscriptionUserIdOrderByPaymentDateDesc(UUID userId);
    List<PaymentEntity> findAllByOrderByPaymentDateDesc();
}
