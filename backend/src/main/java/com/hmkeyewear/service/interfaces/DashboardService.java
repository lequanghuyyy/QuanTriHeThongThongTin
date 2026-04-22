package com.hmkeyewear.service.interfaces;

import com.hmkeyewear.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface DashboardService {
    DashboardOverviewResponse getOverview();
    RevenueChartResponse getRevenueChart(String period);
    List<TopProductResponse> getTopProducts(int limit, String period);
    Map<String, Long> getOrderStatusChart();
    List<RevenueByCategoryResponse> getRevenueByCategory();
    Page<LowStockAlertResponse> getLowStockAlerts(Pageable pageable);
}
