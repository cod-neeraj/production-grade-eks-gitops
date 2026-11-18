package com.shopsphere.auth.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AuthException extends RuntimeException {
    private final HttpStatus status;

    public AuthException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public static AuthException conflict(String message) {
        return new AuthException(message, HttpStatus.CONFLICT);
    }

    public static AuthException unauthorized(String message) {
        return new AuthException(message, HttpStatus.UNAUTHORIZED);
    }

    public static AuthException notFound(String message) {
        return new AuthException(message, HttpStatus.NOT_FOUND);
    }
}
