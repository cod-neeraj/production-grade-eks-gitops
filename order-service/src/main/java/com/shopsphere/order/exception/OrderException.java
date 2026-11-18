package com.shopsphere.order.exception;

import org.springframework.http.HttpStatus;

public class OrderException extends RuntimeException {

    private final HttpStatus httpStatus;

    public OrderException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public static OrderException notFound(String message) {
        return new OrderException(message, HttpStatus.NOT_FOUND);
    }

    public static OrderException unauthorized(String message) {
        return new OrderException(message, HttpStatus.UNAUTHORIZED);
    }

    public static OrderException forbidden(String message) {
        return new OrderException(message, HttpStatus.FORBIDDEN);
    }

    public static OrderException badRequest(String message) {
        return new OrderException(message, HttpStatus.BAD_REQUEST);
    }

    public static OrderException serviceUnavailable(String message) {
        return new OrderException(message, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
