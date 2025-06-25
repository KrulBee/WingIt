# WingIt - Mạng Xã Hội

Một nền tảng mạng xã hội hiện đại được xây dựng với Spring Boot, Next.js, và AI kiểm duyệt nội dung.

## 🚀 Tính Năng

- **Xác thực người dùng**: JWT authentication với tích hợp Google OAuth2
- **Tin nhắn thời gian thực**: Chat và thông báo qua WebSocket
- **Kiểm duyệt nội dung AI**: Phát hiện từ ngữ không phù hợp tiếng Việt sử dụng PhoBERT
- **Quản lý media**: Upload ảnh/video với Cloudinary
- **Tính năng xã hội**: Bài viết, bình luận, like, bookmark, hệ thống kết bạn
- **Bảng điều khiển Admin**: Quản lý người dùng và thống kê
- **Responsive**: Giao diện hiện đại với chế độ sáng/tối

## 🏗️ Kiến Trúc

```
WingIt/
├── fe/          # Frontend Next.js (React 19, TypeScript)
├── server/      # Backend Spring Boot (Java 17)
├── AI/          # AI Service (Python, PhoBERT)
└── database/    # PostgreSQL Database Schema
```

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **Framework**: Next.js 15.3.2
- **Ngôn ngữ**: TypeScript
- **UI Libraries**: NextUI, Tailwind CSS, Ant Design
- **State Management**: Redux Toolkit
- **Real-time**: WebSocket client

### Backend
- **Framework**: Spring Boot 3.4.5
- **Ngôn ngữ**: Java 17
- **Database**: PostgreSQL (production), MySQL (development)
- **Authentication**: JWT + OAuth2
- **Real-time**: WebSocket
- **File Storage**: Cloudinary

### AI Service
- **Framework**: Flask
- **Ngôn ngữ**: Python 3.10
- **Model**: PhoBERT (Xử lý văn bản tiếng Việt)
- **Libraries**: Transformers, PyTorch

## 📋 Yêu Cầu Hệ Thống

- **Java 17+**
- **Node.js 18+**
- **Python 3.10+**
- **Docker** (tùy chọn)
- **PostgreSQL** (production) hoặc **MySQL** (development)

## 🚀 Cài Đặt Nhanh

### 1. Clone Repository
```bash
git clone <repository-url>
cd WingIt
```

### 2. Cấu Hình Môi Trường

Tạo file `.env` cho từng service:

#### Backend (.env trong thư mục server/)
```env
DATABASE_URL=jdbc:postgresql://localhost:5432/wingit
DB_USERNAME=your_username
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### Frontend (.env.local trong thư mục fe/)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
NEXT_PUBLIC_AI_URL=http://localhost:5000
```

### 3. Khởi Chạy Services

#### Sử dụng Docker (Khuyến nghị)
```bash
docker-compose up --build
```

#### Khởi chạy thủ công

**AI Service:**
```bash
cd AI
pip install -r requirements.txt
python real_ai_server.py
```

**Backend:**
```bash
cd server
./mvnw clean install
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd fe
npm install
npm run dev
```

## 🔧 Truy Cập Ứng Dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **AI Service**: http://localhost:5000

## 📚 Tài Liệu API

### Xác thực
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /login/oauth2/authorization/google` - Đăng nhập Google

### Người dùng
- `GET /api/users/profile` - Lấy thông tin profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/search` - Tìm kiếm người dùng

### Bài viết
- `GET /api/posts` - Lấy danh sách bài viết
- `POST /api/posts` - Tạo bài viết mới
- `PUT /api/posts/{id}` - Cập nhật bài viết
- `DELETE /api/posts/{id}` - Xóa bài viết

### WebSocket
- **URL**: `ws://localhost:8080/ws`
- **Xác thực**: JWT token required

## 🚀 Triển Khai Production

Xem file `render.yaml` để cấu hình triển khai trên Render.

## 🧪 Testing

```bash
# Backend tests
cd server
./mvnw test

# Frontend tests
cd fe
npm test
```

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 🆘 Khắc Phục Sự Cố

### Lỗi thường gặp

1. **Lỗi kết nối Database**
   - Kiểm tra database đang chạy
   - Xác minh connection string và credentials

2. **AI Service không khởi động**
   - Kiểm tra Python dependencies
   - Xác minh port 5000 khả dụng

3. **WebSocket kết nối thất bại**
   - Đảm bảo backend đang chạy
   - Kiểm tra cấu hình CORS

## 📄 License

Dự án này được cấp phép theo MIT License.