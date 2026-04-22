package com.hmkeyewear.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardOverviewResponse {
    private TimeMetric today;
    private TimeMetric thisMonth;
    private TimeMetric thisYear;
    private int pendingOrders;
    private int lowStockProducts;

    @Data
    @Builder
    public static class TimeMetric {
        private BigDecimal revenue;
        private int orders;
        private Integer newCustomers; // null for thisYear to match prompt
    }
}
