# Hướng dẫn Deploy HMK Eyewear lên Render

## 📋 Tổng quan
- **Backend**: Spring Boot trên Render Web Service
- **Frontend**: React + Vite trên Render Static Site
- **Database**: MySQL trên Aiven
- **Redis**: Redis trên Render hoặc Upstash
- **Storage**: Cloudinary (đã có)

---

## 🗄️ Bước 1: Setup MySQL Database trên Aiven

### 1.1. Tạo MySQL Service
1. Đăng ký/Đăng nhập [Aiven Console](https://console.aiven.io/)
2. Click **Create Service** → Chọn **MySQL**
3. Chọn plan (Free tier hoặc Startup)
4. Chọn region gần Việt Nam (Singapore recommended)
5. Đặt tên service: `hmk-eyewear-mysql`
6. Click **Create Service** và đợi ~5-10 phút

### 1.2. Thông tin kết nối (ĐÃ CÓ)
- **Host**: `mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com`
- **Port**: `21454`
- **User**: `avnadmin`
- **Password**: `AVNS_1Q6r7fRgU2o1xGAjIcE`
- **Database**: `defaultdb`

### 1.3. Tạo database (OPTIONAL)
Có thể dùng luôn `defaultdb` hoặc tạo database mới:
1. Vào tab **Databases**
2. Click **Create database**
3. Tên database: `hmk_eyewear_prod`

### 1.4. Connection String cho Spring Boot
```
jdbc:mysql://mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com:21454/defaultdb?sslMode=REQUIRED
```

---

## 🔴 Bước 2: Setup Redis trên Render

### 2.1. Tạo Redis Instance
1. Vào [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Redis**
3. Đặt tên: `hmk-eyewear-redis`
4. Chọn plan Free
5. Click **Create Redis**

### 2.2. Lấy Internal Redis URL
Sau khi tạo xong, copy **Internal Redis URL**:
```
redis://red-xxxxx:6379
```

---

## 🚀 Bước 3: Deploy Backend lên Render

### 3.1. Tạo Web Service
1. Vào Render Dashboard → **New** → **Web Service**
2. Connect GitHub repository của bạn
3. Cấu hình:
   - **Name**: `hmk-eyewear-backend`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Java
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/hmk-eyewear-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`
   - **Instance Type**: Free (hoặc Starter)

### 3.2. Environment Variables
Thêm các biến môi trường sau:

```bash
# Database (từ Aiven)
DATABASE_URL=jdbc:mysql://mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com:21454/defaultdb?sslMode=REQUIRED
DATABASE_USERNAME=avnadmin
DATABASE_PASSWORD=AVNS_1Q6r7fRgU2o1xGAjIcE

# Redis (từ Render)
REDIS_URL=redis://red-xxxxx:6379

# JWT
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=604800000

# Email
MAIL_USERNAME=water5ngan@gmail.com
MAIL_PASSWORD=fcbh xvok tuxl rtpu

# Google OAuth2
GOOGLE_CLIENT_ID=85156935075-3euansbct5m7taqq2dhdk01d1nrfki3h.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Cloudinary
CLOUDINARY_CLOUD_NAME=dqtkvqoh6
CLOUDINARY_API_KEY=429951143493126
CLOUDINARY_API_SECRET=WvhGZyKUE478D2ZTNeazKd4aUOg

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

### 3.3. Deploy
Click **Create Web Service** và đợi build + deploy (~5-10 phút)

Backend URL sẽ là: `https://hmk-eyewear-backend.onrender.com`

---

## 🎨 Bước 4: Deploy Frontend lên Render

### 4.1. Tạo Static Site
1. Render Dashboard → **New** → **Static Site**
2. Connect GitHub repository
3. Cấu hình:
   - **Name**: `hmk-eyewear-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 4.2. Environment Variables
```bash
VITE_API_URL=https://hmk-eyewear-backend.onrender.com/api/v1
VITE_GOOGLE_CLIENT_ID=85156935075-3euansbct5m7taqq2dhdk01d1nrfki3h.apps.googleusercontent.com
VITE_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/dqtkvqoh6
```

### 4.3. Deploy
Click **Create Static Site**

Frontend URL: `https://hmk-eyewear-frontend.onrender.com`

---

## ⚙️ Bước 5: Cấu hình CORS và OAuth Redirect

### 5.1. Update CORS trong Backend
File đã có `CorsConfig.java`, chỉ cần đảm bảo frontend URL được allow.

### 5.2. Update Google OAuth Redirect URIs
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project OAuth của bạn
3. **APIs & Services** → **Credentials**
4. Edit OAuth 2.0 Client ID
5. Thêm **Authorized redirect URIs**:
   ```
   https://hmk-eyewear-backend.onrender.com/login/oauth2/code/google
   https://hmk-eyewear-frontend.onrender.com
   ```

---

## 📊 Bước 6: Migrate Database

### 6.1. Export từ Local MySQL
```bash
mysqldump -u root hmk_eyewear_dev > backup.sql
```

### 6.2. Import vào Aiven MySQL
```bash
mysql -h mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com -P 21454 -u avnadmin -p --ssl-mode=REQUIRED defaultdb < backup.sql
# Password: AVNS_1Q6r7fRgU2o1xGAjIcE
```

Hoặc dùng MySQL Workbench/DBeaver để connect và import.

---

## ✅ Bước 7: Kiểm tra

1. **Backend Health**: `https://hmk-eyewear-backend.onrender.com/actuator/health`
2. **API Docs**: `https://hmk-eyewear-backend.onrender.com/swagger-ui.html`
3. **Frontend**: `https://hmk-eyewear-frontend.onrender.com`

---

## 🔧 Troubleshooting

### Backend không start
- Check logs trong Render Dashboard
- Verify database connection string
- Đảm bảo `sslMode=REQUIRED` trong DATABASE_URL

### Frontend không connect được Backend
- Check CORS configuration
- Verify `VITE_API_URL` đúng
- Check Network tab trong browser DevTools

### Database connection timeout
- Whitelist Render IPs trong Aiven (thường auto)
- Check Aiven service status

---

## 💰 Chi phí ước tính

- **Aiven MySQL**: Free tier (1GB storage) hoặc $10-20/tháng
- **Render Backend**: Free tier (sleep sau 15 phút idle) hoặc $7/tháng
- **Render Redis**: Free tier (25MB)
- **Render Frontend**: Free
- **Cloudinary**: Free tier (25GB/tháng)

**Tổng**: $0 (all free tiers) hoặc ~$17-27/tháng (paid tiers)

---

## 📝 Notes

- Free tier của Render sẽ sleep sau 15 phút không hoạt động
- Request đầu tiên sau khi sleep sẽ mất ~30s để wake up
- Nên upgrade lên paid plan cho production
- Setup monitoring và alerts trong Render Dashboard
