package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.response.ProductCardResponse;
import com.hmkeyewear.dto.response.ProductDetailResponse;
import com.hmkeyewear.entity.Product;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.mapper.ProductMapper;
import com.hmkeyewear.repository.ProductRepository;
import com.hmkeyewear.service.interfaces.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final com.hmkeyewear.repository.CategoryRepository categoryRepository;
    private final com.hmkeyewear.repository.CollectionRepository collectionRepository;
    private final com.hmkeyewear.repository.ProductVariantRepository productVariantRepository;

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
    public ProductDetailResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
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

    @Override
    public Page<ProductDetailResponse> getAdminProducts(String keyword, Boolean isActive, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            var predicates = cb.conjunction();
            if (keyword != null && !keyword.isEmpty()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates = cb.and(predicates, cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("sku")), pattern)
                ));
            }
            if (isActive != null) {
                predicates = cb.and(predicates, cb.equal(root.get("isActive"), isActive));
            }
            return predicates;
        };
        return productRepository.findAll(spec, pageable).map(productMapper::toDetailResponse);
    }

    private String generateSlug(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + System.currentTimeMillis();
    }

    @Override
    public ProductDetailResponse createProduct(com.hmkeyewear.dto.request.ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setSlug(generateSlug(request.getName()));
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setBrand(request.getBrand());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice() != null ? request.getSalePrice() : request.getBasePrice());
        product.setLensIndex(request.getLensIndex());
        product.setMaterial(request.getMaterial());
        product.setGender(request.getGender());
        product.setActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId()).ifPresent(product::setCategory);
        }
        if (request.getCollectionId() != null) {
            collectionRepository.findById(request.getCollectionId()).ifPresent(product::setCollection);
        }
        
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<com.hmkeyewear.entity.ProductVariant> variants = request.getVariants().stream().map(v -> {
                return com.hmkeyewear.entity.ProductVariant.builder()
                        .product(product)
                        .colorName(v.getColorName())
                        .colorHex(v.getColorHex())
                        .size(v.getSize())
                        .stockQuantity(v.getStockQuantity())
                        .additionalPrice(v.getAdditionalPrice())
                        .sku(v.getSku() != null && !v.getSku().isEmpty() ? v.getSku() : request.getSku() + "-" + v.getColorName())
                        .build();
            }).collect(Collectors.toList());
            product.setVariants(variants);
        }

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<com.hmkeyewear.entity.ProductImage> images = new java.util.ArrayList<>();
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                images.add(com.hmkeyewear.entity.ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0) // First image is primary
                        .sortOrder(i)
                        .build());
            }
            product.setImages(images);
            if (!images.isEmpty()) {
                product.setThumbnailUrl(images.get(0).getImageUrl());
            }
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toDetailResponse(savedProduct);
    }

    @Override
    public ProductDetailResponse updateProduct(Long id, com.hmkeyewear.dto.request.ProductRequest request) {
        log.info("Updating product with ID: {}", id);
        log.debug("Request data: name={}, sku={}, imageUrls count={}, variants count={}", 
                request.getName(), request.getSku(), 
                request.getImageUrls() != null ? request.getImageUrls().size() : 0,
                request.getVariants() != null ? request.getVariants().size() : 0);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setShortDescription(request.getShortDescription());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setBrand(request.getBrand());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice() != null ? request.getSalePrice() : request.getBasePrice());
        product.setLensIndex(request.getLensIndex());
        product.setMaterial(request.getMaterial());
        product.setGender(request.getGender());
        if (request.getIsActive() != null) {
            product.setActive(request.getIsActive());
        }

        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId()).ifPresent(product::setCategory);
        }
        if (request.getCollectionId() != null) {
            collectionRepository.findById(request.getCollectionId()).ifPresent(product::setCollection);
        }

        // Cập nhật variants - chỉ xóa những variant không còn trong danh sách mới
        if (request.getVariants() != null) {
            List<String> newVariantSkus = request.getVariants().stream()
                    .map(v -> v.getSku() != null && !v.getSku().isEmpty() ? v.getSku() : request.getSku() + "-" + v.getColorName())
                    .collect(Collectors.toList());
            
            // Khởi tạo collection nếu null (không thay thế nếu đã có)
            if (product.getVariants() == null) {
                product.setVariants(new java.util.ArrayList<>());
            }
            
            // Xóa những variant cũ không còn trong danh sách mới
            product.getVariants().removeIf(v -> !newVariantSkus.contains(v.getSku()));
            
            // Lấy danh sách SKU hiện có
            List<String> existingSkus = product.getVariants().stream()
                    .map(com.hmkeyewear.entity.ProductVariant::getSku)
                    .collect(Collectors.toList());
            
            // Thêm hoặc cập nhật variants
            for (var vRequest : request.getVariants()) {
                String sku = vRequest.getSku() != null && !vRequest.getSku().isEmpty() 
                        ? vRequest.getSku() 
                        : request.getSku() + "-" + vRequest.getColorName();
                
                // Tìm variant hiện có
                com.hmkeyewear.entity.ProductVariant existingVariant = product.getVariants().stream()
                        .filter(v -> v.getSku().equals(sku))
                        .findFirst()
                        .orElse(null);
                
                if (existingVariant != null) {
                    // Cập nhật variant hiện có
                    existingVariant.setColorName(vRequest.getColorName());
                    existingVariant.setColorHex(vRequest.getColorHex());
                    existingVariant.setSize(vRequest.getSize());
                    existingVariant.setStockQuantity(vRequest.getStockQuantity());
                    existingVariant.setAdditionalPrice(vRequest.getAdditionalPrice() != null ? vRequest.getAdditionalPrice() : java.math.BigDecimal.ZERO);
                } else {
                    // Thêm variant mới
                    product.getVariants().add(com.hmkeyewear.entity.ProductVariant.builder()
                            .product(product)
                            .colorName(vRequest.getColorName())
                            .colorHex(vRequest.getColorHex())
                            .size(vRequest.getSize())
                            .stockQuantity(vRequest.getStockQuantity())
                            .additionalPrice(vRequest.getAdditionalPrice() != null ? vRequest.getAdditionalPrice() : java.math.BigDecimal.ZERO)
                            .sku(sku)
                            .build());
                }
            }
        }

        // Cập nhật images - chỉ xóa những ảnh không còn trong danh sách mới
        if (request.getImageUrls() != null) {
            List<String> newImageUrls = request.getImageUrls();
            
            // Khởi tạo collection nếu null (không thay thế nếu đã có)
            if (product.getImages() == null) {
                product.setImages(new java.util.ArrayList<>());
            }
            
            // Xóa những ảnh cũ không còn trong danh sách mới
            product.getImages().removeIf(img -> !newImageUrls.contains(img.getImageUrl()));
            
            // Lấy danh sách URL ảnh hiện có
            List<String> existingUrls = product.getImages().stream()
                    .map(com.hmkeyewear.entity.ProductImage::getImageUrl)
                    .collect(Collectors.toList());
            
            // Thêm những ảnh mới chưa có
            for (int i = 0; i < newImageUrls.size(); i++) {
                String url = newImageUrls.get(i);
                if (!existingUrls.contains(url)) {
                    product.getImages().add(com.hmkeyewear.entity.ProductImage.builder()
                            .product(product)
                            .imageUrl(url)
                            .isPrimary(i == 0 && product.getImages().isEmpty())
                            .sortOrder(i)
                            .build());
                }
            }
            
            // Cập nhật sortOrder và isPrimary cho tất cả ảnh theo thứ tự mới
            for (int i = 0; i < product.getImages().size(); i++) {
                com.hmkeyewear.entity.ProductImage img = product.getImages().get(i);
                int newIndex = newImageUrls.indexOf(img.getImageUrl());
                if (newIndex >= 0) {
                    img.setSortOrder(newIndex);
                    img.setPrimary(newIndex == 0);
                }
            }
            
            // Sắp xếp lại theo sortOrder
            product.getImages().sort((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()));
            
            // Cập nhật thumbnail
            if (!product.getImages().isEmpty()) {
                product.setThumbnailUrl(product.getImages().get(0).getImageUrl());
            }
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toDetailResponse(savedProduct);
    }

    @Override
    public void toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Nếu đang tắt -> bật, kiểm tra điều kiện
        if (!product.isActive()) {
            validateProductForActivation(product);
        }
        
        product.setActive(!product.isActive());
        productRepository.save(product);
    }
    
    private void validateProductForActivation(Product product) {
        List<String> errors = new java.util.ArrayList<>();
        
        // Kiểm tra thông tin cơ bản
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            errors.add("Tên sản phẩm không được để trống");
        }
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            errors.add("SKU không được để trống");
        }
        if (product.getBasePrice() == null || product.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            errors.add("Giá sản phẩm phải lớn hơn 0");
        }
        if (product.getCategory() == null) {
            errors.add("Chưa chọn danh mục");
        }
        
        // Kiểm tra hình ảnh
        if (product.getImages() == null || product.getImages().isEmpty()) {
            errors.add("Sản phẩm phải có ít nhất 1 hình ảnh");
        }
        
        // Kiểm tra variants và stock
        if (product.getVariants() == null || product.getVariants().isEmpty()) {
            errors.add("Sản phẩm phải có ít nhất 1 biến thể");
        } else {
            boolean hasStock = product.getVariants().stream()
                    .anyMatch(v -> v.getStockQuantity() > 0);
            if (!hasStock) {
                errors.add("Tất cả biến thể đều hết hàng. Vui lòng nhập thêm số lượng");
            }
            
            // Kiểm tra SKU của variants
            for (com.hmkeyewear.entity.ProductVariant variant : product.getVariants()) {
                if (variant.getSku() == null || variant.getSku().trim().isEmpty()) {
                    errors.add("SKU của biến thể không được để trống");
                    break;
                }
            }
        }
        
        if (!errors.isEmpty()) {
            throw new IllegalStateException("Không thể mở bán sản phẩm:\n" + String.join("\n", errors));
        }
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }
}
