package com.shopsphere.order.service;

import com.shopsphere.order.client.InventoryClient;
import com.shopsphere.order.client.ProductClient;
import com.shopsphere.order.dto.OrderDto;
import com.shopsphere.order.entity.Order;
import com.shopsphere.order.entity.OrderItem;
import com.shopsphere.order.entity.OrderStatus;
import com.shopsphere.order.exception.OrderException;
import com.shopsphere.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final InventoryClient inventoryClient;

    public OrderService(OrderRepository orderRepository,
                        ProductClient productClient,
                        InventoryClient inventoryClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
        this.inventoryClient = inventoryClient;
    }

    /**
     * Creates a new order for the given user.
     * Validates items, fetches current prices from product service,
     * reserves stock, and saves the order with CONFIRMED status.
     */
    public OrderDto.OrderResponse createOrder(OrderDto.CreateOrderRequest request, Long userId) {
        List<OrderDto.OrderItemRequest> itemRequests = request.getItems();
        if (itemRequests == null || itemRequests.isEmpty()) {
            throw OrderException.badRequest("Order must have at least one item");
        }

        // Fetch product info and build order items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderDto.OrderItemRequest itemRequest : itemRequests) {
            Map<String, Object> product = productClient.getProduct(itemRequest.getProductId());
            if (product == null) {
                throw OrderException.badRequest(
                    "Product not found or product service unavailable for productId=" + itemRequest.getProductId());
            }

            String productName = (String) product.get("name");
            Object priceObj = product.get("price");
            if (productName == null || priceObj == null) {
                throw OrderException.badRequest(
                    "Invalid product data for productId=" + itemRequest.getProductId());
            }

            BigDecimal unitPrice = new BigDecimal(priceObj.toString());
            int quantity = itemRequest.getQuantity();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            totalAmount = totalAmount.add(subtotal);

            OrderItem item = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .productName(productName)
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();
            orderItems.add(item);
        }

        // Reserve stock for all items; rollback if any reservation fails
        List<OrderItem> reservedItems = new ArrayList<>();
        for (OrderItem item : orderItems) {
            boolean reserved = inventoryClient.reserveStock(item.getProductId(), item.getQuantity());
            if (!reserved) {
                // Release already-reserved items
                for (OrderItem reservedItem : reservedItems) {
                    inventoryClient.releaseStock(reservedItem.getProductId(), reservedItem.getQuantity());
                }
                throw OrderException.badRequest(
                    "Stock reservation failed for productId=" + item.getProductId() +
                    ". The item may be out of stock.");
            }
            reservedItems.add(item);
        }

        // Build and save the order
        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(totalAmount)
                .shippingAddress(request.getShippingAddress())
                .notes(request.getNotes())
                .items(new ArrayList<>())
                .build();

        // Associate items with the order
        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Order savedOrder = orderRepository.save(order);
        logger.info("Order created: id={}, userId={}, total={}", savedOrder.getId(), userId, totalAmount);
        return OrderDto.OrderResponse.from(savedOrder);
    }

    /**
     * Returns paginated orders for a specific user.
     */
    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getOrdersByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(OrderDto.OrderResponse::from);
    }

    /**
     * Returns a single order.
     * Admins can fetch any order; customers can only fetch their own.
     */
    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderById(Long id, Long userId, boolean isAdmin) {
        if (isAdmin) {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> OrderException.notFound("Order not found with id=" + id));
            return OrderDto.OrderResponse.from(order);
        } else {
            Order order = orderRepository.findByIdAndUserId(id, userId)
                    .orElseThrow(() -> OrderException.notFound("Order not found with id=" + id));
            return OrderDto.OrderResponse.from(order);
        }
    }

    /**
     * Admin: update order status. Releases stock if cancelling a CONFIRMED order.
     */
    public OrderDto.OrderResponse updateOrderStatus(Long id, String newStatusStr) {
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw OrderException.badRequest("Invalid order status: " + newStatusStr);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> OrderException.notFound("Order not found with id=" + id));

        OrderStatus previousStatus = order.getStatus();

        // Release stock if cancelling a confirmed order
        if (newStatus == OrderStatus.CANCELLED && previousStatus == OrderStatus.CONFIRMED) {
            for (OrderItem item : order.getItems()) {
                inventoryClient.releaseStock(item.getProductId(), item.getQuantity());
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        logger.info("Order status updated: id={}, from={}, to={}", id, previousStatus, newStatus);
        return OrderDto.OrderResponse.from(updatedOrder);
    }

    /**
     * Admin: get all orders paginated.
     */
    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(OrderDto.OrderResponse::from);
    }
}
