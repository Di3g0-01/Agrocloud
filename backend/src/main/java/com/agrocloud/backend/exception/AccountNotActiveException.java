package com.agrocloud.backend.exception;

public class AccountNotActiveException extends RuntimeException {

    public AccountNotActiveException() {
        super("La cuenta no está activa. Si acabas de registrarte, confirma primero tu correo electrónico.");
    }
}
