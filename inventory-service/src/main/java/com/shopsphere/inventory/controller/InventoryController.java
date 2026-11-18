package com.shopsphere.inventory.controller;

import com.shopsphere.inventory.dto.InventoryDto;
import com.shopsphere.inventory.service.InventoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    /**
     * GET /api/inventory - Paginated list of all inventory (admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<InventoryDto.InventoryResponse>> getAllInventory(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getAllInventory(pageable));
    }

    /**
     * GET /api/inventory/product/{productId} - Get inventory by product ID (public)
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryDto.InventoryResponse> getByProductId(
            @PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    /**
     * GET /api/inventory/check/{productId}?quantity=N - Check availability (public)
     */
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int quantity) {
        boolean available = inventoryService.checkAvailability(productId, quantity);
        return ResponseEntity.ok(Map.of(
                "productId", productId,
                "requestedQuantity", quantity,
                "available", available
        ));
    }

    /**
     * POST /api/inventory - Create a new inventory record (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryDto.InventoryResponse> createInventory(
            @RequestBody @Valid CreateInventoryRequest request) {
        InventoryDto.InventoryResponse response =
                inventoryService.createInventory(request.productId(), request.initialQuantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/inventory/reserve - Reserve stock (authenticated)
     */
    @PostMapping("/reserve")
    public ResponseEntity<InventoryDto.ReserveResponse> reserveStock(
            @RequestBody @Valid InventoryDto.ReserveRequest request) {
        return ResponseEntity.ok(inventoryService.reserveStock(request));
    }

    /**
     * POST /api/inventory/release - Release reserved stock (authenticated)
     */
    @PostMapping("/release")
    public ResponseEntity<Map<String, String>> releaseStock(
            @RequestBody @Valid ReleaseStockRequest request) {
        inventoryService.releaseStock(request.productId(), request.quantity());
        return ResponseEntity.ok(Map.of("message", "Stock released successfully"));
    }

    /**
     * PUT /api/inventory/adjust - Adjust stock quantity (admin only)
     */
    @PutMapping("/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryDto.InventoryResponse> adjustStock(
            @RequestBody @Valid InventoryDto.AdjustStockRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(request));
    }

    // Inner record types for request bodies not covered by InventoryDto
    public record CreateInventoryRequest(
            @NotNull(message = "Product ID is required") Long productId,
            int initialQuantity
    ) {}

    public record ReleaseStockRequest(
            @NotNull(message = "Product ID is required") Long productId,
            int quantity
    ) {}
}
