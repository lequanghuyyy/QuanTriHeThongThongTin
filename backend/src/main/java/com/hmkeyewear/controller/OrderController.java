package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.CheckoutRequest;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.OrderDetailResponse;
import com.hmkeyewear.dto.response.OrderSummaryResponse;
import com.hmkeyewear.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> checkout(
            Authentication authentication,
            @RequestBody CheckoutRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.checkout(authentication.getName(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderSummaryResponse>>> getOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(authentication.getName(), PageRequest.of(page, size), status)));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetails(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderDetails(authentication.getName(), orderCode)));
    }

    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        orderService.cancelOrder(authentication.getName(), orderCode);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }
}
