package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.request.CreateReviewRequest;
import com.hmkeyewear.dto.response.ReviewPageResponse;
import com.hmkeyewear.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(String userEmail, CreateReviewRequest request);
    ReviewPageResponse getProductReviews(String slug, Integer rating, Pageable pageable);
    java.util.List<ReviewResponse> getMyReviews(String userEmail);
    java.util.List<com.hmkeyewear.dto.response.ReviewableItemResponse> getReviewableItems(String userEmail, String orderCode);
    
    // Admin
    Page<ReviewResponse> getAllReviews(Boolean isApproved, Long productId, Pageable pageable);
    void approveReview(Long reviewId);
    void deleteReview(Long reviewId);
}
