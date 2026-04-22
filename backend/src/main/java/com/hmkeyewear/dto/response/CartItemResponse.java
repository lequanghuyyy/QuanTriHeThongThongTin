package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long productVariantId;
    private String productName;
    private String slug;
    private String colorName;
    private String thumbnailUrl;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private boolean isAvailable;
    private int stockQuantity;
}
