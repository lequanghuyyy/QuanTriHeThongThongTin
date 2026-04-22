package com.hmkeyewear.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private String colorName;

    private String colorHex;

    private String size;

    @Builder.Default
    private BigDecimal additionalPrice = BigDecimal.ZERO;

    private int stockQuantity;

    @Column(unique = true)
    private String sku;

    private String imageUrl;
}
