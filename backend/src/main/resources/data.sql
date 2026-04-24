-- User (Admin)
-- Admin@123 -> Hash BCrypt: $2a$10$w0f51A0A0eJtq52Mpw.UveP/25I8.u3022N.T88rK93dCTh7nBvte
INSERT INTO users (id, email, password, full_name, phone, role, provider, is_active, is_email_verified, created_at)
VALUES (UUID(), 'admin@hmkeyewear.com', '$2a$10$X05w8Tj16nB0o34uF7M4vOz9rK5aUeLh.Y97UeD5/G5A3y8YfXz7.', 'Admin HMK', '0901234567', 'ADMIN', 'LOCAL', true, true, NOW());

-- Collections
INSERT INTO collections (id, name, slug, description, season, is_active, created_at) VALUES 
(1, 'The Rock', 'the-rock', 'Bộ sưu tập kính đá xịn xò', 'Season 2', true, NOW()),
(2, 'Aurora Alloy', 'aurora-alloy', 'Sự rực rỡ của hợp kim', 'Mùa hè', true, NOW()),
(3, 'Red Velvet Vision', 'red-velvet-vision', 'Sắc đỏ quyến rũ', 'Thu Đông', true, NOW()),
(4, 'Mộng Nhãn Tinh Hoa', 'mong-nhan-tinh-hoa', 'Tinh hoa của nhãn quan', 'Tết 2026', true, NOW()),
(5, 'Shades of Brilliance', 'shades-of-brilliance', 'Tươi sáng mọi khoảnh khắc', 'Mùa xuân', true, NOW()),
(6, 'Witching Aura', 'witching-aura', 'Huyền bí và gai góc', 'Halloween', true, NOW());

-- Categories
-- Level 0 (Roots)
INSERT INTO categories (id, name, slug, level, sort_order, is_active, created_at) VALUES
(1, 'Gọng Kính', 'gong-kinh', 0, 1, true, NOW()),
(2, 'Kính Mát', 'kinh-mat', 0, 2, true, NOW()),
(3, 'Tròng Kính', 'trong-kinh', 0, 3, true, NOW());

-- Level 1 (Subs of Gọng Kính)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active, created_at) VALUES
(4, 1, 'Gọng Kim Loại', 'gong-kim-loai', 1, 1, true, NOW()),
(5, 1, 'Gọng Nhựa', 'gong-nhua', 1, 2, true, NOW()),
(6, 1, 'Gọng Oval', 'gong-oval', 1, 3, true, NOW()),
(7, 1, 'Gọng Mắt Mèo', 'gong-mat-meo', 1, 4, true, NOW()),
(8, 1, 'Gọng Nam', 'gong-nam', 1, 5, true, NOW()),
(9, 1, 'Gọng Nữ', 'gong-nu', 1, 6, true, NOW());

-- Level 2 (Subs of Gọng Kim Loại & Nhựa)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active, created_at) VALUES
(10, 4, 'Titan', 'gong-titan', 2, 1, true, NOW()),
(11, 4, 'Hợp Kim', 'gong-hop-kim', 2, 2, true, NOW()),
(12, 5, 'Nhựa Cứng', 'gong-nhua-cung', 2, 1, true, NOW()),
(13, 5, 'Nhựa Dẻo', 'gong-nhua-deo', 2, 2, true, NOW()),
(14, 5, 'Nhựa Phối Kim Loại', 'gong-nhua-phoi-kim-loai', 2, 3, true, NOW());

-- Level 1 (Subs of Kính Mát)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active, created_at) VALUES
(15, 2, 'Kính Mát Nữ', 'kinh-mat-nu', 1, 1, true, NOW()),
(16, 2, 'Kính Mát Nam', 'kinh-mat-nam', 1, 2, true, NOW()),
(17, 2, 'Kính Mát Em Bé', 'kinh-mat-em-be', 1, 3, true, NOW());

-- Level 1 (Subs of Tròng Kính)
INSERT INTO categories (id, parent_id, name, slug, level, sort_order, is_active, created_at) VALUES
(18, 3, 'Tròng Siêu Mỏng', 'trong-sieu-mong', 1, 1, true, NOW()),
(19, 3, 'Chống Ánh Sáng Xanh', 'trong-chong-asx', 1, 2, true, NOW()),
(20, 3, 'Đổi Màu', 'trong-doi-mau', 1, 3, true, NOW()),
(21, 3, 'Cận Phổ Thông', 'trong-can-pho-thong', 1, 4, true, NOW()),
(22, 3, 'Chống tia UV', 'trong-chong-uv', 1, 5, true, NOW()),
(23, 3, 'Đa Tròng', 'trong-da-trong', 1, 6, true, NOW()),
(24, 3, 'Râm Cận', 'trong-ram-can', 1, 7, true, NOW());

-- Stores
INSERT INTO stores (name, address, province, district, phone, lat, lng, is_active) VALUES
('HMK Lý Thường Kiệt', '324D Lý Thường Kiệt, Phường Diên Hồng', 'Hồ Chí Minh', 'Quận 10', '0901234567', 10.771234, 106.662345, true),
('HMK Nguyễn Trãi', '230 Nguyễn Trãi, Phường 3', 'Hồ Chí Minh', 'Quận 5', '0901234568', 10.758345, 106.674567, true),
('HMK Sư Vạn Hạnh', '710(s) Sư Vạn Hạnh, Phường 12', 'Hồ Chí Minh', 'Quận 10', '0901234569', 10.770543, 106.670213, true),
('HMK Võ Văn Ngân', '118 Võ Văn Ngân', 'Hồ Chí Minh', 'Thủ Đức', '0901234570', 10.849123, 106.764321, true),
('HMK Cầu Giấy', '150 Cầu Giấy', 'Hà Nội', 'Cầu Giấy', '0902234570', 21.032123, 105.798321, true);

-- Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount_amount, is_active, usage_limit, used_count) VALUES
('WELCOME10', 'Giảm 10% khách mới', 'PERCENTAGE', 10, 200000, 50000, true, 1000, 0),
('HMKFREE', 'Free Ship (Giảm 35k)', 'FIXED_AMOUNT', 35000, 0, 35000, true, 500, 0);

-- Products (Gọng Kính)
INSERT INTO products (id, sku, name, slug, category_id, collection_id, product_type, brand, base_price, sale_price, is_active, created_at, material, gender) VALUES
(1, 'NKL83079', 'Gọng Kính Nam Nữ Cổ Điển', 'nkl83079', 11, 1, 'FRAME', 'HMK', 216000, 162000, true, NOW(), 'Hợp Kim', 'UNISEX'),
(2, 'KL83083', 'Gọng Kính KL Tròn Nhỏ', 'kl83083', 11, 2, 'FRAME', 'HMK', 216000, 162000, true, NOW(), 'Hợp Kim', 'UNISEX'),
(3, 'KL6610', 'Gọng Kính Phối Nhựa', 'kl6610', 14, 3, 'FRAME', 'HMK', 320000, 288000, true, NOW(), 'Nhựa Phối KL', 'FEMALE');

-- Products (Kính Mát)
INSERT INTO products (id, sku, name, slug, category_id, product_type, brand, base_price, sale_price, is_active, created_at, gender) VALUES
(4, 'KM9016', 'Kính Mát Nam Cool', 'km9016', 16, 'SUNGLASSES', 'HMK', 400000, 322000, true, NOW(), 'MALE'),
(5, 'KMNU01', 'Kính Mát Nữ Sành Điệu', 'kmnu01', 15, 'SUNGLASSES', 'HMK', 450000, 350000, true, NOW(), 'FEMALE');

-- Products (Tròng Kính)
INSERT INTO products (id, sku, name, slug, category_id, product_type, brand, base_price, sale_price, is_active, created_at, lens_index) VALUES
(6, 'ROCKY_156_ASX', 'Tròng kính Rocky 1.56 Chống Ánh Sáng Xanh', 'rocky-1-56-chong-asx', 19, 'LENS', 'Rocky', 560000, 560000, true, NOW(), '1.56'),
(7, 'ROCKY_161', 'Tròng kính Rocky 1.61', 'rocky-1-61', 21, 'LENS', 'Rocky', 886000, 886000, true, NOW(), '1.61'),
(8, 'ROCKY_167', 'Tròng kính Rocky 1.67', 'rocky-1-67', 18, 'LENS', 'Rocky', 1028000, 1028000, true, NOW(), '1.67'),
(9, 'ROCKY_156_DOI_MAU', 'Tròng kính Rocky 1.56 Đổi Màu', 'rocky-1-56-doi-mau', 20, 'LENS', 'Rocky', 788000, 788000, true, NOW(), '1.56'),
(10, 'ROCKY_LUX_161', 'Tròng kính Rocky Luxury 1.61', 'rocky-luxury-1-61', 21, 'LENS', 'Rocky', 1238000, 1238000, true, NOW(), '1.61'),
(11, 'CHEMI_U2_156', 'Tròng kính Chemi U2 1.56', 'chemi-u2-1-56', 21, 'LENS', 'Chemi', 336000, 336000, true, NOW(), '1.56'),
(12, 'ESSILOR_ROCK_160', 'Tròng kính Essilor Crizal Rock 1.60', 'essilor-crizal-rock-1-60', 18, 'LENS', 'Essilor', 2280000, 2280000, true, NOW(), '1.60');

-- Product Variants
INSERT INTO product_variants (product_id, color_name, color_hex, stock_quantity, sku) VALUES
(1, 'Đen', '#000000', 50, 'NKL83079-DEN'),
(1, 'Bạc', '#C0C0C0', 20, 'NKL83079-BAC'),
(2, 'Vàng', '#FFD700', 30, 'KL83083-VANG'),
(3, 'Đồi mồi', '#8B4513', 15, 'KL6610-DOI-MOI'),
(4, 'Đen Nhám', '#2b2b2b', 40, 'KM9016-DEN-NHAM'),
(5, 'Trắng', '#ffffff', 25, 'KMNU01-TRANG'),
(6, 'Trong', NULL, 100, 'ROCKY_156_ASX-TRONG'),
(7, 'Trong', NULL, 100, 'ROCKY_161-TRONG'),
(8, 'Trong', NULL, 100, 'ROCKY_167-TRONG'),
(9, 'Đổi màu Khói', NULL, 80, 'ROCKY_156_DOI_MAU-KHOI'),
(10, 'Trong', NULL, 100, 'ROCKY_LUX_161-TRONG'),
(11, 'Trong', NULL, 100, 'CHEMI_U2_156-TRONG'),
(12, 'Trong', NULL, 100, 'ESSILOR_ROCK_160-TRONG');
