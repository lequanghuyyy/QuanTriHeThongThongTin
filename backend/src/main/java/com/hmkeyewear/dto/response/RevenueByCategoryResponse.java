package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RevenueByCategoryResponse {
    private CategoryBasicInfo category;
    private BigDecimal revenue;
    private double percentage;

    @Data
    @Builder
    public static class CategoryBasicInfo {
        private String name;
    }
}
