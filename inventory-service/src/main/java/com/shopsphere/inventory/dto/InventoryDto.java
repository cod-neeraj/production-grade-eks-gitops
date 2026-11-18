package com.shopsphere.inventory.dto;

import com.shopsphere.inventory.entity.Inventory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class InventoryDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryResponse {
        private Long id;
        private Long productId;
        private Integer quantity;
        private Integer reservedQuantity;
        private Integer availableQuantity;
        private Integer lowStockThreshold;
        private Boolean lowStock;
        private LocalDateTime updatedAt;

        public static InventoryResponse from(Inventory inventory) {
            int available = inventory.getQuantity() - inventory.getReservedQuantity();
            boolean isLow = available <= inventory.getLowStockThreshold();
            return InventoryResponse.builder()
                    .id(inventory.getId())
                    .productId(inventory.getProductId())
                    .quantity(inventory.getQuantity())
                    .reservedQuantity(inventory.getReservedQuantity())
                    .availableQuantity(available)
                    .lowStockThreshold(inventory.getLowStockThreshold())
                    .lowStock(isLow)
                    .updatedAt(inventory.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdjustStockRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReserveRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReserveResponse {
        private Long productId;
        private Boolean reserved;
        private Integer availableAfter;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ErrorResponse {
        private int status;
        private String error;
        private String message;
        private LocalDateTime timestamp;
    }
}
