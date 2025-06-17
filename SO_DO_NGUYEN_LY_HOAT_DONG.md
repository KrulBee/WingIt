# Sơ Đồ Nguyên Lý Hoạt Động - Hệ Thống WingIt

## 📋 Tổng Quan Hệ Thống

WingIt là một nền tảng mạng xã hội hiện đại với kiến trúc microservices, bao gồm các thành phần chính:
- **Frontend**: Next.js/React với TypeScript
- **Backend**: Spring Boot (Java)
- **AI Service**: Flask (Python) với PhoBERT model
- **Database**: PostgreSQL
- **File Storage**: Cloudinary
- **Deployment**: Render Cloud Platform

---

## 🏗️ Sơ Đồ Kiến Trúc Tổng Thể

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile Browser]
    end
    
    subgraph "Frontend Layer"
        NEXTJS[Next.js Frontend<br/>Port: 3000]
        REDUX[Redux Store]
        NEXTJS --> REDUX
    end
    
    subgraph "Backend Layer"
        SPRING[Spring Boot API<br/>Port: 8080]
        JWT[JWT Authentication]
        WEBSOCKET[WebSocket Server]
        SPRING --> JWT
        SPRING --> WEBSOCKET
    end
    
    subgraph "AI Layer"
        FLASK[Flask AI Service<br/>Port: 5000]
        PHOBERT[PhoBERT Model]
        FLASK --> PHOBERT
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL Database)]
        CLOUDINARY[Cloudinary<br/>File Storage]
    end
    
    subgraph "External Services"
        GOOGLE[Google OAuth2]
        EMAIL[Email Service]
    end
    
    WEB --> NEXTJS
    MOBILE --> NEXTJS
    NEXTJS --> SPRING
    SPRING --> POSTGRES
    SPRING --> CLOUDINARY
    SPRING --> FLASK
    SPRING --> GOOGLE
    SPRING --> EMAIL
    
    style WEB fill:#e1f5fe
    style MOBILE fill:#e1f5fe
    style NEXTJS fill:#f3e5f5
    style SPRING fill:#e8f5e8
    style FLASK fill:#fff3e0
    style POSTGRES fill:#fce4ec
    style CLOUDINARY fill:#f1f8e9
```

---

## 🔄 Sơ Đồ Luồng Dữ Liệu Chính

```mermaid
flowchart TD
    START([Người dùng truy cập]) --> LOGIN{Đã đăng nhập?}
    
    LOGIN -->|Chưa| AUTH[Xác thực người dùng]
    LOGIN -->|Rồi| MAIN[Trang chính]
    
    AUTH --> OAUTH{Đăng nhập Google?}
    OAUTH -->|Có| GOOGLE_AUTH[Google OAuth2]
    OAUTH -->|Không| MANUAL_AUTH[Đăng nhập thủ công]
    
    GOOGLE_AUTH --> VERIFY_TOKEN[Xác thực Google Token]
    MANUAL_AUTH --> CHECK_CREDS[Kiểm tra thông tin]
    
    VERIFY_TOKEN --> CREATE_SESSION[Tạo JWT Session]
    CHECK_CREDS --> CREATE_SESSION
    
    CREATE_SESSION --> MAIN
    
    MAIN --> ACTIONS{Hành động người dùng}
    
    ACTIONS --> POST[Tạo bài viết]
    ACTIONS --> CHAT[Nhắn tin]
    ACTIONS --> SOCIAL[Tương tác xã hội]
    ACTIONS --> ADMIN[Quản trị]
    
    POST --> AI_CHECK[Kiểm tra AI]
    AI_CHECK --> AI_APPROVED{Được phê duyệt?}
    AI_APPROVED -->|Có| SAVE_POST[Lưu bài viết]
    AI_APPROVED -->|Không| REJECT_POST[Từ chối bài viết]
    
    CHAT --> REALTIME[WebSocket Real-time]
    SOCIAL --> UPDATE_FEED[Cập nhật Feed]
    ADMIN --> MANAGE_SYSTEM[Quản lý hệ thống]
    
    style START fill:#4caf50
    style LOGIN fill:#ff9800
    style AI_CHECK fill:#2196f3
    style REALTIME fill:#9c27b0
