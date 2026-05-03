package com.hmkeyewear.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateReviewRequest {
    // Optional - for verified purchase reviews
    private Long orderItemId;
    
    // Required - for direct product reviews
    private Long productId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    private int rating;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;
    
    // Optional - image URLs uploaded via UploadController
    private List<String> imageUrls;
}
