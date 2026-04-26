# HMK Eyewear - Giải thích Database Schema & Entity Relationships

## 📋 Tổng quan

Dự án HMK Eyewear có **14 entities** chính, được chia thành 5 nhóm chức năng:

1. **User & Authentication** (2 entities)
2. **Product Catalog** (6 entities)
3. **Shopping & Orders** (3 entities)
4. **Marketing** (2 entities)
5. **Store Management** (1 entity)

---

## 👤 1. USER & AUTHENTICATION

### User (Người dùng)
**Bảng:** `users`

**Mục đích:** Lưu thông tin tài khoản người dùng

**Các trường quan trọng:**
- `id` (UUID): ID duy nhất
- `email`: Email đăng nhập (unique)
- `password`: Mật khẩu (nullable - vì có thể đăng nhập bằng Google/Facebook)
- `role`: Vai trò (USER, ADMIN)
- `provider`: Phương thức đăng nhập (LOCAL, GOOGLE, FACEBOOK)
- `isActive`: Tài khoản có hoạt động không

**Quan hệ:**
- `1 User` → `N Address` (Một user có nhiều địa chỉ)
- `1 User` → `N CartItem` (Một user có nhiều sản phẩm trong giỏ)
- `1 User` → `N Order` (Một user có nhiều đơn hàng)
- `1 User` → `N Review` (Một user có nhiều đánh giá)

---

### Address (Địa chỉ)
**Bảng:** `addresses`

**Mục đích:** Lưu địa chỉ giao hàng của user

**Các trường quan trọng:**
- `recipientName`: Tên người nhận
- `phone`: Số điện thoại
- `province`, `district`, `ward`: Địa chỉ hành chính
- `addressDetail`: Địa chỉ chi tiết (số nhà, đường...)
- `isDefault`: Địa chỉ mặc định hay không

**Quan hệ:**
- `N Address` → `1 User` (Nhiều địa chỉ thuộc về 1 user)

---

## 🛍️ 2. PRODUCT CATALOG (Danh mục sản phẩm)

### Product (Sản phẩm)
**Bảng:** `products`

**Mục đích:** Sản phẩm chính (kính mắt, gọng kính, tròng kính)

**Các trường quan trọng:**
- `sku`: Mã sản phẩm (unique)
- `name`: Tên sản phẩm
- `slug`: URL-friendly name
- `productType`: Loại sản phẩm (EYEGLASSES, SUNGLASSES, CONTACT_LENS)
- `basePrice`, `salePrice`: Giá gốc và giá bán
- `gender`: Giới tính (MALE, FEMALE, UNISEX)
- `isFeatured`: Sản phẩm nổi bật
- `isBestSeller`: Sản phẩm bán chạy
- `averageRating`, `reviewCount`: Đánh giá trung bình và số lượng đánh giá
- `totalSold`: Tổng số lượng đã bán

**Thông tin đặc thù kính:**
- `lensIndex`, `lensCoating`: Thông tin tròng kính
- `material`, `frameShape`: Thông tin gọng kính

**Quan hệ:**
- `N Product` → `1 Category` (Nhiều sản phẩm thuộc 1 danh mục)
- `N Product` → `1 Collection` (Nhiều sản phẩm thuộc 1 bộ sưu tập)
- `1 Product` → `N ProductImage` (1 sản phẩm có nhiều ảnh)
- `1 Product` → `N ProductVariant` (1 sản phẩm có nhiều biến thể)
- `1 Product` → `N Review` (1 sản phẩm có nhiều đánh giá)

---

### Category (Danh mục)
**Bảng:** `categories`

**Mục đích:** Phân loại sản phẩm theo cấp bậc (tree structure)

**Các trường quan trọng:**
- `name`: Tên danh mục
- `slug`: URL-friendly name
- `level`: Cấp độ (0 = root, 1 = con, 2 = cháu...)
- `sortOrder`: Thứ tự hiển thị

**Quan hệ đặc biệt - SELF-REFERENCING:**
- `N Category` → `1 Category (parent)` (Nhiều danh mục con thuộc 1 danh mục cha)
- `1 Category (parent)` → `N Category (children)` (1 danh mục cha có nhiều danh mục con)

