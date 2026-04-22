package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TopProductResponse {
    private ProductBasicInfo product;
    private int totalSold;
    private BigDecimal totalRevenue;

    @Data
    @Builder
    public static class ProductBasicInfo {
        private Long id;
        private String name;
        private String thumbnailUrl;
    }
}
