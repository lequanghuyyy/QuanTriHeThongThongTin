package com.hmkeyewear.entity;

import com.hmkeyewear.enums.Gender;
import com.hmkeyewear.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id")
    private Collection collection;

    @Enumerated(EnumType.STRING)
    private ProductType productType;

    private String brand;

    private BigDecimal basePrice;

    private BigDecimal salePrice;

    private Double discountPercent;

    private String thumbnailUrl;

    @Builder.Default
    private boolean isActive = true;

    private boolean isFeatured;

    private boolean isBestSeller;

    @Builder.Default
    private int totalSold = 0;

    @Builder.Default
    private double averageRating = 0.0;

    @Builder.Default
    private int reviewCount = 0;

    // Lens specifics
    private String lensIndex;
    private String lensCoating;
    private String lensFeature;
    private Float minPower;
    private Float maxPower;

    // Frame/Sunglasses specifics
    private String material;
    private String frameShape;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants;
}
