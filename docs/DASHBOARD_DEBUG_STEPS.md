# Dashboard Debug Steps

## Bước 1: Kiểm tra Backend đang chạy
1. Mở terminal và chạy backend:
```bash
cd backend
./mvnw spring-boot:run
```

2. Kiểm tra backend logs khi khởi động
3. Đảm bảo không có lỗi compile

## Bước 2: Test API trực tiếp

### Test Overview API
```bash
curl -X GET "http://localhost:8080/api/v1/admin/dashboard/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Revenue Chart API
```bash
curl -X GET "http://localhost:8080/api/v1/admin/dashboard/revenue-chart?period=7d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Bước 3: Kiểm tra Frontend Console

1. Mở Chrome DevTools (F12)
2. Vào tab Console
3. Tìm các lỗi màu đỏ
4. Kiểm tra các warning

## Bước 4: Kiểm tra Network Tab

1. Mở Chrome DevTools > Network tab
2. Refresh trang Dashboard
3. Tìm các request:
   - `/admin/dashboard/overview`
   - `/admin/dashboard/revenue-chart`
   - `/admin/dashboard/order-status-chart`
   - `/admin/dashboard/top-products`
   - `/admin/dashboard/low-stock-alerts`

4. Click vào từng request và kiểm tra:
   - Status code (phải là 200)
   - Response data
   - Headers

## Bước 5: Kiểm tra dữ liệu trong Database

Chạy SQL queries để kiểm tra:

```sql
-- Kiểm tra số lượng orders
SELECT COUNT(*) FROM orders;

-- Kiểm tra orders gần đây
SELECT id, order_code, status, total_amount, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Kiểm tra orders trong 7 ngày qua
SELECT DATE(created_at) as order_date, 
       COUNT(*) as order_count,
       SUM(total_amount) as total_revenue
FROM orders
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND status != 'CANCELLED'
GROUP BY DATE(created_at)
ORDER BY order_date;
```

## Những gì cần kiểm tra

### Console Errors
- [ ] Có lỗi CORS?
- [ ] Có lỗi 401 Unauthorized?
- [ ] Có lỗi 404 Not Found?
- [ ] Có lỗi JavaScript?

### Network Requests
- [ ] Request có được gửi đi?
- [ ] Status code là gì?
- [ ] Response data có đúng format?
- [ ] Headers có Authorization token?

### Data Issues
- [ ] Database có orders không?
- [ ] Orders có created_at không null?
- [ ] Orders có status khác CANCELLED?
- [ ] Orders nằm trong khoảng thời gian đang xem?

## Gửi thông tin debug

Nếu vẫn không hoạt động, hãy cung cấp:
1. Screenshot console errors
2. Screenshot network tab với response data
3. Backend logs khi gọi API
4. Kết quả SQL queries
