# HMK Eyewear E-commerce Platform

Nền tảng thương mại điện tử bán kính mắt với Spring Boot backend và React frontend.
## 🛠️ Tech Stack

### Backend
- Spring Boot 3.2.4
- MySQL (Aiven)
- Redis (Render)
- Spring Security + JWT
- Google OAuth2
- Cloudinary (Image storage)

### Frontend
- React 19
- Vite
- TailwindCSS
- React Query
- Zustand
- React Router

## 📦 Project Structure

```
hmk-eyewear/
├── backend/              # Spring Boot API
│   ├── src/
│   ├── pom.xml
│   └── system.properties
├── frontend/             # React SPA
│   ├── src/
│   ├── package.json
│   └── .env.production
├── docs/                 # Documentation
├── render.yaml          # Render Blueprint
```
## Local Development

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Xem file `.env` trong mỗi thư mục để biết các biến môi trường cần thiết.

## 📄 License

Private Project
