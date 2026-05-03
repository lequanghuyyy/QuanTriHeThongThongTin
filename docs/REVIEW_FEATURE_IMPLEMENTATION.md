# Tính năng Đánh giá Sản phẩm - HMK Eyewear

## 📋 Tổng quan

Tính năng đánh giá sản phẩm cho phép khách hàng đánh giá các sản phẩm đã mua và xem đánh giá của người khác.

## 🎯 Các chức năng chính

### 1. **Khách hàng (Customer)**

#### 1.1. Xem đánh giá sản phẩm
- **Vị trí**: Trang chi tiết sản phẩm (`/san-pham/{slug}`)
- **Tính năng**:
  - Hiển thị điểm đánh giá trung bình và tổng số đánh giá
  - Phân bố đánh giá theo số sao (1-5 sao)
  - Lọc đánh giá theo số sao
  - Phân trang danh sách đánh giá
  - Hiển thị badge "Đã mua hàng" cho đánh giá verified

#### 1.2. Tạo đánh giá sản phẩm
- **Vị trí**: Trang chi tiết đơn hàng (`/tai-khoan/don-hang/{orderCode}`)
- **Điều kiện**:
  - Đơn hàng phải có trạng thái `DELIVERED` (Đã giao)
  - Chỉ đánh giá được 1 lần cho mỗi sản phẩm
  - Phải đăng nhập
- **Quy trình**:
  1. Vào chi tiết đơn hàng đã giao
  2. Click nút "Đánh giá sản phẩm" bên cạnh sản phẩm
  3. Điền form đánh giá:
     - Chọn số sao (1-5)
     - Nhập tiêu đề (tối đa 100 ký tự)
     - Nhập nội dung (tối đa 1000 ký tự)
  4. Gửi đánh giá
  5. Đánh giá sẽ ở trạng thái "Chờ duyệt"

#### 1.3. Xem đánh giá của tôi
- **Vị trí**: Trang đánh giá (`/tai-khoan/danh-gia`)
- **Tính năng**:
  - Hiển thị tất cả đánh giá đã tạo
  - Hiển thị trạng thái: "Đã duyệt" hoặc "Chờ duyệt"
  - Link đến sản phẩm đã đánh giá

### 2. **Admin**

#### 2.1. Quản lý đánh giá
- **Vị trí**: Admin panel (cần triển khai)
- **Tính năng**:
  - Xem tất cả đánh giá
  - Lọc theo trạng thái (Đã duyệt/Chờ duyệt)
  - Lọc theo sản phẩm
  - Duyệt đánh giá
  - Xóa đánh giá

## 🔧 Cấu trúc kỹ thuật

### Backend (Spring Boot)

#### Entities
```java
Review {
  - id: Long
  - product: Product (ManyToOne)
  - user: User (ManyToOne)
  - orderItem: OrderItem (OneToOne)
  - rating: int (1-5)
  - title: String
  - content: String (TEXT)
  - isVerifiedPurchase: boolean
  - isApproved: boolean
  - createdAt: Instant
  - updatedAt: Instant
}
```

#### API Endpoints

**Customer APIs:**
```
POST   /api/v1/reviews
       - Tạo đánh giá mới
       - Body: CreateReviewRequest
       - Auth: Required

GET    /api/v1/reviews/my-reviews
       - Lấy danh sách đánh giá của user hiện tại
       - Auth: Required

GET    /api/v1/orders/{orderCode}/reviewable-items
       - Lấy danh sách sản phẩm có thể đánh giá trong đơn hàng
       - Auth: Required

GET    /api/v1/products/{slug}/reviews
       - Lấy đánh giá của sản phẩm (public)
       - Query params: page, size, rating (filter)
       - Auth: Not required
```

**Admin APIs:**
```
GET    /api/v1/admin/reviews
       - Lấy tất cả đánh giá
       - Query params: isApproved, productId, page, size

PUT    /api/v1/admin/reviews/{id}/approve
       - Duyệt đánh giá

DELETE /api/v1/admin/reviews/{id}
       - Xóa đánh giá
```

#### DTOs

**CreateReviewRequest:**
```java
{
  orderItemId: Long (required)
  rating: int (1-5, required)
  title: String (required)
  content: String (required)
}
```

**ReviewResponse:**
```java
{
  id: Long
  userName: String
  userAvatar: String
  rating: int
  title: String
  content: String
  isVerifiedPurchase: boolean
  createdAt: Instant
  variantName: String
  // For my-reviews only:
  productId: Long
  productName: String
  productSlug: String
  productThumbnail: String
  isApproved: boolean
}
```

**ReviewableItemResponse:**
```java
{
  orderItemId: Long
  productName: String
  productSlug: String
  variantName: String
  imageUrl: String
  alreadyReviewed: boolean
}
```

**ReviewPageResponse:**
```java
{
  reviews: Page<ReviewResponse>
  summary: {
    avgRating: double
    totalCount: int
    ratingDistribution: Map<Integer, Integer>
  }
}
```

### Frontend (React + TypeScript)

#### Components

**ReviewModal** (`frontend/src/components/customer/ReviewModal.tsx`)
- Modal form để tạo đánh giá
- Props: `item: ReviewableItem`, `onClose: () => void`
- Features:
  - Chọn rating với hover effect
  - Validation form
  - Character counter
  - Loading state

#### Pages

