package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.ApiResponse;
import com.hmkeyewear.dto.response.ReviewResponse;
import com.hmkeyewear.service.interfaces.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviews(
            @RequestParam(required = false) Boolean isApproved,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAllReviews(isApproved, productId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveReview(@PathVariable Long id) {
        reviewService.approveReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review approved successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
}
