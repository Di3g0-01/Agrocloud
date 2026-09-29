package com.agrocloud.backend.subscription.repository;

import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, UUID> {
    Optional<SubscriptionEntity> findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, SubscriptionStatus status);
    List<SubscriptionEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
