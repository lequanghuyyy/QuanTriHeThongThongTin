package com.hmkeyewear.repository.specification;

import com.hmkeyewear.entity.Product;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

public class ProductSpecification {
    public static Specification<Product> withDynamicFilter(
            String categorySlug, String collectionSlug, String productType,
            String gender, String brand, BigDecimal minPrice, BigDecimal maxPrice,
            String lensIndex, Boolean isFeatured, Boolean isBestSeller, String keyword) {

        return Specification.where(isActive())
                .and(hasCategory(categorySlug))
                .and(hasCollection(collectionSlug))
                .and(hasType(productType))
                .and(hasGender(gender))
                .and(hasBrand(brand))
                .and(priceBetween(minPrice, maxPrice))
                .and(hasLensIndex(lensIndex))
                .and(isFeatured(isFeatured))
                .and(isBestSeller(isBestSeller))
                .and(containsKeyword(keyword));
    }

    private static Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    private static Specification<Product> hasCategory(String categorySlug) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(categorySlug)) return cb.conjunction();
            return cb.equal(root.join("category").get("slug"), categorySlug);
        };
    }

    private static Specification<Product> hasCollection(String collectionSlug) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(collectionSlug)) return cb.conjunction();
            return cb.equal(root.join("collection").get("slug"), collectionSlug);
        };
    }

    private static Specification<Product> hasType(String productType) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(productType)) return cb.conjunction();
            String normalized = productType.trim().toUpperCase();
            return cb.equal(root.get("productType"), normalized);
        };
    }

    private static Specification<Product> hasGender(String gender) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(gender)) return cb.conjunction();
            return cb.equal(root.get("gender"), gender);
        };
    }

    private static Specification<Product> hasBrand(String brand) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(brand)) return cb.conjunction();
            return cb.equal(root.get("brand"), brand);
        };
    }

    private static Specification<Product> priceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) return cb.conjunction();
            if (minPrice != null && maxPrice == null) return cb.greaterThanOrEqualTo(root.get("salePrice"), minPrice);
            if (minPrice == null && maxPrice != null) return cb.lessThanOrEqualTo(root.get("salePrice"), maxPrice);
            return cb.between(root.get("salePrice"), minPrice, maxPrice);
        };
    }

    private static Specification<Product> hasLensIndex(String lensIndex) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(lensIndex)) return cb.conjunction();
            return cb.equal(root.get("lensIndex"), lensIndex);
        };
    }

    private static Specification<Product> isFeatured(Boolean isFeatured) {
        return (root, query, cb) -> {
            if (isFeatured == null) return cb.conjunction();
            return cb.equal(root.get("isFeatured"), isFeatured);
        };
    }

    private static Specification<Product> isBestSeller(Boolean isBestSeller) {
        return (root, query, cb) -> {
            if (isBestSeller == null) return cb.conjunction();
            return cb.equal(root.get("isBestSeller"), isBestSeller);
        };
    }

    private static Specification<Product> containsKeyword(String keyword) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(keyword)) return cb.conjunction();
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern),
                    cb.like(cb.lower(root.get("sku")), likePattern)
            );
        };
    }
}
