package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderDetailResponse {
    private String orderCode;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private String couponCode;
    private String shippingAddress; // stored as JSON
    private String note;
    private String trackingCode;
    private Instant createdAt;
    private List<OrderItemResponse> items;
}
