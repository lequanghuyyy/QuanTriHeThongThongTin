package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String userName;
    private String userAvatar;
    private int rating;
    private String title;
    private String content;
    private boolean isVerifiedPurchase;
    private Instant createdAt;
    private String variantName;
}
