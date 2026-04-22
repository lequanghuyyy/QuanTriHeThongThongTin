package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RevenueChartResponse {
    private List<String> labels;
    private List<java.math.BigDecimal> data;
}
