package com.hmkeyewear.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRequest {
    private String colorName;
    private String colorHex;
    private String size;
    private int stockQuantity;
    private BigDecimal additionalPrice;
    private String sku;
}
