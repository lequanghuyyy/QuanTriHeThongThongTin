# Guest Cart Implementation Guide

## Tổng quan
Hệ thống giỏ hàng hỗ trợ cả người dùng đã đăng nhập và khách (guest). Khi khách thêm sản phẩm vào giỏ, dữ liệu được lưu với `session_id`. Khi đăng nhập, giỏ hàng guest sẽ tự động merge với giỏ hàng của user.

## Backend Changes

### 1. Database Schema
**CartItem Entity** đã được cập nhật:
- Thêm field `sessionId` (nullable) để track guest cart
- Thêm index `idx_session_id` để tối ưu query
- `user_id` giờ là nullable để hỗ trợ guest cart

```sql
ALTER TABLE cart_items 
ADD COLUMN session_id VARCHAR(255) NULL AFTER user_id;

CREATE INDEX idx_session_id ON cart_items(session_id);

ALTER TABLE cart_items 
MODIFY COLUMN user_id VARCHAR(255) NULL;
```

### 2. CartService Interface
Tất cả methods giờ nhận cả `userEmail` và `sessionId`:
```java
CartResponse getCart(String userEmail, String sessionId);
CartResponse addToCart(String userEmail, String sessionId, AddToCartRequest request);
void mergeGuestCartToUser(String sessionId, String userEmail);
```

### 3. CartController
- Tất cả endpoints nhận `X-Session-Id` header (optional)
- Endpoint mới: `POST /api/v1/cart/merge` để merge cart thủ công
- Không cần authentication cho cart operations

### 4. AuthController
- Login endpoint tự động merge guest cart khi nhận `X-Session-Id` header

### 5. SecurityConfig
- `/api/v1/cart/**` được thêm vào `permitAll()` để cho phép guest access

## Frontend Changes

### 1. Session Manager Utility
File: `frontend/src/utils/sessionManager.ts`

```typescript
getOrCreateSessionId(): string  // Tạo hoặc lấy session ID từ localStorage
clearSessionId(): void          // Xóa session ID sau khi đăng nhập
getSessionId(): string | null   // Lấy session ID hiện tại
```

### 2. Axios Interceptor
`axiosInstance` tự động thêm `X-Session-Id` header vào mọi request.

### 3. Auth API
`authApi.login()` tự động clear session ID sau khi đăng nhập thành công.

## Workflow

### Guest User Flow
1. User chưa đăng nhập truy cập trang
2. Frontend tự động tạo `session_id` (UUID) và lưu vào localStorage
3. Mọi cart operation gửi `X-Session-Id` header
4. Backend lưu cart items với `session_id`, `user_id = null`

### Login & Merge Flow
1. User đăng nhập
2. Frontend gửi `X-Session-Id` trong login request
3. Backend merge guest cart vào user cart:
   - Nếu cùng variant: cộng dồn quantity (tối đa = stock)
   - Nếu variant mới: chuyển ownership sang user
4. Backend xóa guest cart items
5. Frontend clear `session_id` từ localStorage
6. User thấy giỏ hàng đầy đủ (guest + user items)

## API Examples

### Get Cart (Guest)
```http
GET /api/v1/cart
X-Session-Id: 550e8400-e29b-41d4-a716-446655440000
```

### Add to Cart (Guest)
```http
POST /api/v1/cart/items
X-Session-Id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "productVariantId": 123,
  "quantity": 2
}
```

### Login with Cart Merge
```http
POST /api/v1/auth/login
X-Session-Id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Manual Cart Merge (if needed)
```http
POST /api/v1/cart/merge
X-Session-Id: 550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
```

## Testing Checklist

- [ ] Guest có thể xem giỏ hàng rỗng
- [ ] Guest có thể thêm sản phẩm vào giỏ
- [ ] Guest có thể cập nhật số lượng
- [ ] Guest có thể xóa item khỏi giỏ
- [ ] Refresh page, giỏ hàng guest vẫn còn (localStorage)
- [ ] Đăng nhập thành công merge cart
- [ ] Sau khi đăng nhập, giỏ hàng hiển thị đầy đủ items
- [ ] Duplicate variants được merge (cộng quantity)
- [ ] Session ID bị clear sau khi đăng nhập
- [ ] User đã đăng nhập không tạo session ID mới

## Notes

- Session ID được generate bằng `crypto.randomUUID()` (UUID v4)
- Guest cart items không có expiration (có thể thêm cleanup job sau)
- Merge logic ưu tiên giữ items, chỉ giới hạn bởi stock quantity
- Nếu merge fail, login vẫn thành công (error được log)
