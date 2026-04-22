package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class OrderSummaryResponse {
    private String orderCode;
    private String status;
    private BigDecimal totalAmount;
    private Instant createdAt;
    private int itemCount;
}
