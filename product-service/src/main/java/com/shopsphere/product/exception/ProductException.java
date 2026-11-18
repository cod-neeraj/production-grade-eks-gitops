package com.shopsphere.product.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ProductException extends RuntimeException {
    private final HttpStatus status;

    public ProductException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public static ProductException notFound(String message) {
        return new ProductException(message, HttpStatus.NOT_FOUND);
    }

    public static ProductException conflict(String message) {
        return new ProductException(message, HttpStatus.CONFLICT);
    }

    public static ProductException badRequest(String message) {
        return new ProductException(message, HttpStatus.BAD_REQUEST);
    }
}