**Reviews** (`frontend/src/pages/CustomerDashboard/Reviews.tsx`)
- Hiển thị danh sách đánh giá của user
- Badge trạng thái (Đã duyệt/Chờ duyệt)
- Link đến sản phẩm

**OrderDetail** (`frontend/src/pages/CustomerDashboard/OrderDetail.tsx`)
- Hiển thị nút "Đánh giá sản phẩm" cho đơn hàng đã giao
- Mở ReviewModal khi click
- Hiển thị "Đã đánh giá" nếu đã review

**ProductDetail** (`frontend/src/pages/ProductDetail/index.tsx`)
- Tab "Đánh giá" hiển thị:
  - Điểm trung bình và phân bố rating
  - Danh sách đánh giá với phân trang
  - Lọc theo số sao

#### API Client

**reviewApi** (`frontend/src/api/reviewApi.ts`)
```typescript
{
  createReview(data: CreateReviewRequest): Promise<ReviewResponse>
  getMyReviews(): Promise<ReviewResponse[]>
  getReviewableItems(orderCode: string): Promise<ReviewableItem[]>
}
```

## 🔐 Business Rules

### 1. Điều kiện tạo đánh giá
- ✅ User phải đăng nhập
- ✅ Đơn hàng phải có trạng thái `DELIVERED`
- ✅ Mỗi OrderItem chỉ được đánh giá 1 lần
- ✅ OrderItem phải thuộc về user hiện tại

### 2. Quy trình duyệt đánh giá
- Đánh giá mới tạo có `isApproved = false`
- Admin phải duyệt đánh giá trước khi hiển thị công khai
- Khi duyệt/xóa đánh giá → Tự động cập nhật `averageRating` và `reviewCount` của Product

### 3. Verified Purchase
- Đánh giá từ OrderItem có `isVerifiedPurchase = true`
- Hiển thị badge "Đã mua hàng" để tăng độ tin cậy

### 4. Hiển thị đánh giá
- Chỉ hiển thị đánh giá đã duyệt (`isApproved = true`) trên trang sản phẩm
- User có thể xem tất cả đánh giá của mình (kể cả chưa duyệt)

## 📊 Database Schema

```sql
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    order_item_id BIGINT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    UNIQUE KEY unique_user_order_item (user_id, order_item_id)
);

CREATE INDEX idx_reviews_product_approved ON reviews(product_id, is_approved);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

## 🎨 UI/UX Features

### 1. Rating Stars
- Interactive hover effect
- Fill animation
- Color: Yellow (#FACC15)

### 2. Status Badges
- **Đã duyệt**: Green badge with CheckCircle icon
- **Chờ duyệt**: Orange badge with Clock icon
- **Đã mua hàng**: Green badge with CheckCircle icon

### 3. Form Validation
- Required fields: rating, title, content
- Character limits: title (100), content (1000)
- Real-time character counter

### 4. Loading States
- Skeleton loading for reviews list
- Button loading state when submitting
- Disabled state for already reviewed items

## 🚀 Testing Checklist

### Customer Flow
- [ ] Đăng nhập và tạo đơn hàng
- [ ] Admin đổi trạng thái đơn hàng thành DELIVERED
- [ ] Vào chi tiết đơn hàng, click "Đánh giá sản phẩm"
- [ ] Điền form và gửi đánh giá
- [ ] Kiểm tra đánh giá xuất hiện trong "Đánh giá của tôi" với trạng thái "Chờ duyệt"
- [ ] Không thể đánh giá lại sản phẩm đã đánh giá
- [ ] Đánh giá chưa hiển thị trên trang sản phẩm (chưa duyệt)

### Admin Flow
- [ ] Admin vào quản lý đánh giá
- [ ] Lọc đánh giá chờ duyệt
- [ ] Duyệt đánh giá
- [ ] Kiểm tra đánh giá hiển thị trên trang sản phẩm
- [ ] Kiểm tra averageRating và reviewCount của sản phẩm được cập nhật
- [ ] Xóa đánh giá và kiểm tra rating được tính lại

### Product Page
- [ ] Xem tab đánh giá
- [ ] Kiểm tra điểm trung bình và phân bố rating
- [ ] Lọc theo số sao
- [ ] Phân trang hoạt động đúng
- [ ] Badge "Đã mua hàng" hiển thị cho verified reviews

## 📝 Notes

### Cải tiến trong tương lai
1. **Upload ảnh đánh giá**: Cho phép user upload ảnh sản phẩm
2. **Reply đánh giá**: Admin/Shop có thể reply đánh giá
3. **Helpful votes**: User có thể vote đánh giá hữu ích
4. **Sort options**: Sắp xếp theo mới nhất, hữu ích nhất, rating cao/thấp
5. **Email notification**: Thông báo khi đánh giá được duyệt
6. **Review reminder**: Email nhắc nhở đánh giá sau X ngày nhận hàng

### Performance Optimization
- Cache rating distribution
- Index optimization cho queries
- Lazy load reviews khi scroll
- Debounce filter changes

## 🐛 Known Issues

Không có issue nào được phát hiện tại thời điểm triển khai.

## 📚 Related Documentation

- [DATABASE_SCHEMA_EXPLAINED.md](./DATABASE_SCHEMA_EXPLAINED.md) - Chi tiết về Review entity
- Backend API: `ReviewController.java`, `ReviewService.java`
- Frontend Components: `ReviewModal.tsx`, `Reviews.tsx`, `OrderDetail.tsx`
