package com.shopsphere.order.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class ProductClient {

    private static final Logger logger = LoggerFactory.getLogger(ProductClient.class);

    private final RestTemplate restTemplate;

    @Value("${services.product-url}")
    private String productUrl;

    public ProductClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetch product details by ID.
     * @return product data map, or null if product not found or service unreachable
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getProduct(Long productId) {
        try {
            String url = productUrl + "/api/products/" + productId;
            return restTemplate.getForObject(url, Map.class);
        } catch (RestClientException e) {
            logger.error("Failed to fetch product with id={}: {}", productId, e.getMessage());
            return null;
        }
    }
}
