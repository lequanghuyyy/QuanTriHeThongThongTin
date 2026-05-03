package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.OrderDetailResponse;
import com.hmkeyewear.dto.response.OrderItemResponse;
import com.hmkeyewear.entity.Order;
import com.hmkeyewear.entity.Product;
import com.hmkeyewear.entity.ProductVariant;
import com.hmkeyewear.enums.OrderStatus;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.repository.OrderRepository;
import com.hmkeyewear.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderDetailResponse>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        Page<Order> orders;
        
        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status);
                orders = orderRepository.findByStatusOrderByCreatedAtDesc(orderStatus, PageRequest.of(page, size));
            } catch (IllegalArgumentException e) {
                orders = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
            }
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        }
        
        Page<OrderDetailResponse> responses = orders.map(order -> {
            List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
                ProductVariant variant = item.getProductVariant();
                Product product = variant.getProduct();
                
                String imageUrl = variant.getImageUrl() != null && !variant.getImageUrl().isEmpty() 
                    ? variant.getImageUrl() 
                    : product.getThumbnailUrl();
                
                return OrderItemResponse.builder()
                    .id(item.getId())
                    .productVariantId(variant.getId())
                    .productName(item.getProductName())
                    .variantName(item.getVariantName())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalPrice(item.getTotalPrice())
                    .imageUrl(imageUrl)
                    .slug(product.getSlug())
                    .build();
            }).collect(Collectors.toList());
            
            return OrderDetailResponse.builder()
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus().name())
                    .paymentMethod(order.getPaymentMethod().name())
                    .paymentStatus(order.getPaymentStatus().name())
                    .subtotal(order.getSubtotal())
                    .shippingFee(order.getShippingFee())
                    .discount(order.getDiscount())
                    .totalAmount(order.getTotalAmount())
                    .couponCode(order.getCouponCode())
                    .shippingAddress(order.getShippingAddress())
                    .note(order.getNote())
                    .trackingCode(order.getTrackingCode())
                    .createdAt(order.getCreatedAt())
                    .items(itemResponses)
                    .build();
        });
        
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PutMapping("/{orderCode}/status")
    public ResponseEntity<ApiResponse<Void>> updateOrderStatus(
            @PathVariable String orderCode,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body.get("status");
        var order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(OrderStatus.valueOf(newStatus));
        
        if (body.containsKey("trackingCode")) {
            order.setTrackingCode(body.get("trackingCode"));
        }
        
        orderRepository.save(order);
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderStats() {
        // Implement stats logic
        return ResponseEntity.ok(ApiResponse.success(Map.of("totalOrders", orderRepository.count())));
    }
}
