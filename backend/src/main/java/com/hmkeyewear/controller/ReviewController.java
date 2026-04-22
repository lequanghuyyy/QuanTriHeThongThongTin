package com.hmkeyewear.controller;

import com.hmkeyewear.dto.request.CreateReviewRequest;
import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.ReviewPageResponse;
import com.hmkeyewear.dto.response.ReviewResponse;
import com.hmkeyewear.service.interfaces.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/v1/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            Authentication authentication,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Review submitted and waiting for approval", reviewService.createReview(authentication.getName(), request)));
    }

    @GetMapping("/api/v1/products/{slug}/reviews")
    public ResponseEntity<ApiResponse<ReviewPageResponse>> getProductReviews(
            @PathVariable String slug,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = Sort.Direction.fromString(sortParams[1]);
        org.springframework.data.domain.Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(slug, rating, pageable)));
    }
}
