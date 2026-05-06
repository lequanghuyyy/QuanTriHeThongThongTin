package com.hmkeyewear.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductCardResponse {
    private Long id;
    private String name;
    private String slug;
    private String thumbnailUrl;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Double discountPercent;
    private double averageRating;
    private int reviewCount;
    private boolean isBestSeller;
    private CategoryInfo category;
    private List<VariantInfo> variants;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VariantInfo {
        private Long id;
        private String colorName;
        private String colorHex;
        private int stockQuantity;
    }
}