```

---

## 🔐 Sơ Đồ Quy Trình Xác Thực

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database
    participant G as Google OAuth2
    participant JWT as JWT Service
    
    Note over U,JWT: Quy trình đăng nhập
    
    U->>FE: Nhập thông tin đăng nhập
    FE->>FE: Validation form
    
    alt Đăng nhập Google
        FE->>G: Redirect to Google
        G->>U: Google Login Form
        U->>G: Đăng nhập Google
        G->>FE: Authorization Code
        FE->>BE: POST /api/v1/auth/google
        BE->>G: Verify Token
        G->>BE: User Info
    else Đăng nhập thủ công
        FE->>BE: POST /api/v1/auth/login
        BE->>DB: Kiểm tra credentials
        DB->>BE: User data
    end
    
    BE->>JWT: Tạo JWT Token
    JWT->>BE: JWT Token
    BE->>FE: Token + User Info
    FE->>FE: Lưu token localStorage
    FE->>U: Redirect to Dashboard
    
    Note over U,JWT: Mọi request sau đó sẽ kèm JWT token
```

---

## 📝 Sơ Đồ Quy Trình Tạo Bài Viết với AI

```mermaid
flowchart TD
    START([Người dùng tạo bài viết]) --> FORM[Điền form bài viết]
    
    FORM --> UPLOAD{Có upload file?}
    UPLOAD -->|Có| CLOUDINARY[Upload lên Cloudinary]
    UPLOAD -->|Không| VALIDATE
    
    CLOUDINARY --> GET_URL[Nhận URL file]
    GET_URL --> VALIDATE[Validate dữ liệu]
    
    VALIDATE --> SEND_API[Gửi API tạo bài viết]
    SEND_API --> AUTH_CHECK[Kiểm tra JWT token]
    AUTH_CHECK --> AI_SERVICE[Gửi đến AI Service]
    
    AI_SERVICE --> PHOBERT[PhoBERT Model Analysis]
    PHOBERT --> AI_RESULT{Kết quả phân tích}
    
    AI_RESULT -->|Nội dung phù hợp| SAVE_DB[Lưu vào Database]
    AI_RESULT -->|Có từ ngữ không phù hợp| REJECT[Từ chối + Thông báo]
    
    SAVE_DB --> NOTIFY[Thông báo cho followers]
    NOTIFY --> UPDATE_FEED[Cập nhật Feed real-time]
    UPDATE_FEED --> SUCCESS([Hoàn thành])
    
    REJECT --> ERROR_MSG[Hiển thị lỗi]
    ERROR_MSG --> FORM
    
    style START fill:#4caf50
    style AI_SERVICE fill:#2196f3
    style PHOBERT fill:#ff9800
    style REJECT fill:#f44336
    style SUCCESS fill:#4caf50
```

---

## 💬 Sơ Đồ Hệ Thống Chat Real-time

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant FE1 as Frontend 1
    participant WS as WebSocket Server
    participant BE as Backend
    participant DB as Database
    participant FE2 as Frontend 2
    participant U2 as User 2
    
    Note over U1,U2: Thiết lập kết nối WebSocket
    
    U1->>FE1: Mở trang chat
    FE1->>WS: Connect WebSocket
    WS->>BE: Xác thực user
    BE->>DB: Lấy thông tin user
    DB->>BE: User info
    BE->>WS: Xác thực thành công
    WS->>FE1: Connection established
    
    U2->>FE2: Mở trang chat
    FE2->>WS: Connect WebSocket
    WS->>FE2: Connection established
    
    Note over U1,U2: Gửi tin nhắn
    
    U1->>FE1: Gõ tin nhắn
    FE1->>WS: Send message
    WS->>BE: Lưu tin nhắn
    BE->>DB: INSERT message
    DB->>BE: Confirm saved
    BE->>WS: Message saved
    
    WS->>FE1: Confirm sent
    WS->>FE2: New message
    FE2->>U2: Hiển thị tin nhắn
    
    Note over U1,U2: Typing indicator
    
    U1->>FE1: Đang gõ...
    FE1->>WS: Typing event
    WS->>FE2: User typing
    FE2->>U2: Hiển thị "đang gõ..."
