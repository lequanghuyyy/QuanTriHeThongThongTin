package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.response.ProductCardResponse;
import com.hmkeyewear.dto.response.ProductDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.hmkeyewear.entity.Product;

import java.util.List;

public interface ProductService {
    Page<ProductCardResponse> getProducts(Specification<Product> spec, Pageable pageable);
    ProductDetailResponse getProductBySlug(String slug);
    ProductDetailResponse getProductById(Long id);
    List<ProductCardResponse> searchSuggestions(String keyword);
    List<ProductCardResponse> getBestSellers(int limit);
    List<ProductCardResponse> getFeaturedProducts(int limit);
    List<ProductCardResponse> getNewArrivals(int limit);
    List<ProductCardResponse> getRelatedProducts(String slug, int limit);
    
    // Admin methods
    Page<ProductDetailResponse> getAdminProducts(String keyword, Boolean isActive, Pageable pageable);
    ProductDetailResponse createProduct(com.hmkeyewear.dto.request.ProductRequest request);
    ProductDetailResponse updateProduct(Long id, com.hmkeyewear.dto.request.ProductRequest request);
    void toggleProductStatus(Long id);
    void deleteProduct(Long id);
}
