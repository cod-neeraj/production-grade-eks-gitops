package com.shopsphere.inventory.service;

import com.shopsphere.inventory.dto.InventoryDto;
import com.shopsphere.inventory.entity.Inventory;
import com.shopsphere.inventory.exception.InventoryException;
import com.shopsphere.inventory.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private static final Logger logger = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public InventoryDto.InventoryResponse getByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> InventoryException.notFound(productId));
        return InventoryDto.InventoryResponse.from(inventory);
    }

    @Transactional(readOnly = true)
    public boolean checkAvailability(Long productId, int quantity) {
        return inventoryRepository.findByProductId(productId)
                .map(inv -> (inv.getQuantity() - inv.getReservedQuantity()) >= quantity)
                .orElse(false);
    }

    @Transactional
    public InventoryDto.ReserveResponse reserveStock(InventoryDto.ReserveRequest request) {
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(request.getProductId())
                .orElseThrow(() -> InventoryException.notFound(request.getProductId()));

        int available = inventory.getQuantity() - inventory.getReservedQuantity();

        if (available < request.getQuantity()) {
            int availableAfter = Math.max(0, available);
            logger.warn("Insufficient stock for productId={}: requested={}, available={}",
                    request.getProductId(), request.getQuantity(), available);
            return InventoryDto.ReserveResponse.builder()
                    .productId(request.getProductId())
                    .reserved(false)
                    .availableAfter(availableAfter)
                    .message("Insufficient stock. Available: " + available)
                    .build();
        }

        inventory.setReservedQuantity(inventory.getReservedQuantity() + request.getQuantity());
        inventoryRepository.save(inventory);

        int availableAfter = inventory.getQuantity() - inventory.getReservedQuantity();
        logger.info("Reserved {} units for productId={}. Available after: {}",
                request.getQuantity(), request.getProductId(), availableAfter);

        return InventoryDto.ReserveResponse.builder()
                .productId(request.getProductId())
                .reserved(true)
                .availableAfter(availableAfter)
                .message("Stock reserved successfully")
                .build();
    }

    @Transactional
    public void releaseStock(Long productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
                .orElseThrow(() -> InventoryException.notFound(productId));

        int newReserved = inventory.getReservedQuantity() - quantity;
        if (newReserved < 0) {
            logger.warn("Release amount {} exceeds reserved quantity {} for productId={}. Setting to 0.",
                    quantity, inventory.getReservedQuantity(), productId);
            newReserved = 0;
        }

        inventory.setReservedQuantity(newReserved);
        inventoryRepository.save(inventory);
        logger.info("Released {} units for productId={}. Reserved now: {}", quantity, productId, newReserved);
    }

    @Transactional
    public InventoryDto.InventoryResponse adjustStock(InventoryDto.AdjustStockRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> InventoryException.notFound(request.getProductId()));

        int newQuantity = inventory.getQuantity() + request.getQuantity();
        if (newQuantity < 0) {
            throw InventoryException.badRequest(
                    "Adjustment would result in negative quantity. Current: "
                            + inventory.getQuantity() + ", Adjustment: " + request.getQuantity());
        }

        inventory.setQuantity(newQuantity);
        Inventory saved = inventoryRepository.save(inventory);
        logger.info("Adjusted stock for productId={}: delta={}, new total={}. Notes: {}",
                request.getProductId(), request.getQuantity(), newQuantity, request.getNotes());
        return InventoryDto.InventoryResponse.from(saved);
    }

    @Transactional
    public InventoryDto.InventoryResponse createInventory(Long productId, int initialQty) {
        if (inventoryRepository.findByProductId(productId).isPresent()) {
            throw InventoryException.conflict("Inventory already exists for productId: " + productId);
        }
        if (initialQty < 0) {
            throw InventoryException.badRequest("Initial quantity cannot be negative");
        }

        Inventory inventory = Inventory.builder()
                .productId(productId)
                .quantity(initialQty)
                .reservedQuantity(0)
                .lowStockThreshold(10)
                .build();

        Inventory saved = inventoryRepository.save(inventory);
        logger.info("Created inventory for productId={} with initialQty={}", productId, initialQty);
        return InventoryDto.InventoryResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<InventoryDto.InventoryResponse> getAllInventory(Pageable pageable) {
        return inventoryRepository.findAll(pageable)
                .map(InventoryDto.InventoryResponse::from);
    }
}
