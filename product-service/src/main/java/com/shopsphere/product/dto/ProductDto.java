package com.shopsphere.product.dto;

import com.shopsphere.product.entity.Product;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProductRequest {
        @NotBlank(message = "Product name is required")
        @Size(max = 200, message = "Name must be at most 200 characters")
        private String name;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
        @Digits(integer = 8, fraction = 2, message = "Invalid price format")
        private BigDecimal price;

        @NotBlank(message = "Category is required")
        @Size(max = 100)
        private String category;

        @NotBlank(message = "SKU is required")
        @Size(max = 100)
        @Pattern(regexp = "^[A-Z0-9\\-]+$", message = "SKU must contain only uppercase letters, digits, and hyphens")
        private String sku;

        private String imageUrl;

        private Boolean available = true;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProductRequest {
        @Size(max = 200)
        private String name;

        private String description;

        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
        @Digits(integer = 8, fraction = 2)
        private BigDecimal price;

        @Size(max = 100)
        private String category;

        private String imageUrl;

        private Boolean available;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private String category;
        private String sku;
        private String imageUrl;
        private Boolean available;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static ProductResponse from(Product p) {
            return ProductResponse.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .description(p.getDescription())
                    .price(p.getPrice())
                    .category(p.getCategory())
                    .sku(p.getSku())
                    .imageUrl(p.getImageUrl())
                    .available(p.getAvailable())
                    .createdAt(p.getCreatedAt())
                    .updatedAt(p.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorResponse {
        private int status;
        private String error;
        private String message;
        private LocalDateTime timestamp;
    }
}
