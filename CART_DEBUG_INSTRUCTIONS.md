# Hướng dẫn Debug Giỏ Hàng

## Vấn đề
Sản phẩm trong giỏ hàng hiển thị "Hết hàng" mặc dù trong DB vẫn còn stock.

## Backend Log cho thấy
```
[Cart Debug] - Stock Quantity: 10
[Cart Debug] - isAvailable: true
```
Backend đang trả về đúng dữ liệu!

## Các bước kiểm tra

### 1. Kiểm tra Network Tab
- Mở DevTools (F12)
- Vào tab Network
- Reload trang giỏ hàng
- Tìm request `/api/v1/cart`
- Click vào request đó
- Xem tab "Response"
- Kiểm tra xem response có chứa `isAvailable: true` và `stockQuantity: 10` không

### 2. Kiểm tra Console Log đầy đủ
- Trong Console, tìm log `[MainLayout] Cart data loaded:`
- Click vào object để expand
- Click vào `items` array
- Click vào item đầu tiên (index 0)
- Kiểm tra xem có field `isAvailable` và `stockQuantity` không

### 3. Clear Cache và Reload
```bash
# Trong browser:
- Ctrl + Shift + Delete (mở Clear browsing data)
- Chọn "Cached images and files"
- Click Clear data
- Hoặc đơn giản: Ctrl + F5 (hard reload)
```

### 4. Kiểm tra code frontend
File: `frontend/src/pages/Cart/index.tsx` dòng 78-80

Logic hiển thị "Hết hàng":
```tsx
{(!item.isAvailable || item.stockQuantity === 0) && (
   <span>Hết hàng</span>
)}
```

Nếu `item.isAvailable` là `undefined` hoặc `false`, hoặc `item.stockQuantity` là `0` hoặc `undefined`, sẽ hiển thị "Hết hàng".

## Đã thêm logging
Tôi đã thêm logging chi tiết trong:
- `frontend/src/layouts/MainLayout.tsx` - Log cart data
- `frontend/src/pages/Cart/index.tsx` - Log từng item

Hãy reload frontend và xem console log mới.

## Nếu vẫn lỗi
Có thể do:
1. Frontend đang dùng cached data cũ
2. Response từ backend bị transform sai ở axios interceptor
3. Type mismatch giữa backend và frontend

Hãy kiểm tra Network tab để xem response thực tế từ backend.
