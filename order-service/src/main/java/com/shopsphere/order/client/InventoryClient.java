package com.shopsphere.order.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class InventoryClient {

    private static final Logger logger = LoggerFactory.getLogger(InventoryClient.class);

    private final RestTemplate restTemplate;

    @Value("${services.inventory-url}")
    private String inventoryUrl;

    public InventoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Reserve stock for a given product.
     * @return true if reservation was successful, false if inventory service is unreachable or rejected
     */
    public boolean reserveStock(Long productId, int quantity) {
        try {
            String url = inventoryUrl + "/api/inventory/reserve";
            Map<String, Object> request = new HashMap<>();
            request.put("productId", productId);
            request.put("quantity", quantity);
            restTemplate.postForEntity(url, request, Void.class);
            return true;
        } catch (RestClientException e) {
            logger.error("Failed to reserve stock for productId={}, quantity={}: {}", productId, quantity, e.getMessage());
            return false;
        }
    }

    /**
     * Release previously reserved stock.
     */
    public void releaseStock(Long productId, int quantity) {
        try {
            String url = inventoryUrl + "/api/inventory/release";
            Map<String, Object> request = new HashMap<>();
            request.put("productId", productId);
            request.put("quantity", quantity);
            restTemplate.postForEntity(url, request, Void.class);
        } catch (RestClientException e) {
            logger.error("Failed to release stock for productId={}, quantity={}: {}", productId, quantity, e.getMessage());
        }
    }
}
