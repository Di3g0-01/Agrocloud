package com.agrocloud.backend.subscription.service;

import com.agrocloud.backend.subscription.dto.CreateSubscriptionRequest;
import com.agrocloud.backend.subscription.dto.SubscriptionResponse;
import com.agrocloud.backend.subscription.entity.SubscriptionEntity;
import com.agrocloud.backend.subscription.entity.SubscriptionStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionService {
    SubscriptionResponse createSubscription(UUID userId, CreateSubscriptionRequest request);
    SubscriptionResponse getActiveSubscription(UUID userId);
    List<SubscriptionResponse> getUserSubscriptions(UUID userId);
    List<SubscriptionResponse> getAllSubscriptions();
    SubscriptionResponse updateSubscriptionStatus(UUID subscriptionId, SubscriptionStatus status);
    Optional<SubscriptionEntity> findActiveSubscriptionEntity(UUID userId);
}
