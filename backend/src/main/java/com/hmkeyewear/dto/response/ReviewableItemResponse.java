package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewableItemResponse {
    private Long orderItemId;
    private String productName;
    private String productSlug;
    private String variantName;
    private String imageUrl;
    private boolean alreadyReviewed;
}
