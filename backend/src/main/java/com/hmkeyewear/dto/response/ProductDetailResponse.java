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
public class ProductDetailResponse {
    private Long id;
    private String sku;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private String brand;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Double discountPercent;
    private boolean isBestSeller;
    private boolean isFeatured;
    private double averageRating;
    private int reviewCount;
    private int totalSold;
    
    // Lens Details
    private String lensIndex;
    private String lensCoating;
    private String lensFeature;
    
    // Frame Details
    private String material;
    private String frameShape;
    private String gender;

    private ProductCardResponse.CategoryInfo category;
    private CollectionInfo collection;
    
    private List<ImageInfo> images;
    private List<VariantDetailInfo> variants;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CollectionInfo {
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImageInfo {
        private Long id;
        private String imageUrl;
        private String altText;
        private boolean isPrimary;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VariantDetailInfo {
        private Long id;
        private String sku;
        private String colorName;
        private String colorHex;
        private String size;
        private BigDecimal additionalPrice;
        private int stockQuantity;
        private String imageUrl;
    }
}
