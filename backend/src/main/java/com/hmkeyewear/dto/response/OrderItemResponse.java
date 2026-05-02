package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productVariantId;
    private String productName;
    private String variantName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String imageUrl; // Variant image or product thumbnail
    private String slug; // For linking to product detail
}
