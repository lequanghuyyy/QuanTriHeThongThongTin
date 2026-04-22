package com.hmkeyewear.service.impl;

import com.hmkeyewear.dto.response.*;
import com.hmkeyewear.entity.Order;
import com.hmkeyewear.entity.OrderItem;
import com.hmkeyewear.entity.ProductVariant;
import com.hmkeyewear.entity.User;
import com.hmkeyewear.enums.OrderStatus;
import com.hmkeyewear.enums.Role;
import com.hmkeyewear.repository.OrderItemRepository;
import com.hmkeyewear.repository.OrderRepository;
import com.hmkeyewear.repository.ProductVariantRepository;
import com.hmkeyewear.repository.UserRepository;
import com.hmkeyewear.service.interfaces.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public DashboardOverviewResponse getOverview() {
        Instant now = Instant.now();
        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant startOfYear = LocalDate.now().withDayOfYear(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<Order> allOrders = orderRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        DashboardOverviewResponse.TimeMetric todayMetrics = calculateMetrics(allOrders, allUsers, startOfDay, now);
        DashboardOverviewResponse.TimeMetric monthMetrics = calculateMetrics(allOrders, allUsers, startOfMonth, now);
        DashboardOverviewResponse.TimeMetric yearMetrics = calculateMetrics(allOrders, allUsers, startOfYear, now);
        yearMetrics.setNewCustomers(null); // per prompt

        int pendingOrders = (int) allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();

        // Calculate low stock products < 5
        long lowStockCount = productVariantRepository.findAll().stream()
                .filter(v -> v.getStockQuantity() < 5).count();

        return DashboardOverviewResponse.builder()
                .today(todayMetrics)
                .thisMonth(monthMetrics)
                .thisYear(yearMetrics)
                .pendingOrders(pendingOrders)
                .lowStockProducts((int) lowStockCount)
                .build();
    }

    private DashboardOverviewResponse.TimeMetric calculateMetrics(List<Order> orders, List<User> users, Instant start, Instant end) {
        List<Order> filteredOrders = orders.stream()
                .filter(o -> !o.getCreatedAt().isBefore(start) && !o.getCreatedAt().isAfter(end) && o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        BigDecimal revenue = filteredOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int newCustomers = (int) users.stream()
                .filter(u -> u.getRole() == Role.CUSTOMER && !u.getCreatedAt().isBefore(start) && !u.getCreatedAt().isAfter(end))
                .count();

        return DashboardOverviewResponse.TimeMetric.builder()
                .revenue(revenue)
                .orders(filteredOrders.size())
                .newCustomers(newCustomers)
                .build();
    }

    @Override
    public RevenueChartResponse getRevenueChart(String period) {
        int days = switch (period) {
            case "7d" -> 7;
            case "30d" -> 30;
            case "90d" -> 90;
            case "12m" -> 365;
            default -> 7;
        };

        Instant start = Instant.now().minus(days, ChronoUnit.DAYS);
        List<Order> recentOrders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(start) && o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        Map<String, BigDecimal> revenueByDay = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM").withZone(ZoneId.systemDefault());

        for (int i = days - 1; i >= 0; i--) {
            revenueByDay.put(formatter.format(Instant.now().minus(i, ChronoUnit.DAYS)), BigDecimal.ZERO);
        }

        for (Order order : recentOrders) {
            String day = formatter.format(order.getCreatedAt());
            if (revenueByDay.containsKey(day)) {
                revenueByDay.put(day, revenueByDay.get(day).add(order.getTotalAmount()));
            }
        }

        return RevenueChartResponse.builder()
                .labels(new ArrayList<>(revenueByDay.keySet()))
                .data(new ArrayList<>(revenueByDay.values()))
                .build();
    }

    @Override
    public List<TopProductResponse> getTopProducts(int limit, String period) {
        // Simplified query in Java to avoid complex JPQL setup speed up for hackathon.
        int days = switch (period) {
            case "7d" -> 7;
            case "30d" -> 30;
            default -> 7;
        };
        Instant start = Instant.now().minus(days, ChronoUnit.DAYS);

        List<OrderItem> items = orderItemRepository.findAll().stream()
                .filter(i -> i.getOrder().getCreatedAt().isAfter(start) && i.getOrder().getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        Map<Long, TopProductResponse> map = new HashMap<>();

        for (OrderItem item : items) {
            Long pId = item.getProductVariant().getProduct().getId();
            TopProductResponse t = map.getOrDefault(pId, TopProductResponse.builder()
                    .product(TopProductResponse.ProductBasicInfo.builder()
                            .id(pId)
                            .name(item.getProductVariant().getProduct().getName())
                            .thumbnailUrl(item.getProductVariant().getProduct().getThumbnailUrl())
                            .build())
                    .totalSold(0)
                    .totalRevenue(BigDecimal.ZERO)
                    .build());

            t.setTotalSold(t.getTotalSold() + item.getQuantity());
            t.setTotalRevenue(t.getTotalRevenue().add(item.getTotalPrice()));
            map.put(pId, t);
        }

        return map.values().stream()
                .sorted((a, b) -> Integer.compare(b.getTotalSold(), a.getTotalSold()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getOrderStatusChart() {
        return orderRepository.findAll().stream()
                .collect(Collectors.groupingBy(o -> o.getStatus().name(), Collectors.counting()));
    }

    @Override
    public List<RevenueByCategoryResponse> getRevenueByCategory() {
        List<Order> validOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        BigDecimal totalRevenueAll = validOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalRevenueAll.compareTo(BigDecimal.ZERO) == 0) return Collections.emptyList();

        Map<String, BigDecimal> revByCat = new HashMap<>();

        for (Order o : validOrders) {
            for (OrderItem item : o.getItems()) {
                String catName = item.getProductVariant().getProduct().getCategory().getName();
                revByCat.put(catName, revByCat.getOrDefault(catName, BigDecimal.ZERO).add(item.getTotalPrice()));
            }
        }

        return revByCat.entrySet().stream()
                .map(e -> RevenueByCategoryResponse.builder()
                        .category(RevenueByCategoryResponse.CategoryBasicInfo.builder().name(e.getKey()).build())
                        .revenue(e.getValue())
                        .percentage(e.getValue().doubleValue() / totalRevenueAll.doubleValue() * 100)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Page<LowStockAlertResponse> getLowStockAlerts(Pageable pageable) {
        // Wait, for pageable we can't easily filter memory list unless we implement PageImpl
        // Let's create a query in ProductVariantRepository or fetch all and make a PageImpl
        List<ProductVariant> lowStocks = productVariantRepository.findAll().stream()
                .filter(v -> v.getStockQuantity() < 5)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), lowStocks.size());
        List<ProductVariant> subList = lowStocks.subList(start, end);

        List<LowStockAlertResponse> responses = subList.stream().map(v -> LowStockAlertResponse.builder()
                .variantId(v.getId())
                .productName(v.getProduct().getName())
                .variantName(v.getColorName())
                .sku(v.getSku())
                .stockQuantity(v.getStockQuantity())
                .thumbnailUrl(v.getImageUrl() != null ? v.getImageUrl() : v.getProduct().getThumbnailUrl())
                .build()).collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(responses, pageable, lowStocks.size());
    }
}
