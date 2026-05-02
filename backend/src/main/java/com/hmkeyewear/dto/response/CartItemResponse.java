package com.hmkeyewear.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    
    private int stockQuantity;
}
