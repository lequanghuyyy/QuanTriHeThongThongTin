# ✅ CORS Fix Checklist

## 🔴 Vấn đề
Frontend `https://hmk-eyewear-frontend.onrender.com` không thể gọi API đến backend `https://quantrihethongthongtin.onrender.com` do:
1. ❌ CORS chưa cho phép domain `*.onrender.com`
2. ❌ Frontend đang gọi sai URL backend

## ✅ Đã Fix
1. ✅ Thêm `https://*.onrender.com` vào `allowedOriginPatterns` trong `CorsConfig.java`
2. ✅ Cập nhật `VITE_API_URL` trong `RENDER_ENV_VARS.txt`

## 📋 Bước tiếp theo

### 1. Commit và Push code
```bash
git add backend/src/main/java/com/hmkeyewear/config/CorsConfig.java
git add backend/src/main/java/com/hmkeyewear/security/oauth2/OAuth2SuccessHandler.java
git add backend/src/main/java/com/hmkeyewear/security/oauth2/OAuth2FailureHandler.java
git add backend/src/main/resources/application-prod.yml
git commit -m "fix: Add Render domain to CORS and fix OAuth2 redirect URLs"
git push origin main
```

### 2. Cập nhật biến môi trường Frontend trên Render
**QUAN TRỌNG:** Frontend đang gọi sai URL!

1. Vào Render Dashboard: https://dashboard.render.com
2. Chọn service: `hmk-eyewear-frontend`
3. Click tab **"Environment"**
4. Tìm biến `VITE_API_URL` và sửa thành:
   ```
   https://quantrihethongthongtin.onrender.com/api/v1
   ```
5. Click **"Save Changes"**
6. Frontend sẽ tự động redeploy

### 3. Redeploy Backend trên Render
- Vào service: `quantrihethongthongtin` (backend)
- Thêm biến môi trường mới:
  ```
  FRONTEND_OAUTH2_REDIRECT_URL=https://hmk-eyewear-frontend.onrender.com/oauth2/redirect
  ```
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Đợi deploy hoàn tất (~5-10 phút)

### 3. Kiểm tra Backend đang chạy
Mở trình duyệt và test:
```
https://quantrihethongthongtin.onrender.com/api/v1/products
```

Nếu trả về JSON → Backend OK
Nếu lỗi 502/503 → Backend chưa khởi động xong

### 4. Test CORS
Sau khi backend deploy xong, refresh frontend:
```
https://hmk-eyewear-frontend.onrender.com
```

Kiểm tra Console - lỗi CORS phải biến mất.

## 🔍 Debug nếu vẫn lỗi

### Kiểm tra backend logs trên Render:
1. Vào service backend
2. Click tab **"Logs"**
3. Tìm dòng: `Started HmkEyewearApplication`

### Kiểm tra CORS headers:
Mở DevTools → Network → Chọn 1 request bất kỳ → Headers:
- Response Headers phải có: `Access-Control-Allow-Origin: https://hmk-eyewear-frontend.onrender.com`
- Response Headers phải có: `Access-Control-Allow-Credentials: true`

## 📝 Cấu hình CORS hiện tại

```java
allowedOriginPatterns:
- http://localhost:*
- https://*.vercel.app
- https://*.onrender.com  ← MỚI THÊM

allowedMethods: GET, POST, PUT, PATCH, DELETE, OPTIONS
allowedHeaders: *
exposedHeaders: Authorization, X-Session-Id
allowCredentials: true
```

## ⚠️ Lưu ý
- Backend URL trong code: `https://hmk-eyewear-backend.onrender.com`
- Backend URL thực tế: `https://quantrihethongthongtin.onrender.com`
- Nếu 2 URL này khác nhau, cần cập nhật biến môi trường `VITE_API_URL` trong frontend service trên Render!
