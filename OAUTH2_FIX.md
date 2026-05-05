# Fix Lỗi OAuth2 - 404 Not Found

## Vấn đề
Khi đăng nhập bằng Google, backend redirect về `https://hmk-eyewear-frontend.onrender.com/oauth2/redirect` nhưng bị lỗi 404.

## Nguyên nhân
URL redirect không được cấu hình đúng trong Google OAuth2 Console.

## Giải pháp

### Bước 1: Cập nhật Google OAuth2 Console

Truy cập: https://console.cloud.google.com/apis/credentials

Trong **Authorized redirect URIs**, thêm:
```
https://hmk-eyewear-frontend.onrender.com/oauth2/redirect
```

**Danh sách đầy đủ Authorized redirect URIs nên có:**
- `http://localhost:8080/login/oauth2/code/google` (dev)
- `https://quantrihethongthongtin.onrender.com/login/oauth2/code/google` (prod - backend callback)
- `https://hmk-eyewear-frontend.onrender.com/oauth2/redirect` (prod - frontend redirect) ⭐ **THÊM CÁI NÀY**

### Bước 2: Xác nhận biến môi trường trên Render

Vào Render Dashboard > Backend Service > Environment

Kiểm tra:
```
FRONTEND_OAUTH2_REDIRECT_URL=https://hmk-eyewear-frontend.onrender.com/oauth2/redirect
```

### Bước 3: Redeploy Backend (nếu cần)

Nếu đã thay đổi biến môi trường, redeploy backend service.

## Luồng OAuth2 đúng

1. User click "Đăng nhập bằng Google" trên frontend
2. Frontend redirect đến backend: `https://quantrihethongthongtin.onrender.com/oauth2/authorization/google`
3. Backend redirect đến Google OAuth2
4. User đăng nhập Google
5. Google redirect về backend: `https://quantrihethongthongtin.onrender.com/login/oauth2/code/google`
6. Backend xử lý, tạo JWT tokens
7. Backend redirect về frontend: `https://hmk-eyewear-frontend.onrender.com/oauth2/redirect?accessToken=...&refreshToken=...`
8. Frontend component `OAuth2RedirectHandler` nhận tokens và lưu vào store

## Kiểm tra

Sau khi fix, test lại flow đăng nhập Google và kiểm tra:
- ✅ Không còn lỗi 404
- ✅ Tokens được truyền qua URL params
- ✅ User được redirect về trang chủ
- ✅ Thông tin user được load đúng

## Lưu ý

- Frontend đã có route `/oauth2/redirect` với component `OAuth2RedirectHandler`
- Frontend đã có `_redirects` file để handle SPA routing
- Không cần thêm endpoint `/oauth2/redirect` ở backend
