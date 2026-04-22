package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.request.CreateReviewRequest;
import com.hmkeyewear.dto.response.ReviewPageResponse;
import com.hmkeyewear.dto.response.ReviewResponse;
import com.hmkeyewear.entity.OrderItem;
import com.hmkeyewear.entity.Product;
import com.hmkeyewear.entity.Review;
import com.hmkeyewear.entity.User;
import com.hmkeyewear.enums.OrderStatus;
import com.hmkeyewear.exception.ResourceNotFoundException;
import com.hmkeyewear.exception.ValidationException;
import com.hmkeyewear.repository.OrderItemRepository;
import com.hmkeyewear.repository.ProductRepository;
import com.hmkeyewear.repository.ReviewRepository;
import com.hmkeyewear.repository.UserRepository;
import com.hmkeyewear.service.interfaces.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(String userEmail, CreateReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem not found"));

        if (!orderItem.getOrder().getUser().getId().equals(user.getId())) {
            throw new ValidationException("This order item does not belong to you");
        }

        if (orderItem.getOrder().getStatus() != OrderStatus.DELIVERED) {
            throw new ValidationException("You can only review delivered items");
        }

        if (reviewRepository.existsByOrderItemIdAndUserId(orderItem.getId(), user.getId())) {
            throw new ValidationException("You have already reviewed this item");
        }

        Product product = orderItem.getProductVariant().getProduct();

        Review review = Review.builder()
                .product(product)
                .user(user)
                .orderItem(orderItem)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .isVerifiedPurchase(true)
                .isApproved(false)
                .build();

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    @Override
    public ReviewPageResponse getProductReviews(String slug, Integer rating, Pageable pageable) {
        Page<Review> reviewPage = reviewRepository.findApprovedByProductSlugAndRating(slug, rating, pageable);
        
        List<Object[]> distributionRaw = reviewRepository.getRatingDistribution(slug);
        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) distribution.put(i, 0);

        int totalCount = 0;
        long totalSum = 0;
        for (Object[] row : distributionRaw) {
            int r = ((Number) row[0]).intValue();
            int c = ((Number) row[1]).intValue();
            distribution.put(r, c);
            totalCount += c;
            totalSum += ((long) r * c);
        }

        double avgRating = totalCount == 0 ? 0 : (double) totalSum / totalCount;
        avgRating = Math.round(avgRating * 10.0) / 10.0;

        ReviewPageResponse.ReviewSummary summary = ReviewPageResponse.ReviewSummary.builder()
                .avgRating(avgRating)
                .totalCount(totalCount)
                .ratingDistribution(distribution)
                .build();

        return ReviewPageResponse.builder()
                .reviews(reviewPage.map(this::mapToResponse))
                .summary(summary)
                .build();
    }

    @Override
    public Page<ReviewResponse> getAllReviews(Boolean isApproved, Long productId, Pageable pageable) {
        Page<Review> reviews;
        if (productId != null && isApproved != null) {
            reviews = reviewRepository.findByProductIdAndIsApproved(productId, isApproved, pageable);
        } else if (productId != null) {
            reviews = reviewRepository.findByProductId(productId, pageable);
        } else if (isApproved != null) {
            reviews = reviewRepository.findByIsApproved(isApproved, pageable);
        } else {
            reviews = reviewRepository.findAll(pageable);
        }
        return reviews.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.isApproved()) {
            review.setApproved(true);
            reviewRepository.save(review);
            updateProductRating(review.getProduct().getId());
        }
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        Long productId = review.getProduct().getId();
        boolean wasApproved = review.isApproved();
        
        reviewRepository.delete(review);
        reviewRepository.flush(); // ensure deletion before recalc
        
        if (wasApproved) {
            updateProductRating(productId);
        }
    }

    private void updateProductRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<Review> approvedReviews = reviewRepository.findByProductAndIsApprovedTrue(product);
        int count = approvedReviews.size();
        
        if (count == 0) {
            product.setAverageRating(0.0);
            product.setReviewCount(0);
        } else {
            double sum = approvedReviews.stream().mapToInt(Review::getRating).sum();
            double avg = sum / count;
            product.setAverageRating(Math.round(avg * 10.0) / 10.0);
            product.setReviewCount(count);
        }
        productRepository.save(product);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getFullName())
                .userAvatar(review.getUser().getAvatar())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .isVerifiedPurchase(review.isVerifiedPurchase())
                .createdAt(review.getCreatedAt())
                .variantName(review.getOrderItem().getVariantName())
                .build();
    }
}
