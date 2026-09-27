package com.agrocloud.backend.exception;

public class AccountNotActiveException extends RuntimeException {

    public AccountNotActiveException() {
        super("La cuenta no se encuentra activa");
    }
}
