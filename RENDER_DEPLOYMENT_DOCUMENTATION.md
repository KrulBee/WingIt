## 3.4 Triển khai ứng dụng với Render

Nền tảng mạng xã hội WingIt được triển khai thông qua dịch vụ cloud Render. Việc liên kết và quản lý mã nguồn thông qua GitHub khiến cho việc sử dụng Render trở nên dễ dàng hơn bao giờ hết. Để nâng cấp, thay đổi mã nguồn thì chỉ việc cập nhật mã nguồn trên GitHub và Render sẽ tự động phát hiện thay đổi và tự build và deploy bằng mã nguồn mới ngay lập tức. Dưới đây là các bước cơ bản để triển khai ứng dụng WingIt bằng Render:

**B1: Tạo kho lưu trữ (repository) sau đó đăng tải mã nguồn của dự án lên trên GitHub.**

Đầu tiên, cần tạo repository mới trên GitHub và đẩy toàn bộ mã nguồn dự án WingIt lên:

```bash
git init
git add .
git commit -m "Initial commit - WingIt Social Media Platform"
git remote add origin https://github.com/[username]/wingit-social-platform.git
git push -u origin main
```

Đảm bảo các file cấu hình quan trọng đã được commit:
- `render.yaml` (file cấu hình blueprint cho deployment)
- `fe/Dockerfile` (cấu hình Docker cho frontend Next.js)
- `server/Dockerfile` (cấu hình Docker cho backend Spring Boot)
- `AI/Dockerfile` (cấu hình Docker cho AI server Python)

**B2: Truy cập trang web Render rồi tiến hành tạo tài khoản Render sau đó liên kết với tài khoản GitHub.**

- Truy cập [render.com](https://render.com) và đăng ký tài khoản miễn phí
- Chọn "Sign up with GitHub" để liên kết trực tiếp với tài khoản GitHub
- Cấp quyền cho Render truy cập vào repository chứa mã nguồn WingIt

**B3: Sau khi liên kết tài khoản thì có thể import mã nguồn dự án đã đăng tải trước đó và tạo kết nối cơ sở dữ liệu PostgreSQL-Render để thực hiện quá trình build và deploy mã nguồn.**

Do WingIt là ứng dụng đa dịch vụ (microservices), quá trình deploy được thực hiện theo thứ tự:

**3.1. Triển khai Database (PostgreSQL):**
- Trong Render Dashboard, chọn "New" → "PostgreSQL"
- Cấu hình:
  - Database Name: `wingit`
  - User: `wingit_user`
  - Plan: Free
  - Region: Chọn gần nhất với người dùng

**3.2. Triển khai Backend Service (Spring Boot):**
- Chọn "New" → "Web Service"
- Connect repository từ GitHub
- Cấu hình:
  - Name: `wingit-backend`
  - Root Directory: `server`
  - Environment: Java
  - Build Command: `./mvnw clean package -DskipTests`
  - Start Command: `java -jar target/server-0.0.1-SNAPSHOT.jar`
  - Plan: Free

Thiết lập các biến môi trường cần thiết:
```
DATABASE_URL=postgresql://wingit_user:password@host:port/wingit
JWT_SECRET=your-super-secret-jwt-key-here
SPRING_PROFILES_ACTIVE=production
PORT=8080
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**3.3. Triển khai AI Server (Python/Flask):**
- Chọn "New" → "Web Service"
- Cấu hình:
  - Name: `wingit-ai`
  - Root Directory: `AI`
  - Environment: Python
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `python real_ai_server.py`
  - Plan: Free

**3.4. Triển khai Frontend (Next.js):**
- Chọn "New" → "Web Service"
- Cấu hình:
  - Name: `wingit-frontend`
  - Root Directory: `fe`
  - Environment: Node
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
  - Plan: Free

Thiết lập biến môi trường cho frontend:
```
NEXT_PUBLIC_API_URL=https://wingit-backend.onrender.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://wingit-backend.onrender.com/ws
NEXT_PUBLIC_AI_URL=https://wingit-ai.onrender.com
NODE_ENV=production
```

Nếu có lỗi trong quá trình deploy thì lỗi sẽ được hiển thị chi tiết trong phần "Logs" của từng service để người dùng có thể theo dõi và chỉnh sửa. Render cung cấp real-time logs giúp debug các vấn đề về dependency, cấu hình, hoặc lỗi runtime.

**B4: Khi đã được deploy thì có thể thay đổi theo tên miền đã mua hoặc sử dụng tên miền mặc định với định dạng ([hostname].onrender.com).**

Sau khi deployment hoàn tất, ứng dụng WingIt sẽ có các URL sau:
- Frontend: `https://wingit-frontend.onrender.com`
- Backend API: `https://wingit-backend.onrender.com`
- AI Service: `https://wingit-ai.onrender.com`

Người dùng có thể:
- Sử dụng domain mặc định của Render với format `[service-name].onrender.com`
- Cấu hình custom domain nếu đã mua tên miền riêng thông qua phần "Custom Domains" trong settings
- Thiết lập SSL certificate tự động được Render cung cấp

**Lưu ý quan trọng:**
- Do giới hạn RAM của Render free tier, AI server có thể cần chạy local hoặc sử dụng external service
- Database cần được migrate từ MySQL sang PostgreSQL format
- Cần cấu hình CORS trong backend để cho phép truy cập từ frontend domain

![Hình 3.15: Website WingIt được triển khai trên nền tảng Render](images/wingit-render-deployment.png)

*Hình 3.15: Giao diện quản lý deployment của WingIt trên Render platform, hiển thị trạng thái các services và logs real-time*
