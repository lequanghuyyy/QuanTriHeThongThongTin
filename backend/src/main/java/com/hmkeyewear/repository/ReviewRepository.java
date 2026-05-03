package com.hmkeyewear.repository;

import com.hmkeyewear.entity.Product;
import com.hmkeyewear.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    boolean existsByOrderItemIdAndUserId(Long orderItemId, String userId);
    
    boolean existsByProductIdAndUserIdAndOrderItemIsNull(Long productId, String userId);

    Page<Review> findByProductSlugAndIsApprovedTrue(String slug, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.product.slug = :slug AND r.isApproved = true AND (:rating IS NULL OR r.rating = :rating)")
    Page<Review> findApprovedByProductSlugAndRating(String slug, Integer rating, Pageable pageable);

    List<Review> findByProductAndIsApprovedTrue(Product product);
    
    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT r.rating as rating, COUNT(r) as count FROM Review r WHERE r.product.slug = :slug AND r.isApproved = true GROUP BY r.rating")
    List<Object[]> getRatingDistribution(String slug);

    // Admin
    Page<Review> findByIsApproved(boolean isApproved, Pageable pageable);
    Page<Review> findByProductId(Long productId, Pageable pageable);
    Page<Review> findByProductIdAndIsApproved(Long productId, boolean isApproved, Pageable pageable);
}
