package com.agrocloud.backend.instance.service;

import com.agrocloud.backend.instance.dto.CreateInstanceRequest;
import com.agrocloud.backend.instance.dto.InstanceResponse;
import com.agrocloud.backend.instance.entity.InstanceStatus;
import java.util.List;
import java.util.UUID;

public interface InstanceService {
    List<InstanceResponse> getInstancesForUser(UUID userId);
    List<InstanceResponse> getAllInstances();
    InstanceResponse getInstanceById(UUID id, UUID requestingUserId, boolean isAdminOrSupport);
    InstanceResponse createInstance(UUID ownerId, CreateInstanceRequest request);
    InstanceResponse restartInstance(UUID id, UUID requestingUserId, boolean isAdminOrSupport);
    InstanceResponse updateInstanceStatus(UUID id, InstanceStatus newStatus);
    void deleteInstance(UUID id, UUID requestingUserId, boolean isAdminOrSupport);
}
