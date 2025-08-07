# WingIt - Mạng Xã Hội

Một nền tảng mạng xã hội hiện đại được xây dựng với Spring Boot, Next.js, và AI kiểm duyệt nội dung.

## Tính Năng

- **Xác thực người dùng**: JWT authentication với tích hợp Google OAuth2
- **Tin nhắn thời gian thực**: Chat và thông báo qua WebSocket
- **Kiểm duyệt nội dung AI**: Phát hiện từ ngữ không phù hợp tiếng Việt sử dụng PhoBERT
- **Quản lý media**: Upload ảnh/video với Cloudinary
- **Tính năng xã hội**: Bài viết, bình luận, like, bookmark, hệ thống kết bạn
- **Bảng điều khiển Admin**: Quản lý người dùng và thống kê
- **Responsive**: Giao diện hiện đại với chế độ sáng/tối

## Kiến Trúc

```
WingIt/
├── fe/          # Frontend Next.js (React 19, TypeScript)
├── server/      # Backend Spring Boot (Java 17)
├── AI/          # AI Service (Python, PhoBERT)
└── database/    # PostgreSQL Database Schema
```

## Công Nghệ Sử Dụng

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

## Yêu Cầu Hệ Thống

- **Java 17+**
- **Node.js 18+**
- **Python 3.10+**
- **Docker** (tùy chọn)
- **PostgreSQL** (production) hoặc **MySQL** (development)
