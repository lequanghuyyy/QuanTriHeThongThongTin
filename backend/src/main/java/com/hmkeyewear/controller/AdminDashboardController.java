package com.hmkeyewear.controller;

import com.hmkeyewear.dto.response.*;
import com.hmkeyewear.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<DashboardOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOverview()));
    }
    
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> test() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Dashboard API is working",
            "timestamp", java.time.Instant.now().toString()
        )));
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<ApiResponse<RevenueChartResponse>> getRevenueChart(@RequestParam(defaultValue = "7d") String period) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRevenueChart(period)));
    }
    
    @GetMapping("/debug/orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugOrders() {
        // Debug endpoint to check order data
        var orders = dashboardService.getClass();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "message", "Check server logs for order details"
        )));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<TopProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "7d") String period
    ) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTopProducts(limit, period)));
    }

    @GetMapping("/order-status-chart")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getOrderStatusChart() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOrderStatusChart()));
    }

    @GetMapping("/revenue-by-category")
    public ResponseEntity<ApiResponse<List<RevenueByCategoryResponse>>> getRevenueByCategory() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRevenueByCategory()));
    }

    @GetMapping("/low-stock-alerts")
    public ResponseEntity<ApiResponse<Page<LowStockAlertResponse>>> getLowStockAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getLowStockAlerts(PageRequest.of(page, size))));
    }
}
