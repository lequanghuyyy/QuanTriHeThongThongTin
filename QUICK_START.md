# 🚀 Quick Start - Deploy trong 15 phút

## Checklist trước khi deploy

- [ ] Code đã push lên GitHub
- [ ] Có tài khoản Render (https://render.com)
- [ ] Có tài khoản Aiven (https://aiven.io)
- [ ] Có Cloudinary credentials (đã có)
- [ ] Có Google OAuth credentials (đã có)

---

## Bước 1: Setup Database (5 phút)

### Aiven MySQL
1. ~~Vào https://console.aiven.io/signup~~ ✅ ĐÃ CÓ
2. ~~**Create Service** → **MySQL**~~ ✅ ĐÃ CÓ
3. Service đã sẵn sàng với thông tin:
   ```
   Host: mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com
   Port: 21454
   User: avnadmin
   Password: AVNS_1Q6r7fRgU2o1xGAjIcE
   Database: defaultdb
   ```

---

## Bước 2: Deploy Backend (5 phút)

1. Vào https://dashboard.render.com/
2. **New** → **Web Service**
3. Connect GitHub repo
4. Cấu hình:
   - Name: `hmk-eyewear-backend`
   - Region: **Singapore**
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: **Java**
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/hmk-eyewear-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod`

5. **Environment Variables** (click Add Environment Variable):
   ```
   DATABASE_URL=jdbc:mysql://mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com:21454/defaultdb?sslMode=REQUIRED
   DATABASE_USERNAME=avnadmin
   DATABASE_PASSWORD=AVNS_1Q6r7fRgU2o1xGAjIcE
   REDIS_URL=[sẽ có sau khi tạo Redis]
   JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   JWT_EXPIRATION_MS=604800000
   MAIL_USERNAME=water5ngan@gmail.com
   MAIL_PASSWORD=fcbh xvok tuxl rtpu
   GOOGLE_CLIENT_ID=85156935075-3euansbct5m7taqq2dhdk01d1nrfki3h.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   CLOUDINARY_CLOUD_NAME=dqtkvqoh6
   CLOUDINARY_API_KEY=429951143493126
   CLOUDINARY_API_SECRET=WvhGZyKUE478D2ZTNeazKd4aUOg
   SPRING_PROFILES_ACTIVE=prod
   ```

6. **Create Web Service** → Đợi build (~5 phút)

7. Copy Backend URL: `https://hmk-eyewear-backend.onrender.com`

---

## Bước 3: Setup Redis (2 phút)

1. Render Dashboard → **New** → **Redis**
2. Name: `hmk-eyewear-redis`
3. Plan: **Free**
4. **Create Redis**
5. Copy **Internal Redis URL**: `redis://red-xxxxx:6379`
6. Quay lại Backend service → **Environment** → Update `REDIS_URL`

---

## Bước 4: Deploy Frontend (3 phút)

1. Render Dashboard → **New** → **Static Site**
2. Connect GitHub repo
3. Cấu hình:
   - Name: `hmk-eyewear-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://hmk-eyewear-backend.onrender.com/api/v1
   VITE_GOOGLE_CLIENT_ID=85156935075-3euansbct5m7taqq2dhdk01d1nrfki3h.apps.googleusercontent.com
   VITE_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/dqtkvqoh6
   ```

5. **Create Static Site**

6. Copy Frontend URL: `https://hmk-eyewear-frontend.onrender.com`

---

## Bước 5: Import Database

### Option A: Từ local MySQL
```bash
# Export
mysqldump -u root hmk_eyewear_dev > backup.sql

# Import vào Aiven
mysql -h mysql-2b1e48af-lequanghuy26012005-27e4.d.aivencloud.com -P 21454 -u avnadmin -p --ssl-mode=REQUIRED defaultdb < backup.sql
# Password khi được hỏi: AVNS_1Q6r7fRgU2o1xGAjIcE
```

### Option B: Dùng MySQL Workbench
1. New Connection → Nhập thông tin Aiven
2. SSL: Require
3. Import backup.sql

---

## Bước 6: Update Google OAuth

1. https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Edit OAuth Client
4. **Authorized redirect URIs** → Add:
   ```
   https://hmk-eyewear-backend.onrender.com/login/oauth2/code/google
   https://hmk-eyewear-frontend.onrender.com
   ```

---

## ✅ Kiểm tra

- Backend: https://hmk-eyewear-backend.onrender.com/actuator/health
- API Docs: https://hmk-eyewear-backend.onrender.com/swagger-ui.html
- Frontend: https://hmk-eyewear-frontend.onrender.com

---

## 🐛 Troubleshooting nhanh

### Backend không start
```bash
# Check logs trong Render Dashboard
# Thường do:
# - DATABASE_URL sai format
# - Thiếu sslMode=REQUIRED
# - Password sai
```

### Frontend không gọi được API
```bash
# Check browser Console
# Verify VITE_API_URL đúng
# Check CORS trong backend logs
```

### Database connection failed
```bash
# Verify Aiven service đang chạy
# Check connection string format:
# jdbc:mysql://HOST:PORT/DATABASE?sslMode=REQUIRED
```

---

## 💡 Tips

- Free tier Render sleep sau 15 phút → Request đầu chậm ~30s
- Aiven free tier: 1GB storage, đủ cho development
- Nên setup custom domain sau khi test xong
- Enable auto-deploy trong Render settings
- Monitor logs thường xuyên trong giai đoạn đầu

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trong Render Dashboard
2. Verify tất cả environment variables
3. Test database connection riêng
4. Check Aiven service status
