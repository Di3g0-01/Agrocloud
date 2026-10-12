package com.agrocloud.backend.instance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record InstanceCredentialResponse(
        @JsonProperty("instanciaId") UUID instanceId,
        @JsonProperty("nombreInstancia") String instanceName,
        @JsonProperty("host") String host,
        @JsonProperty("puerto") Integer port,
        @JsonProperty("databaseName") String databaseName,
        @JsonProperty("dbUser") String dbUser,
        @JsonProperty("password") String password,
        @JsonProperty("region") String region,
        @JsonProperty("versionEngine") String versionEngine
) {}