```

---

## 🛡️ Sơ Đồ Hệ Thống Bảo Mật và Phân Quyền

```mermaid
graph TD
    subgraph "Authentication Layer"
        JWT_AUTH[JWT Authentication]
        OAUTH[Google OAuth2]
        SESSION[Session Management]
    end
    
    subgraph "Authorization Layer"
        ROLE_CHECK[Role-based Access Control]
        PERM_CHECK[Permission Validation]
        RESOURCE_AUTH[Resource Authorization]
    end
    
    subgraph "User Roles"
        ADMIN[Administrator]
        USER[Regular User]
        MODERATOR[Moderator]
    end
    
    subgraph "Protected Resources"
        ADMIN_PANEL[Admin Panel]
        USER_DATA[User Data]
        POSTS[Posts Management]
        REPORTS[Report Management]
    end
    
    subgraph "Security Features"
        RATE_LIMIT[Rate Limiting]
        CSRF_PROTECT[CSRF Protection]
        XSS_PREVENT[XSS Prevention]
        SQL_INJECT[SQL Injection Prevention]
    end
    
    JWT_AUTH --> ROLE_CHECK
    OAUTH --> ROLE_CHECK
    SESSION --> ROLE_CHECK
    
    ROLE_CHECK --> ADMIN
    ROLE_CHECK --> USER
    ROLE_CHECK --> MODERATOR
    
    ADMIN --> ADMIN_PANEL
    ADMIN --> REPORTS
    USER --> USER_DATA
    USER --> POSTS
    MODERATOR --> POSTS
    MODERATOR --> REPORTS
    
    ROLE_CHECK --> RATE_LIMIT
    PERM_CHECK --> CSRF_PROTECT
    RESOURCE_AUTH --> XSS_PREVENT
    
    style JWT_AUTH fill:#4caf50
    style OAUTH fill:#2196f3
    style ADMIN fill:#ff5722
    style USER fill:#009688
    style RATE_LIMIT fill:#ff9800
```

---

## 🤖 Sơ Đồ AI Service và Machine Learning Pipeline

```mermaid
flowchart LR
    subgraph "Input Processing"
        TEXT_INPUT[Text Input]
        PREPROCESS[Text Preprocessing]
        TOKENIZE[Tokenization]
    end
    
    subgraph "AI Model"
        PHOBERT[PhoBERT Model]
        CLASSIFICATION[Classification Layer]
        PREDICTION[Prediction Output]
    end
    
    subgraph "Decision Engine"
        THRESHOLD[Threshold Check]
        DECISION{Content Appropriate?}
        CONFIDENCE[Confidence Score]
    end
    
    subgraph "Output Processing"
        APPROVE[Approve Content]
        REJECT[Reject Content]
        LOG[Log Results]
        FEEDBACK[Feedback Loop]
    end
    
    TEXT_INPUT --> PREPROCESS
    PREPROCESS --> TOKENIZE
    TOKENIZE --> PHOBERT
    
    PHOBERT --> CLASSIFICATION
    CLASSIFICATION --> PREDICTION
    PREDICTION --> THRESHOLD
    
    THRESHOLD --> CONFIDENCE
    CONFIDENCE --> DECISION
    
    DECISION -->|Yes| APPROVE
    DECISION -->|No| REJECT
    
    APPROVE --> LOG
    REJECT --> LOG
    LOG --> FEEDBACK
    FEEDBACK --> PHOBERT
    
    style PHOBERT fill:#ff9800
    style DECISION fill:#2196f3
    style APPROVE fill:#4caf50
    style REJECT fill:#f44336
