# Dashboard Fix Summary

## Vấn đề
Biểu đồ doanh thu trong Admin Dashboard không hiển thị dữ liệu mặc dù đã có đơn hàng trong database.

## Nguyên nhân
1. **Frontend mapping sai cấu trúc dữ liệu**: Frontend expect các field phẳng như `todayRevenue`, `todayOrders` nhưng backend trả về nested structure `today.revenue`, `today.orders`
2. **Backend logic tính toán ngày sai**: 
   - Dùng `Instant.now().minus(i, ChronoUnit.DAYS)` để tạo keys nhưng format khác với order dates
   - Dùng `isAfter()` thay vì `!isBefore()` làm mất đơn hàng ở biên
   - Không xử lý timezone đúng cách

## Các thay đổi đã thực hiện

### Backend Changes

#### 1. Tạo DTO mới: `RevenueDataPoint.java`
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueDataPoint {
    private String date;
    private BigDecimal revenue;
}
```

#### 2. Cập nhật `RevenueChartResponse.java`
```java
// Trước
private List<String> labels;
private List<BigDecimal> data;

// Sau
private List<RevenueDataPoint> data;
```

#### 3. Sửa logic `DashboardServiceImpl.getRevenueChart()`
**Vấn đề cũ:**
- Tạo date keys không nhất quán
- So sánh ngày không chính xác
- Không handle timezone đúng

**Giải pháp:**
```java
// Dùng LocalDate thay vì Instant để tính toán ngày
LocalDate today = LocalDate.now(ZoneId.systemDefault());
LocalDate startDate = today.minusDays(days - 1);
Instant start = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();

// Tạo map với LinkedHashMap để giữ thứ tự
Map<String, BigDecimal> revenueByDay = new LinkedHashMap<>();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

// Tạo keys theo thứ tự từ startDate
for (int i = 0; i < days; i++) {
    LocalDate date = startDate.plusDays(i);
    revenueByDay.put(date.format(formatter), BigDecimal.ZERO);
}

// Convert order date sang LocalDate trước khi format
for (Order order : recentOrders) {
    LocalDate orderDate = order.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
    String dayKey = orderDate.format(formatter);
    // ... add revenue
}
```

#### 4. Thêm logging để debug
```java
@Slf4j
public class DashboardServiceImpl {
    // Log số lượng orders, filtered orders, và revenue details
}
```

### Frontend Changes

#### 1. Cập nhật `Dashboard.tsx` - Data mapping
```typescript
// Trước
const overview = overviewData?.data || { 
  todayRevenue: 0, 
  todayOrders: 0, 
  newCustomers: 0, 
  pendingOrders: 0 
};

// Sau
const overview = overviewData?.data || { 
  today: { revenue: 0, orders: 0, newCustomers: 0 },
  thisMonth: { revenue: 0, orders: 0, newCustomers: 0 },
  thisYear: { revenue: 0, orders: 0, newCustomers: null },
  pendingOrders: 0,
  lowStockProducts: 0
};
```

#### 2. Cập nhật revenue chart data
```typescript
// Trước
const revenueChart = revenueData?.data?.labels?.map((label, index) => ({
  date: label,
  revenue: revenueData.data.data[index] || 0
})) || [];

// Sau
const revenueChart = revenueData?.data?.data || [];
```

#### 3. Cập nhật stats cards
```typescript
// Doanh thu hôm nay
{formatVND(overview.today.revenue)}

// Đơn hàng hôm nay
{overview.today.orders}

// Khách mới
{overview.today.newCustomers || 0}

// Chờ xử lý
{overview.pendingOrders}
```

## Cách test

### 1. Kiểm tra backend logs
Khi gọi API `/api/v1/admin/dashboard/revenue-chart?period=7d`, check logs:
```
Getting revenue chart for period: 7d, days: 7, start: 2026-04-26T17:00:00Z
Total orders in database: X
Filtered orders for chart: Y
Including order: ORD-XXX created at: ..., status: ..., amount: ...
Added revenue for 27/04: 500000 (total now: 500000)
Generated 7 data points for revenue chart
```

### 2. Test API trực tiếp
```bash
# Get overview
curl http://localhost:8080/api/v1/admin/dashboard/overview

# Get revenue chart
curl http://localhost:8080/api/v1/admin/dashboard/revenue-chart?period=7d
curl http://localhost:8080/api/v1/admin/dashboard/revenue-chart?period=30d
```

### 3. Kiểm tra response format
**Overview response:**
```json
{
  "data": {
    "today": {
      "revenue": 1500000,
      "orders": 3,
      "newCustomers": 2
    },
    "thisMonth": {
      "revenue": 5000000,
      "orders": 10,
      "newCustomers": 5
    },
    "thisYear": {
      "revenue": 20000000,
      "orders": 50,
      "newCustomers": null
    },
    "pendingOrders": 2,
    "lowStockProducts": 5
  }
}
```

**Revenue chart response:**
```json
{
  "data": {
    "data": [
      { "date": "27/04", "revenue": 500000 },
      { "date": "28/04", "revenue": 0 },
      { "date": "29/04", "revenue": 1200000 },
      { "date": "30/04", "revenue": 0 },
      { "date": "01/05", "revenue": 800000 },
      { "date": "02/05", "revenue": 0 },
      { "date": "03/05", "revenue": 0 }
    ]
  }
}
```

## Troubleshooting

### Vấn đề: Biểu đồ vẫn trống
**Kiểm tra:**
1. Có đơn hàng trong database không? Status khác CANCELLED?
2. Đơn hàng có `created_at` không null?
3. Đơn hàng nằm trong khoảng thời gian đang xem?
4. Check backend logs để xem số orders được filter

### Vấn đề: Số liệu không khớp
**Kiểm tra:**
1. Timezone của server và database
2. Format ngày tháng (dd/MM)
3. Logic filter orders (status != CANCELLED)

### Vấn đề: Frontend không hiển thị
**Kiểm tra:**
1. Browser console có lỗi?
2. Network tab - API response có đúng format?
3. React Query cache - thử clear cache hoặc hard refresh

## Files đã thay đổi

### Backend
- `backend/src/main/java/com/hmkeyewear/dto/response/RevenueDataPoint.java` (NEW)
- `backend/src/main/java/com/hmkeyewear/dto/response/RevenueChartResponse.java`
- `backend/src/main/java/com/hmkeyewear/service/impl/DashboardServiceImpl.java`
- `backend/src/main/java/com/hmkeyewear/controller/AdminDashboardController.java`

### Frontend
- `frontend/src/pages/Admin/Dashboard.tsx`

## Next Steps
1. Restart backend server để apply changes
2. Clear browser cache và refresh frontend
3. Check logs khi load dashboard
4. Verify data hiển thị đúng