**Ví dụ cấu trúc:**
```
Kính mắt (level 0)
├── Gọng kính (level 1)
│   ├── Gọng kim loại (level 2)
│   └── Gọng nhựa (level 2)
└── Kính râm (level 1)
    ├── Kính râm nam (level 2)
    └── Kính râm nữ (level 2)
```

---

### Collection (Bộ sưu tập)
**Bảng:** `collections`

**Mục đích:** Nhóm sản phẩm theo chủ đề/mùa/sự kiện

**Các trường quan trọng:**
- `name`: Tên bộ sưu tập (VD: "Summer 2024", "Classic Collection")
- `season`: Mùa (Spring, Summer, Fall, Winter)
- `startDate`, `endDate`: Thời gian hiệu lực

**Quan hệ:**
- `1 Collection` → `N Product` (1 bộ sưu tập có nhiều sản phẩm)

**Khác biệt Category vs Collection:**
- **Category**: Phân loại cố định theo tính năng (Gọng kính, Kính râm...)
- **Collection**: Nhóm tạm thời theo chủ đề marketing (Bộ sưu tập mùa hè...)

---

### ProductImage (Ảnh sản phẩm)
**Bảng:** `product_images`

**Mục đích:** Lưu nhiều ảnh cho 1 sản phẩm

**Các trường quan trọng:**
- `imageUrl`: Link ảnh
- `isPrimary`: Ảnh chính (hiển thị đầu tiên)
- `sortOrder`: Thứ tự hiển thị
- `altText`: Text mô tả cho SEO

**Quan hệ:**
- `N ProductImage` → `1 Product` (Nhiều ảnh thuộc 1 sản phẩm)
- **CASCADE & ORPHAN REMOVAL**: Khi xóa Product → tự động xóa tất cả ảnh

---

### ProductVariant (Biến thể sản phẩm)
**Bảng:** `product_variants`

**Mục đích:** Lưu các phiên bản khác nhau của 1 sản phẩm (màu sắc, kích thước)

**Các trường quan trọng:**
- `sku`: Mã biến thể (unique) - VD: "GONG-001-BLACK-M"
- `colorName`, `colorHex`: Tên và mã màu
- `size`: Kích thước (S, M, L hoặc 52-18-140)
- `stockQuantity`: Số lượng tồn kho
- `additionalPrice`: Giá thêm so với basePrice

**Quan hệ:**
- `N ProductVariant` → `1 Product` (Nhiều biến thể thuộc 1 sản phẩm)
- **CASCADE & ORPHAN REMOVAL**: Khi xóa Product → tự động xóa tất cả variants

**Ví dụ:**
```
Product: Gọng kính Aviator (basePrice: 500,000đ)
├── Variant 1: Màu đen, size M, stock: 10, additionalPrice: 0
├── Variant 2: Màu vàng, size M, stock: 5, additionalPrice: 50,000đ
└── Variant 3: Màu bạc, size L, stock: 3, additionalPrice: 100,000đ
```

---

## 🛒 3. SHOPPING & ORDERS (Mua hàng & Đơn hàng)

### CartItem (Giỏ hàng)
**Bảng:** `cart_items`

**Mục đích:** Lưu sản phẩm user thêm vào giỏ hàng

**Các trường quan trọng:**
- `quantity`: Số lượng
- `addedAt`: Thời gian thêm vào giỏ

**Quan hệ:**
- `N CartItem` → `1 User` (Nhiều items trong giỏ của 1 user)
- `N CartItem` → `1 ProductVariant` (Mỗi item trỏ đến 1 variant cụ thể)

**Lưu ý:** 
- Không lưu giá trong CartItem vì giá có thể thay đổi
- Tính giá real-time khi hiển thị giỏ hàng

---

### Order (Đơn hàng)
**Bảng:** `orders`

**Mục đích:** Lưu thông tin đơn hàng sau khi checkout

**Các trường quan trọng:**
- `orderCode`: Mã đơn hàng (unique) - VD: "ORD-20240426-001"
- `status`: Trạng thái (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED)
- `paymentMethod`: Phương thức thanh toán (COD, BANK_TRANSFER, VNPAY)
- `paymentStatus`: Trạng thái thanh toán (PENDING, PAID, FAILED)
- `subtotal`: Tổng tiền hàng
- `shippingFee`: Phí ship
- `discount`: Giảm giá
- `totalAmount`: Tổng cộng
- `shippingAddress`: Địa chỉ giao hàng (JSON)
- `confirmedAt`, `shippedAt`, `deliveredAt`: Thời gian các trạng thái

