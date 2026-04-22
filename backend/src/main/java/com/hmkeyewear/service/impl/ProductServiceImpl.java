package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.response.ProductCardResponse;
import com.hmkeyewear.dto.response.ProductDetailResponse;
import com.hmkeyewear.entity.Product;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.mapper.ProductMapper;
import com.hmkeyewear.repository.ProductRepository;
import com.hmkeyewear.service.interfaces.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public Page<ProductCardResponse> getProducts(Specification<Product> spec, Pageable pageable) {
        return productRepository.findAll(spec, pageable).map(productMapper::toCardResponse);
    }

    @Override
    public ProductDetailResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return productMapper.toDetailResponse(product);
    }

    @Override
    public List<ProductCardResponse> searchSuggestions(String keyword) {
        return productRepository.searchByKeyword(keyword).stream()
                .limit(10)
                .map(productMapper::toCardResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "products", key = "'best-sellers'")
    public List<ProductCardResponse> getBestSellers(int limit) {
        return productRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalSold"))
        ).map(productMapper::toCardResponse).getContent();
    }

    @Override
    @Cacheable(value = "products", key = "'featured'")
    public List<ProductCardResponse> getFeaturedProducts(int limit) {
        Specification<Product> spec = (root, query, cb) -> cb.and(
            cb.isTrue(root.get("isActive")),
            cb.isTrue(root.get("isFeatured"))
        );
        return productRepository.findAll(spec, PageRequest.of(0, limit)).map(productMapper::toCardResponse).getContent();
    }

    @Override
    public List<ProductCardResponse> getNewArrivals(int limit) {
        return productRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(productMapper::toCardResponse).getContent();
    }

    @Override
    public List<ProductCardResponse> getRelatedProducts(String slug, int limit) {
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        Specification<Product> spec = (root, query, cb) -> cb.and(
            cb.isTrue(root.get("isActive")),
            cb.equal(root.join("category").get("id"), product.getCategory().getId()),
            cb.notEqual(root.get("id"), product.getId())
        );

        return productRepository.findAll(spec, PageRequest.of(0, limit)).map(productMapper::toCardResponse).getContent();
    }
}
