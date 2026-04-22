package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.OrderDetailResponse;
import com.hmkeyewear.dto.response.OrderSummaryResponse;
import com.hmkeyewear.enums.OrderStatus;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.repository.OrderRepository;
import com.hmkeyewear.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderSummaryResponse>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<OrderSummaryResponse> summaries = orderRepository.findAll(PageRequest.of(page, size))
                .map(order -> OrderSummaryResponse.builder()
                        .orderCode(order.getOrderCode())
                        .status(order.getStatus().name())
                        .totalAmount(order.getTotalAmount())
                        .createdAt(order.getCreatedAt())
                        .itemCount(order.getItems().size())
                        .build());
        return ResponseEntity.ok(ApiResponse.success(summaries));
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