**Quan hệ:**
- `N Order` → `1 User` (Nhiều đơn hàng của 1 user, nullable cho guest)
- `1 Order` → `N OrderItem` (1 đơn hàng có nhiều sản phẩm)

**Guest Order:**
- Nếu `user_id = null` → Đơn hàng của khách (không đăng nhập)
- Dùng `guestEmail` và `guestPhone` để liên hệ

---

### OrderItem (Chi tiết đơn hàng)
**Bảng:** `order_items`

**Mục đích:** Lưu từng sản phẩm trong đơn hàng

**Các trường quan trọng:**
- `productName`, `variantName`: Lưu tên để tránh mất dữ liệu khi product bị xóa
- `quantity`: Số lượng
- `unitPrice`: Giá tại thời điểm mua (snapshot)
- `totalPrice`: Tổng tiền = unitPrice × quantity

**Quan hệ:**
- `N OrderItem` → `1 Order` (Nhiều items thuộc 1 đơn hàng)
- `N OrderItem` → `1 ProductVariant` (Mỗi item trỏ đến 1 variant)

**Tại sao lưu productName và unitPrice?**
- Nếu sau này product bị xóa hoặc đổi giá → đơn hàng cũ vẫn giữ nguyên thông tin
- Đây là "snapshot" tại thời điểm mua

---

## ⭐ 4. MARKETING

### Review (Đánh giá)
**Bảng:** `reviews`

**Mục đích:** Khách hàng đánh giá sản phẩm

**Các trường quan trọng:**
- `rating`: Số sao (1-5)
- `title`: Tiêu đề đánh giá
- `content`: Nội dung chi tiết
- `isVerifiedPurchase`: Đã mua hàng chưa (dựa vào orderItem)
- `isApproved`: Admin đã duyệt chưa

**Quan hệ:**
- `N Review` → `1 Product` (Nhiều đánh giá cho 1 sản phẩm)
- `N Review` → `1 User` (Nhiều đánh giá của 1 user)
- `1 Review` → `1 OrderItem` (1 đánh giá liên kết với 1 order item để verify)

**Flow đánh giá:**
1. User mua hàng → tạo Order → có OrderItem
2. Sau khi nhận hàng → User viết review
3. Review liên kết với OrderItem → `isVerifiedPurchase = true`
4. Admin duyệt → `isApproved = true` → hiển thị công khai

---

### Coupon (Mã giảm giá)
**Bảng:** `coupons`

**Mục đích:** Tạo mã khuyến mãi

**Các trường quan trọng:**
- `code`: Mã coupon (unique) - VD: "SUMMER2024"
- `discountType`: Loại giảm giá (PERCENTAGE, FIXED_AMOUNT)
- `discountValue`: Giá trị giảm (20% hoặc 50,000đ)
- `minOrderValue`: Đơn hàng tối thiểu
- `maxDiscountAmount`: Giảm tối đa (cho PERCENTAGE)
- `usageLimit`: Giới hạn số lần dùng
- `usedCount`: Đã dùng bao nhiêu lần
- `startDate`, `endDate`: Thời gian hiệu lực

**Ví dụ:**
```
Code: SUMMER2024
Type: PERCENTAGE
Value: 20%
Min Order: 500,000đ
Max Discount: 100,000đ
→ Đơn 1,000,000đ → Giảm 200,000đ → Nhưng chỉ giảm tối đa 100,000đ
```

---

## 🏪 5. STORE MANAGEMENT

### Store (Cửa hàng)
**Bảng:** `stores`

**Mục đích:** Lưu thông tin các cửa hàng vật lý

**Các trường quan trọng:**
- `name`: Tên cửa hàng
- `address`, `province`, `district`: Địa chỉ
- `lat`, `lng`: Tọa độ GPS (để hiển thị bản đồ)
- `openTime`, `closeTime`: Giờ mở/đóng cửa
- `phone`: Số điện thoại liên hệ

**Mục đích sử dụng:**
- Hiển thị "Hệ thống cửa hàng" trên website
- Tích hợp Google Maps
- Khách hàng tìm cửa hàng gần nhất

---

## 🔗 TỔNG HỢP MỐI QUAN HỆ

### Sơ đồ quan hệ chính:

