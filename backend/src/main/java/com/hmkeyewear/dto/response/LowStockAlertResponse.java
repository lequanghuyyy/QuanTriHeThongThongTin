package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LowStockAlertResponse {
    private Long variantId;
    private String productName;
    private String variantName;
    private String sku;
    private int stockQuantity;
    private String thumbnailUrl;
}
