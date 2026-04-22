package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.ProductCardResponse;
import com.hmkeyewear.dto.response.ProductDetailResponse;
import com.hmkeyewear.entity.Product;
import com.hmkeyewear.repository.specification.ProductSpecification;
import com.hmkeyewear.service.interfaces.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductCardResponse>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String collectionSlug,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String lensIndex,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false) Boolean isBestSeller,
            @RequestParam(required = false) String keyword
    ) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParams[1]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        Specification<Product> spec = ProductSpecification.withDynamicFilter(
                categorySlug, collectionSlug, productType, gender, brand,
                minPrice, maxPrice, lensIndex, isFeatured, isBestSeller, keyword
        );

        return ResponseEntity.ok(ApiResponse.success(productService.getProducts(spec, pageable)));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProduct(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBySlug(slug)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductCardResponse>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchSuggestions(keyword)));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<ApiResponse<List<ProductCardResponse>>> getBestSellers(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getBestSellers(limit)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductCardResponse>>> getFeatured(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts(limit)));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse<List<ProductCardResponse>>> getNewArrivals(@RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getNewArrivals(limit)));
    }

    @GetMapping("/{slug}/related")
    public ResponseEntity<ApiResponse<List<ProductCardResponse>>> getRelatedProducts(@PathVariable String slug, @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getRelatedProducts(slug, limit)));
    }
}
