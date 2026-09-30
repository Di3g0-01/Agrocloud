package com.agrocloud.backend.exception;

public class InstanceLimitExceededException extends RuntimeException {
    public InstanceLimitExceededException(String message) {
        super(message);
    }
}
