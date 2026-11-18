package com.shopsphere.inventory.exception;

import org.springframework.http.HttpStatus;

public class InventoryException extends RuntimeException {

    private final HttpStatus status;

    public InventoryException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static InventoryException notFound(Long productId) {
        return new InventoryException(
                "Inventory not found for productId: " + productId,
                HttpStatus.NOT_FOUND
        );
    }

    public static InventoryException conflict(String message) {
        return new InventoryException(message, HttpStatus.CONFLICT);
    }

    public static InventoryException badRequest(String message) {
        return new InventoryException(message, HttpStatus.BAD_REQUEST);
    }
}
