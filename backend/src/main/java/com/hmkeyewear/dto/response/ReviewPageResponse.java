package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.Map;

@Data
@Builder
public class ReviewPageResponse {
    private Page<ReviewResponse> reviews;
    private ReviewSummary summary;

    @Data
    @Builder
    public static class ReviewSummary {
        private double avgRating;
        private int totalCount;
        private Map<Integer, Integer> ratingDistribution;
    }
}
