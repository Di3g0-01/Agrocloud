package com.agrocloud.backend.exception;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Correo electrónico o contraseña incorrectos");
    }
}