```

---

## 📊 Sơ Đồ Database Schema

```mermaid
erDiagram
    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }
    
    USER_DATA {
        bigint id PK
        bigint user_id FK
        text bio
        varchar avatar_url
        varchar location
        date date_of_birth
        varchar phone
    }
    
    POSTS {
        bigint id PK
        bigint user_id FK
        text content
        varchar media_url
        varchar location
        timestamp created_at
        timestamp updated_at
        boolean is_deleted
    }
    
    COMMENTS {
        bigint id PK
        bigint post_id FK
        bigint user_id FK
        text content
        timestamp created_at
        boolean is_deleted
    }
    
    FRIENDSHIPS {
        bigint id PK
        bigint user_id FK
        bigint friend_id FK
        varchar status
        timestamp created_at
    }
    
    MESSAGES {
        bigint id PK
        bigint sender_id FK
        bigint receiver_id FK
        text content
        timestamp sent_at
        boolean is_read
    }
    
    POST_LIKES {
        bigint id PK
        bigint post_id FK
        bigint user_id FK
        timestamp created_at
    }
    
    REPORTS {
        bigint id PK
        bigint reporter_id FK
        bigint reported_user_id FK
        bigint post_id FK
        varchar reason
        varchar status
        timestamp created_at
    }
    
    USERS ||--o{ USER_DATA : has
    USERS ||--o{ POSTS : creates
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ FRIENDSHIPS : has
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ POST_LIKES : likes
    USERS ||--o{ REPORTS : reports
    
    POSTS ||--o{ COMMENTS : has
    POSTS ||--o{ POST_LIKES : receives
    POSTS ||--o{ REPORTS : reported
```

---

## 🚀 Sơ Đồ Deployment và DevOps

```mermaid
graph TB
    subgraph "Development"
        DEV_ENV[Local Development]
        GIT[Git Repository]
        IDE[VS Code IDE]
    end
    
    subgraph "CI/CD Pipeline"
        GITHUB[GitHub Actions]
        BUILD[Build Process]
        TEST[Automated Testing]
        DEPLOY[Deployment]
    end
    
    subgraph "Production Environment - Render"
        FE_RENDER[Frontend Service]
        BE_RENDER[Backend Service]
        AI_RENDER[AI Service]
        DB_RENDER[PostgreSQL Database]
    end
    
    subgraph "External Services"
        CLOUDINARY_PROD[Cloudinary]
        GOOGLE_OAUTH[Google OAuth2]
        EMAIL_SERVICE[Email Service]
    end
    
    subgraph "Monitoring"
        LOGS[Application Logs]
        METRICS[Performance Metrics]
        ALERTS[Error Alerts]
    end
    
    DEV_ENV --> GIT
    GIT --> GITHUB
    GITHUB --> BUILD
    BUILD --> TEST
    TEST --> DEPLOY
    
    DEPLOY --> FE_RENDER
    DEPLOY --> BE_RENDER
    DEPLOY --> AI_RENDER
    
    BE_RENDER --> DB_RENDER
    BE_RENDER --> CLOUDINARY_PROD
    BE_RENDER --> GOOGLE_OAUTH
    BE_RENDER --> EMAIL_SERVICE
    
    FE_RENDER --> LOGS
    BE_RENDER --> LOGS
    AI_RENDER --> LOGS
    
    LOGS --> METRICS
    METRICS --> ALERTS
    
    style GITHUB fill:#333
    style FE_RENDER fill:#61dafb
    style BE_RENDER fill:#6db33f
    style AI_RENDER fill:#ff6f00
    style DB_RENDER fill:#336791
```

---

## 📱 Sơ Đồ User Experience Flow

```mermaid
journey
    title User Journey - WingIt Social Platform
    
    section Đăng ký/Đăng nhập
        Truy cập trang web: 5: User
        Chọn đăng ký: 4: User
        Điền thông tin: 3: User
        Xác thực email: 4: User
        Đăng nhập thành công: 5: User
    
    section Thiết lập Profile
        Upload avatar: 4: User
        Điền thông tin cá nhân: 4: User
        Thiết lập privacy: 3: User
        Hoàn thành profile: 5: User
    
    section Sử dụng hệ thống
        Xem feed: 5: User
        Tạo bài viết: 5: User
        Tương tác bài viết: 5: User
        Chat với bạn bè: 5: User
        Nhận thông báo: 4: User
    
    section Quản lý tài khoản
        Chỉnh sửa profile: 4: User
        Thay đổi cài đặt: 3: User
        Quản lý bạn bè: 4: User
        Báo cáo vi phạm: 3: User
```

---

## 🔧 Cấu Hình Kỹ Thuật Chi Tiết

### Frontend (Next.js)
- **Framework**: Next.js 15.3.2 với React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Styled Components
- **State Management**: Redux Toolkit
- **UI Components**: NextUI, Ant Design
- **Authentication**: JWT với localStorage
- **Real-time**: WebSocket client
- **Build Tool**: Next.js built-in

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.4.5
- **Language**: Java 17
- **Database**: PostgreSQL (Production), MySQL (Development)
- **Authentication**: JWT + Spring Security
- **Real-time**: WebSocket with STOMP
- **File Upload**: Cloudinary integration
- **API Documentation**: Swagger/OpenAPI
- **Build Tool**: Maven

### AI Service (Flask)
- **Framework**: Flask 2.3.2
- **Language**: Python 3.9+
- **ML Model**: PhoBERT (Vietnamese BERT)
- **Libraries**: Transformers, PyTorch
- **API**: RESTful endpoints
- **Deployment**: Docker container

### Database
- **Production**: PostgreSQL on Render
- **Development**: MySQL local
- **ORM**: JPA/Hibernate
- **Connection Pooling**: HikariCP
- **Migrations**: Flyway

---

## 📈 Sơ Đồ Hiệu Suất và Tối Ưu Hóa

```mermaid
graph LR
    subgraph "Frontend Optimization"
        LAZY[Lazy Loading]
        CACHE[Browser Caching]
        COMPRESS[Asset Compression]
        CDN[CDN Delivery]
    end
    
    subgraph "Backend Optimization"
        DB_POOL[Connection Pooling]
        REDIS[Redis Caching]
        ASYNC[Async Processing]
        PAGINATION[Pagination]
    end
    
    subgraph "Database Optimization"
        INDEXING[Database Indexing]
        QUERY_OPT[Query Optimization]
        PARTITIONING[Table Partitioning]
    end
    
    subgraph "AI Optimization"
        MODEL_CACHE[Model Caching]
        BATCH_PROCESS[Batch Processing]
        GPU_ACCEL[GPU Acceleration]
    end
    
    LAZY --> CDN
    CACHE --> CDN
    COMPRESS --> CDN
    
    DB_POOL --> REDIS
    ASYNC --> REDIS
    PAGINATION --> REDIS
    
    INDEXING --> QUERY_OPT
    QUERY_OPT --> PARTITIONING
    
    MODEL_CACHE --> BATCH_PROCESS
    BATCH_PROCESS --> GPU_ACCEL
    
    style CDN fill:#4caf50
    style REDIS fill:#dc382d
    style QUERY_OPT fill:#336791
    style GPU_ACCEL fill:#ff9800
```

---

## 🎯 Tổng Kết

Hệ thống WingIt được thiết kế với kiến trúc microservices hiện đại, đảm bảo:

### ✅ Ưu điểm
- **Scalability**: Có thể mở rộng từng service độc lập
- **Reliability**: Fault tolerance và error handling
- **Security**: Nhiều lớp bảo mật và xác thực
- **Performance**: Tối ưu hóa từ frontend đến database
- **Maintainability**: Code sạch và kiến trúc rõ ràng
- **AI Integration**: Kiểm duyệt nội dung tự động

### 🚀 Công nghệ sử dụng
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Spring Boot, Java, PostgreSQL
- **AI**: Python, Flask, PhoBERT, Transformers
- **DevOps**: Docker, Render, GitHub Actions
- **External**: Cloudinary, Google OAuth2

### 📊 Khả năng mở rộng
- Hỗ trợ real-time communication
- AI-powered content moderation
- Microservices architecture
- Cloud-native deployment
- Mobile-responsive design
