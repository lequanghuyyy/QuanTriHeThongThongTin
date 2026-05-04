package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.CreateReviewRequest;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.ReviewPageResponse;
import com.hmkeyewear.dto.response.ReviewResponse;
import com.hmkeyewear.service.interfaces.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/v1/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            Authentication authentication,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Review submitted successfully", reviewService.createReview(authentication.getName(), request)));
    }

    @GetMapping("/api/v1/products/{slug}/reviews")
    public ResponseEntity<ApiResponse<ReviewPageResponse>> getProductReviews(
            @PathVariable String slug,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        log.info("Getting reviews for product: {}, rating: {}, page: {}, size: {}, sort: {}", slug, rating, page, size, sort);
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 
            ? Sort.Direction.fromString(sortParams[1]) 
            : Sort.Direction.DESC;
        String sortField = sortParams.length > 0 ? sortParams[0] : "createdAt";
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        
        ReviewPageResponse response = reviewService.getProductReviews(slug, rating, pageable);
        log.info("Found {} reviews for product {}", response.getReviews().getTotalElements(), slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/v1/reviews/my-reviews")
    public ResponseEntity<ApiResponse<java.util.List<ReviewResponse>>> getMyReviews(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getMyReviews(authentication.getName())));
    }

    @GetMapping("/api/v1/orders/{orderCode}/reviewable-items")
    public ResponseEntity<ApiResponse<java.util.List<com.hmkeyewear.dto.response.ReviewableItemResponse>>> getReviewableItems(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewableItems(authentication.getName(), orderCode)));
    }
}