```
USER (1) ──────< (N) ADDRESS
  │
  ├──────< (N) CART_ITEM >────── (1) PRODUCT_VARIANT
  │
  ├──────< (N) ORDER
  │           └──────< (N) ORDER_ITEM >────── (1) PRODUCT_VARIANT
  │
  └──────< (N) REVIEW >────── (1) PRODUCT
                                    │
                                    ├──────< (N) PRODUCT_IMAGE
                                    │
                                    ├──────< (N) PRODUCT_VARIANT
                                    │
                                    ├────── (1) CATEGORY
                                    │           └── (self-reference: parent/children)
                                    │
                                    └────── (1) COLLECTION
```

---

## 📊 CÁC LOẠI QUAN HỆ

### 1. One-to-Many (1-N) - Phổ biến nhất
- 1 User có nhiều Address
- 1 Product có nhiều ProductImage
- 1 Product có nhiều ProductVariant
- 1 Order có nhiều OrderItem

### 2. Many-to-One (N-1) - Ngược lại của 1-N
- Nhiều Product thuộc 1 Category
- Nhiều Product thuộc 1 Collection

### 3. One-to-One (1-1) - Ít dùng
- 1 Review liên kết với 1 OrderItem (để verify purchase)

### 4. Self-Referencing - Đặc biệt
- Category có parent/children (cấu trúc cây)

---

## 🎯 CASCADE & ORPHAN REMOVAL

### Cascade = ALL, orphanRemoval = true
**Áp dụng cho:**
- Product → ProductImage
- Product → ProductVariant
- Order → OrderItem
- Category → Category (children)

**Ý nghĩa:**
- Khi xóa Product → tự động xóa tất cả ProductImage và ProductVariant
- Khi xóa Order → tự động xóa tất cả OrderItem
- **QUAN TRỌNG:** Không được thay thế collection bằng `new ArrayList()`, chỉ được modify collection hiện có

### Không có Cascade
**Áp dụng cho:**
- CartItem → ProductVariant (xóa variant không xóa cart item)
- OrderItem → ProductVariant (xóa variant không xóa order history)
- Review → Product (xóa product không xóa review)

---

## 💡 BEST PRACTICES

### 1. Lazy Loading
Tất cả quan hệ đều dùng `FetchType.LAZY` để tránh load dữ liệu không cần thiết.

### 2. Snapshot Data
OrderItem lưu `productName` và `unitPrice` để giữ lại thông tin tại thời điểm mua.

### 3. Soft Delete
Dùng `isActive` thay vì xóa thật để giữ lại lịch sử.

### 4. Unique Constraints
- `sku` (Product, ProductVariant)
- `email` (User)
- `orderCode` (Order)
- `code` (Coupon)

### 5. JSON Fields
- `shippingAddress` trong Order: Lưu địa chỉ dạng JSON để linh hoạt

---

## 🔍 CÂU HỎI THƯỜNG GẶP

### Q: Tại sao ProductVariant có SKU riêng?
**A:** Mỗi variant là 1 sản phẩm độc lập trong kho, cần SKU để quản lý tồn kho.

### Q: Tại sao CartItem không lưu giá?
**A:** Giá có thể thay đổi, tính real-time khi hiển thị giỏ hàng.

### Q: Tại sao OrderItem lại lưu giá?
**A:** Đây là snapshot tại thời điểm mua, không thay đổi dù giá sản phẩm có đổi.

### Q: Category và Collection khác nhau thế nào?
**A:** 
- Category: Phân loại cố định (Gọng kính, Kính râm)
- Collection: Nhóm tạm thời theo chủ đề marketing (Summer 2024)

### Q: Tại sao Review cần liên kết với OrderItem?
**A:** Để verify "Đã mua hàng" (`isVerifiedPurchase = true`), tăng độ tin cậy.

---

## 📝 KẾT LUẬN

Database schema của HMK Eyewear được thiết kế:
- ✅ Chuẩn hóa tốt (normalized)
- ✅ Hỗ trợ đầy đủ tính năng e-commerce
- ✅ Linh hoạt mở rộng
- ✅ Bảo toàn dữ liệu lịch sử (snapshot)
- ✅ Tối ưu performance (lazy loading)

Tổng cộng: **14 entities**, **~25 relationships**, hỗ trợ đầy đủ flow từ browse → cart → checkout → review.
