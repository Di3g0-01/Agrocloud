package com.agrocloud.backend.exception;

public class EmailAlreadyRegisteredException extends RuntimeException {

    public EmailAlreadyRegisteredException() {
        super("Ya existe una cuenta registrada con ese correo electrónico");
    }
}
