package com.shopsphere.order.controller;

import com.shopsphere.order.dto.OrderDto;
import com.shopsphere.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/orders - Create a new order for the authenticated user
     */
    @PostMapping
    public ResponseEntity<OrderDto.OrderResponse> createOrder(
            @Valid @RequestBody OrderDto.CreateOrderRequest request) {
        Long userId = extractUserId();
        OrderDto.OrderResponse response = orderService.createOrder(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/orders - Get current user's orders (paginated)
     */
    @GetMapping
    public ResponseEntity<Page<OrderDto.OrderResponse>> getMyOrders(
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = extractUserId();
        Page<OrderDto.OrderResponse> orders = orderService.getOrdersByUser(userId, pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/{id} - Get a specific order by ID
     * Admins see any order; customers only their own
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.OrderResponse> getOrderById(@PathVariable Long id) {
        Long userId = extractUserId();
        boolean isAdmin = isCurrentUserAdmin();
        OrderDto.OrderResponse response = orderService.getOrderById(id, userId, isAdmin);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/orders/admin/all - Admin: list all orders (paginated)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<Page<OrderDto.OrderResponse>> getAllOrders(
            @PageableDefault(size = 10) Pageable pageable) {
        Page<OrderDto.OrderResponse> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    /**
     * PUT /api/orders/{id}/status - Admin: update order status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto.OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderDto.UpdateStatusRequest request) {
        OrderDto.OrderResponse response = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private Long extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof Number) {
            return ((Number) auth.getDetails()).longValue();
        }
        throw com.shopsphere.order.exception.OrderException.unauthorized("Authentication required: userId not found in token");
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
