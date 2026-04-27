package com.hmkeyewear.dto.request;

import com.hmkeyewear.enums.Gender;
import com.hmkeyewear.enums.ProductType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String sku;
    private String shortDescription;
    private String description;
    private Long categoryId;
    private Long collectionId;
    private ProductType productType;
    private String brand;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private String lensIndex;
    private String lensCoating;
    private String material;
    private String frameShape;
    private Gender gender;
    private Boolean isActive;
    
    private List<String> imageUrls;
    private List<ProductVariantRequest> variants;
}
