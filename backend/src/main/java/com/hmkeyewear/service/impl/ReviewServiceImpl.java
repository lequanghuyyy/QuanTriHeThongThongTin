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

        Product product;
        OrderItem orderItem = null;
        boolean isVerifiedPurchase = false;

        // Case 1: Review from order (verified purchase)
        if (request.getOrderItemId() != null) {
            orderItem = orderItemRepository.findById(request.getOrderItemId())
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

            product = orderItem.getProductVariant().getProduct();
            isVerifiedPurchase = true;
        }
        // Case 2: Direct product review
        else if (request.getProductId() != null) {
            product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            
            // Check if user already reviewed this product (without order)
            if (reviewRepository.existsByProductIdAndUserIdAndOrderItemIsNull(product.getId(), user.getId())) {
                throw new ValidationException("You have already reviewed this product");
            }
            
            isVerifiedPurchase = false;
        } else {
            throw new ValidationException("Either orderItemId or productId must be provided");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .orderItem(orderItem)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .isVerifiedPurchase(isVerifiedPurchase)
                .isApproved(true) // Tự động approve review
                .build();

        // Add images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                com.hmkeyewear.entity.ReviewImage image = com.hmkeyewear.entity.ReviewImage.builder()
                        .imageUrl(request.getImageUrls().get(i))
                        .sortOrder(i)
                        .build();
                review.addImage(image);
            }
        }

        review = reviewRepository.save(review);
        
        // Cập nhật rating của product ngay sau khi tạo review
        updateProductRating(product.getId());
        
        return mapToResponse(review);
    }

    @Override
    public List<ReviewResponse> getMyReviews(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return reviews.stream().map(this::mapToResponseWithProduct).toList();
    }

    @Override
    public List<com.hmkeyewear.dto.response.ReviewableItemResponse> getReviewableItems(String userEmail, String orderCode) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        com.hmkeyewear.entity.Order order = orderItemRepository.findByOrderOrderCode(orderCode)
                .stream()
                .findFirst()
                .map(OrderItem::getOrder)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ValidationException("This order does not belong to you");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            return List.of();
        }

        return order.getItems().stream().map(item -> {
            boolean alreadyReviewed = reviewRepository.existsByOrderItemIdAndUserId(item.getId(), user.getId());
            return com.hmkeyewear.dto.response.ReviewableItemResponse.builder()
                    .orderItemId(item.getId())
                    .productName(item.getProductName())
                    .productSlug(item.getProductVariant().getProduct().getSlug())
                    .variantName(item.getVariantName())
                    .imageUrl(item.getProductVariant().getImageUrl() != null 
                        ? item.getProductVariant().getImageUrl() 
                        : item.getProductVariant().getProduct().getThumbnailUrl())
                    .alreadyReviewed(alreadyReviewed)
                    .build();
        }).toList();
    }

    @Override
    public ReviewPageResponse getProductReviews(String slug, Integer rating, Pageable pageable) {
        // Chỉ lấy các review đã được approved để hiển thị công khai
        Page<Review> reviewPage = reviewRepository.findApprovedByProductSlugAndRating(slug, rating, pageable);
        
        // Tính toán rating distribution chỉ dựa trên các review đã approved
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
                .variantName(review.getOrderItem() != null ? review.getOrderItem().getVariantName() : null)
                .imageUrls(review.getImages().stream()
                        .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                        .map(com.hmkeyewear.entity.ReviewImage::getImageUrl)
                        .toList())
                .build();
    }

    private ReviewResponse mapToResponseWithProduct(Review review) {
        Product product = review.getProduct();
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getFullName())
                .userAvatar(review.getUser().getAvatar())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .isVerifiedPurchase(review.isVerifiedPurchase())
                .createdAt(review.getCreatedAt())
                .variantName(review.getOrderItem() != null ? review.getOrderItem().getVariantName() : null)
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .productThumbnail(product.getThumbnailUrl())
                .isApproved(review.isApproved())
                .imageUrls(review.getImages().stream()
                        .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                        .map(com.hmkeyewear.entity.ReviewImage::getImageUrl)
                        .toList())
                .build();
    }
}
