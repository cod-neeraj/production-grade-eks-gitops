package com.shopsphere.product.service;

import com.shopsphere.product.dto.ProductDto;
import com.shopsphere.product.entity.Product;
import com.shopsphere.product.exception.ProductException;
import com.shopsphere.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDto.ProductResponse> getAvailableProducts(String category, String search, Pageable pageable) {
        boolean hasCat = StringUtils.hasText(category);
        boolean hasSearch = StringUtils.hasText(search);

        Page<Product> page;
        if (hasCat && hasSearch) {
            page = productRepository.findAvailableByCategoryAndSearch(category.trim(), search.trim(), pageable);
        } else if (hasCat) {
            page = productRepository.findByAvailableTrueAndCategoryIgnoreCase(category.trim(), pageable);
        } else if (hasSearch) {
            page = productRepository.findAvailableBySearch(search.trim(), pageable);
        } else {
            page = productRepository.findByAvailableTrue(pageable);
        }
        return page.map(ProductDto.ProductResponse::from);
    }

    public Page<ProductDto.ProductResponse> getAllProducts(String category, String search, Pageable pageable) {
        boolean hasCat = StringUtils.hasText(category);
        boolean hasSearch = StringUtils.hasText(search);

        Page<Product> page;
        if (hasCat && hasSearch) {
            page = productRepository.findByCategoryAndSearch(category.trim(), search.trim(), pageable);
        } else if (hasCat) {
            page = productRepository.findByCategoryIgnoreCase(category.trim(), pageable);
        } else if (hasSearch) {
            page = productRepository.findBySearch(search.trim(), pageable);
        } else {
            page = productRepository.findAll(pageable);
        }
        return page.map(ProductDto.ProductResponse::from);
    }

    public ProductDto.ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ProductException.notFound("Product not found with id: " + id));
        return ProductDto.ProductResponse.from(product);
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    @Transactional
    public ProductDto.ProductResponse createProduct(ProductDto.CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw ProductException.conflict("Product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .sku(request.getSku())
                .imageUrl(request.getImageUrl())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        product = productRepository.save(product);
        log.info("Product created: {} (SKU: {})", product.getName(), product.getSku());
        return ProductDto.ProductResponse.from(product);
    }

    @Transactional
    public ProductDto.ProductResponse updateProduct(Long id, ProductDto.UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ProductException.notFound("Product not found with id: " + id));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getAvailable() != null) product.setAvailable(request.getAvailable());

        product = productRepository.save(product);
        log.info("Product updated: {}", product.getId());
        return ProductDto.ProductResponse.from(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw ProductException.notFound("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
        log.info("Product deleted: {}", id);
    }
}
