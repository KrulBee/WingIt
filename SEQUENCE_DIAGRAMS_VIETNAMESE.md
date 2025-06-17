# Sơ Đồ Tuần Tự Hệ Thống WingIt

## 1. Sơ Đồ Tuần Tự - Đăng Ký Tài Khoản

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant AS as AI Service

    U->>FE: Nhập thông tin đăng ký (username, password)
    FE->>FE: Validate form dữ liệu
    FE->>BE: POST /api/v1/auth/register
    BE->>DB: Kiểm tra username đã tồn tại
    DB-->>BE: Kết quả kiểm tra
    
    alt Username đã tồn tại
        BE-->>FE: 400 "Username already exists"
        FE-->>U: Hiển thị thông báo lỗi
    else Username chưa tồn tại
        BE->>BE: Mã hóa mật khẩu (BCrypt)
        BE->>DB: Tạo User mới
        BE->>DB: Tạo UserData mặc định
        BE->>DB: Tạo UserSettings mặc định
        DB-->>BE: Xác nhận tạo thành công
        BE-->>FE: 200 "User registered successfully"
        FE->>FE: Chuyển về form đăng nhập
        FE-->>U: Hiển thị "Đăng ký thành công"
    end
```

## 2. Sơ Đồ Tuần Tự - Đăng Nhập

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant JWT as JWT Service

    U->>FE: Nhập username và password
    FE->>BE: POST /api/v1/auth/login
    BE->>DB: Tìm user theo username
    DB-->>BE: Thông tin user
    
    alt User không tồn tại hoặc sai mật khẩu
        BE-->>FE: 401 Unauthorized
        FE-->>U: "Đăng nhập thất bại"
    else Thông tin đúng
        BE->>JWT: Tạo JWT token
        JWT-->>BE: JWT token
        BE-->>FE: 200 + JWT token
        FE->>FE: Lưu token vào localStorage
        FE->>BE: GET /api/v1/auth/me (với token)
        BE-->>FE: Thông tin user đầy đủ
        FE->>FE: Cập nhật state user
        FE-->>U: Chuyển hướng đến /home
    end
```

## 3. Sơ Đồ Tuần Tự - Tạo Bài Viết

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant AI as AI Service
    participant Cloud as Cloudinary

    U->>FE: Nhập nội dung bài viết + upload ảnh
    FE->>FE: Validate form
    
    opt Có ảnh upload
        FE->>Cloud: Upload ảnh lên Cloudinary
        Cloud-->>FE: URL ảnh
    end
    
    FE->>BE: POST /api/v1/posts (với JWT token)
    BE->>BE: Xác thực JWT token
    BE->>AI: Gửi nội dung kiểm tra từ ngữ không phù hợp
    AI->>AI: Phân tích bằng PhoBERT model
    AI-->>BE: Kết quả kiểm tra
    
    alt Phát hiện từ ngữ không phù hợp
        BE-->>FE: 400 "Profanity detected"
        FE-->>U: Hiển thị cảnh báo từ ngữ không phù hợp
    else Nội dung hợp lệ
        BE->>DB: Lưu bài viết mới
        DB-->>BE: Post ID và thông tin
        BE-->>FE: 201 + thông tin bài viết
        FE->>FE: Cập nhật feed
        FE-->>U: Hiển thị bài viết mới
    end
```

## 4. Sơ Đồ Tuần Tự - Tạo Bình Luận

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant AI as AI Service
    participant NS as Notification Service

    U->>FE: Nhập bình luận cho bài viết
    FE->>BE: POST /api/v1/comments (với JWT token)
    BE->>BE: Xác thực JWT token
    BE->>AI: Kiểm tra nội dung bình luận
    AI-->>BE: Kết quả kiểm tra
    
    alt Phát hiện từ ngữ không phù hợp
        BE-->>FE: 400 "Profanity detected"
        FE-->>U: "Bình luận chứa từ ngữ không phù hợp"
    else Nội dung hợp lệ
        BE->>DB: Lưu bình luận
        BE->>DB: Lấy thông tin tác giả bài viết
        DB-->>BE: Thông tin tác giả
        BE->>NS: Tạo thông báo cho tác giả bài viết
        DB-->>BE: Comment đã tạo
        BE-->>FE: 201 + thông tin bình luận
        FE->>FE: Cập nhật danh sách bình luận
        FE-->>U: Hiển thị bình luận mới
    end
```

## 5. Sơ Đồ Tuần Tự - Nhắn Tin Realtime

```mermaid
sequenceDiagram
    participant U1 as Người dùng A
    participant FE1 as Frontend A
    participant U2 as Người dùng B
    participant FE2 as Frontend B
    participant BE as Backend (Spring Boot)
    participant WS as WebSocket
    participant DB as Database
    participant AI as AI Service

    U1->>FE1: Nhập tin nhắn
    FE1->>BE: POST /api/v1/chatrooms/{id}/messages
    BE->>BE: Xác thực JWT token
    BE->>AI: Kiểm tra nội dung tin nhắn
    AI-->>BE: Kết quả kiểm tra
    
    alt Phát hiện từ ngữ không phù hợp
        BE-->>FE1: 400 "Profanity detected"
        FE1-->>U1: "Tin nhắn chứa từ ngữ không phù hợp"
    else Nội dung hợp lệ
        BE->>DB: Lưu tin nhắn
        DB-->>BE: Tin nhắn đã lưu
        BE->>WS: Gửi tin nhắn qua WebSocket
        WS-->>FE1: Tin nhắn realtime
        WS-->>FE2: Tin nhắn realtime
        FE1-->>U1: Hiển thị tin nhắn đã gửi
        FE2-->>U2: Hiển thị tin nhắn mới nhận
    end
```

## 6. Sơ Đồ Tuần Tự - Tương Tác Bài Viết (Like/React)

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant NS as Notification Service

    U->>FE: Click like/react bài viết
    FE->>BE: POST /api/v1/post-reactions/posts/{id}/react
    BE->>BE: Xác thực JWT token
    BE->>DB: Kiểm tra reaction đã tồn tại
    
    alt Đã like/react trước đó
        BE->>DB: Cập nhật hoặc xóa reaction
        DB-->>BE: Kết quả cập nhật
        BE-->>FE: 200 + thông tin reaction
    else Chưa like/react
        BE->>DB: Tạo reaction mới
        BE->>DB: Lấy thông tin tác giả bài viết
        DB-->>BE: Thông tin tác giả
        BE->>NS: Tạo thông báo like cho tác giả
        DB-->>BE: Reaction đã tạo
        BE-->>FE: 201 + thông tin reaction
    end
    
    FE->>FE: Cập nhật UI reaction
    FE-->>U: Hiển thị trạng thái reaction mới
```

## 7. Sơ Đồ Tuần Tự - Quản Trị Hệ Thống

```mermaid
sequenceDiagram
    participant A as Admin
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database

    A->>FE: Truy cập trang admin
    FE->>BE: GET /api/admin/dashboard/stats (với admin token)
    BE->>BE: Kiểm tra quyền admin (@PreAuthorize)
    
    alt Không có quyền admin
        BE-->>FE: 403 Forbidden
        FE-->>A: "Không có quyền truy cập"
    else Có quyền admin
        BE->>DB: Lấy thống kê hệ thống
        DB-->>BE: Dữ liệu thống kê
        BE-->>FE: 200 + dữ liệu dashboard
        FE-->>A: Hiển thị dashboard admin
        
        A->>FE: Xem danh sách bài viết vi phạm
        FE->>BE: GET /api/admin/posts
        BE->>DB: Lấy danh sách posts
        DB-->>BE: Danh sách posts
        BE-->>FE: 200 + danh sách posts
        FE-->>A: Hiển thị danh sách
        
        A->>FE: Xóa bài viết vi phạm
        FE->>BE: DELETE /api/admin/posts/{id}
        BE->>DB: Xóa bài viết
        DB-->>BE: Xác nhận xóa
        BE-->>FE: 200 "Post deleted"
        FE-->>A: "Đã xóa bài viết thành công"
    end
```

## 8. Sơ Đồ Tuần Tự - Cập Nhật Thông Báo Realtime

```mermaid
sequenceDiagram
    participant U1 as Người dùng A
    participant FE1 as Frontend A
    participant U2 as Người dùng B  
    participant FE2 as Frontend B
    participant BE as Backend (Spring Boot)
    participant WS as WebSocket
    participant DB as Database

    Note over U1,DB: Người dùng A like bài viết của người dùng B
    
    U1->>FE1: Like bài viết của B
    FE1->>BE: POST /api/v1/post-reactions/posts/{id}/react
    BE->>DB: Tạo reaction
    BE->>DB: Tạo notification cho user B
    DB-->>BE: Notification đã tạo
    BE->>WS: Gửi notification realtime cho B
    WS-->>FE2: Thông báo realtime
    FE2->>FE2: Cập nhật số lượng thông báo chưa đọc
    FE2-->>U2: Hiển thị thông báo mới
    
    BE-->>FE1: 200 + reaction success
    FE1-->>U1: Cập nhật UI like
    
    Note over U2,DB: Người dùng B kiểm tra thông báo
    
    U2->>FE2: Click vào thông báo
    FE2->>BE: PUT /api/v1/notifications/{id}/read
    BE->>DB: Đánh dấu đã đọc
    DB-->>BE: Cập nhật thành công
    BE-->>FE2: 200 OK
    FE2-->>U2: Chuyển đến bài viết được like
```

## 3.2 TRIỂN KHAI HỆ THỐNG AI PHÁT HIỆN NỘI DUNG KHÔNG PHÙ HỢP

### 3.2.1 Xây dựng mô hình PhoBERT cho tiếng Việt
Hệ thống sử dụng mô hình PhoBERT (Vietnamese BERT) được huấn luyện đặc biệt để phát hiện từ ngữ không phù hợp trong tiếng Việt. Mô hình được xây dựng với kiến trúc:

```python
class PhoBERTForTokenClassification(nn.Module):
    def __init__(self, model_name, num_labels, dropout_rate=0.3):
        super().__init__()
        self.num_labels = num_labels
        self.phobert = AutoModel.from_pretrained(model_name)
        
        # Anti-overfitting layers
        self.dropout = nn.Dropout(dropout_rate)
        self.layer_norm = nn.LayerNorm(self.phobert.config.hidden_size)
        
        # Classification head
        self.classifier = nn.Linear(self.phobert.config.hidden_size, num_labels)
```

**Cấu hình mô hình:**
- Model name: `vinai/phobert-base`
- Max length: 128 tokens
- Labels: `['O', 'B-T', 'I-T']` (O: Clean, B-T: Begin Toxic, I-T: Inside Toxic)
- Confidence threshold: 0.7
- Dropout rate: 0.3

### 3.2.2 Thiết lập AI Server với Flask
Xây dựng AI server độc lập chạy trên Python Flask để xử lý các yêu cầu phát hiện nội dung:

```python
@app.route('/detect', methods=['POST'])
def detect_profanity():
    try:
        detector = get_detector()
        data = request.get_json()
        text = data['text']
        
        # Phát hiện từ ngữ không phù hợp
        result = detector.detect_profanity(text)
        result['timestamp'] = time.time()
        result['model_version'] = 'phobert-trained-1.0'
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}',
            'is_profane': False,
            'confidence': 0.0
        }), 500
```

**Endpoints AI Server:**
- `GET /health` - Kiểm tra trạng thái server và model
- `POST /detect` - Phát hiện nội dung không phù hợp
- `GET /model_info` - Thông tin chi tiết về model

### 3.2.3 Tích hợp AI vào Backend Spring Boot
Tạo service để kết nối từ Spring Boot backend đến AI server:

```java
@Service
public class ProfanityDetectionService {
    @Value("${profanity.detection.url:http://localhost:5000}")
    private String profanityServerUrl;
    
    public ProfanityResult checkProfanity(String text) {
        // Kiểm tra AI server có sẵn sàng
        if (!isServerHealthy()) {
            throw new RuntimeException("Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút.");
        }
        
        // Gửi request đến AI server
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("text", text);
        
        ResponseEntity<ProfanityApiResponse> response = restTemplate.postForEntity(
            profanityServerUrl + "/detect", requestBody, ProfanityApiResponse.class
        );
        
        // Xử lý kết quả
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            ProfanityApiResponse apiResponse = response.getBody();
            return ProfanityResult.builder()
                .profane(apiResponse.isProfane)
                .confidence(apiResponse.confidence)
                .originalText(text)
                .processedText(apiResponse.processedText)
                .toxicSpans(apiResponse.toxicSpans)
                .build();
        }
    }
}
```

### 3.2.4 Quy trình phát hiện nội dung trong Comment
Khi người dùng tạo bình luận, hệ thống sẽ kiểm tra nội dung qua AI:

```java
public CommentDTO createComment(Long postId, CreateCommentRequest request, Integer userId) {
    String commentText = request.getActualText();
    
    // Kiểm tra nội dung qua AI
    try {
        ProfanityResult profanityResult = profanityDetectionService.checkProfanity(commentText);
        
        if (profanityResult.isProfane()) {
            throw new RuntimeException("Bình luận chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.");
        }
    } catch (RuntimeException e) {
        String errorMsg = e.getMessage();
        if (errorMsg.contains("đang khởi động") || errorMsg.contains("tạm thời không khả dụng")) {
            throw e; // Thông báo AI server đang loading
        }
        throw new RuntimeException("Hệ thống kiểm tra nội dung tạm thời không khả dụng. Vui lòng thử lại sau.");
    }
    
    // Lưu bình luận nếu nội dung hợp lệ
    Comment comment = new Comment();
    comment.setText(commentText);
    // ... save comment
}
```

### 3.2.5 Xử lý phản hồi cho người dùng
Dựa trên kết quả phân tích từ AI, hệ thống sẽ trả về phản hồi phù hợp:

**Frontend xử lý lỗi profanity:**
```typescript
try {
    await CommentService.createComment(commentData);
    // Hiển thị bình luận thành công
} catch (error: any) {
    const errorData = error?.response?.data;
    
    if (errorData?.isProfanityError === true || 
        errorData?.error === 'PROFANITY_DETECTED') {
        // Hiển thị modal cảnh báo từ ngữ không phù hợp
        setProfanityResult({
            is_profane: true,
            confidence: errorData?.confidence || 0.8,
            toxic_spans: errorData?.toxicSpans || [],
            processed_text: newComment
        });
        setShowProfanityWarning(true);
    } else {
        // Hiển thị lỗi khác
        alert("Không thể tạo bình luận. Vui lòng thử lại.");
    }
}
```

**Các trạng thái phản hồi:**
- **Nội dung hợp lệ**: "Bình luận thành công" - bình luận được đăng lên hệ thống
- **Phát hiện từ ngữ không phù hợp**: "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại."
- **AI server đang loading**: "Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút."
- **AI server lỗi**: "Hệ thống kiểm tra nội dung tạm thời không khả dụng. Vui lòng thử lại sau."

### 3.2.6 Tối ưu hóa hiệu suất AI
**Persistent Model Loading**: AI server giữ model trong memory để phản hồi nhanh:
```python
class ProfanityDetector:
    def __init__(self):
        self.model_loaded = False
        self.loading_in_progress = False
        # Load model trong background thread
        threading.Thread(target=self._load_model_async, daemon=True).start()
    
    def detect_profanity(self, text):
        if not self.is_ready():
            return {'error': 'Model is still loading, please wait...'}
        
        # Xử lý nhanh với model đã load
        return self._process_text_with_model(text, self.tokenizer, self.model)
```

**Health Check System**: Kiểm tra trạng thái AI server trước khi gửi request:
```java
public boolean isServerHealthy() {
    try {
        ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(
            profanityServerUrl + "/health", Map.class
        );
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> health = response.getBody();
            boolean isHealthy = "healthy".equals(health.get("status"));
            boolean modelLoaded = Boolean.TRUE.equals(health.get("model_loaded"));
            return isHealthy && modelLoaded;
        }
    } catch (Exception e) {
        return false;
    }
    return false;
}
```

## Ưu điểm của hệ thống AI:
1. **Đơn giản và hiệu quả**: Chỉ tập trung vào 1 tác vụ chính - phát hiện từ ngữ không phù hợp
2. **Tích hợp liền mạch**: AI server độc lập, dễ scale và maintain
3. **Phản hồi thân thiện**: Thông báo rõ ràng cho người dùng về trạng thái hệ thống
4. **Xử lý lỗi tốt**: Graceful degradation khi AI server không khả dụng
5. **Tối ưu memory**: Model persistent, phản hồi nhanh cho requests tiếp theo

---

## 1. Sơ Đồ Tuần Tự - Đăng Ký Tài Khoản

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant AS as AI Service

    U->>FE: Nhập thông tin đăng ký (username, password)
    FE->>FE: Validate form dữ liệu
    FE->>BE: POST /api/v1/auth/register
    BE->>DB: Kiểm tra username đã tồn tại
    DB-->>BE: Kết quả kiểm tra
    
    alt Username đã tồn tại
        BE-->>FE: 400 "Username already exists"
        FE-->>U: Hiển thị thông báo lỗi
    else Username chưa tồn tại
        BE->>BE: Mã hóa mật khẩu (BCrypt)
        BE->>DB: Tạo User mới
        BE->>DB: Tạo UserData mặc định
        BE->>DB: Tạo UserSettings mặc định
        DB-->>BE: Xác nhận tạo thành công
        BE-->>FE: 200 "User registered successfully"
        FE->>FE: Chuyển về form đăng nhập
        FE-->>U: Hiển thị "Đăng ký thành công"
    end
```

## 2. Sơ Đồ Tuần Tự - Đăng Nhập

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant JWT as JWT Service

    U->>FE: Nhập username và password
    FE->>BE: POST /api/v1/auth/login
    BE->>DB: Tìm user theo username
    DB-->>BE: Thông tin user
    
    alt User không tồn tại hoặc sai mật khẩu
        BE-->>FE: 401 Unauthorized
        FE-->>U: "Đăng nhập thất bại"
    else Thông tin đúng
        BE->>JWT: Tạo JWT token
        JWT-->>BE: JWT token
        BE-->>FE: 200 + JWT token
        FE->>FE: Lưu token vào localStorage
        FE->>BE: GET /api/v1/auth/me (với token)
        BE-->>FE: Thông tin user đầy đủ
        FE->>FE: Cập nhật state user
        FE-->>U: Chuyển hướng đến /home
    end
```

## 3. Sơ Đồ Tuần Tự - Tạo Bài Viết

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant AI as AI Service
    participant Cloud as Cloudinary

    U->>FE: Nhập nội dung bài viết + upload ảnh
    FE->>FE: Validate form
    
    opt Có ảnh upload
        FE->>Cloud: Upload ảnh lên Cloudinary
        Cloud-->>FE: URL ảnh
    end
    
    FE->>BE: POST /api/v1/posts (với JWT token)
    BE->>BE: Xác thực JWT token
    BE->>AI: Gửi nội dung kiểm tra từ ngữ không phù hợp
    AI->>AI: Phân tích bằng PhoBERT model
    AI-->>BE: Kết quả kiểm tra
    
    alt Phát hiện từ ngữ không phù hợp
        BE-->>FE: 400 "Profanity detected"
        FE-->>U: Hiển thị cảnh báo từ ngữ không phù hợp
    else Nội dung hợp lệ
        BE->>DB: Lưu bài viết mới
        DB-->>BE: Post ID và thông tin
        BE-->>FE: 201 + thông tin bài viết
        FE->>FE: Cập nhật feed
        FE-->>U: Hiển thị bài viết mới
    end
```

## 4. Sơ Đồ Tuần Tự - Tạo Bình Luận

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant AI as AI Service
    participant NS as Notification Service

    U->>FE: Nhập bình luận cho bài viết
    FE->>BE: POST /api/v1/comments (với JWT token)
    BE->>BE: Xác thực JWT token
    BE->>AI: Kiểm tra nội dung bình luận
    AI-->>BE: Kết quả kiểm tra
    
    alt Phát hiện từ ngữ không phù hợp
        BE-->>FE: 400 "Profanity detected"
        FE-->>U: "Bình luận chứa từ ngữ không phù hợp"
    else Nội dung hợp lệ
        BE->>DB: Lưu bình luận
        BE->>DB: Lấy thông tin tác giả bài viết
        DB-->>BE: Thông tin tác giả
        BE->>NS: Tạo thông báo cho tác giả bài viết
        DB-->>BE: Comment đã tạo
        BE-->>FE: 201 + thông tin bình luận
        FE->>FE: Cập nhật danh sách bình luận
        FE-->>U: Hiển thị bình luận mới
    end
```

## 5. Sơ Đồ Tuần Tự - Nhắn Tin Realtime

```mermaid
sequenceDiagram
    participant U1 as Người dùng A
    participant FE1 as Frontend A
    participant U2 as Người dùng B
    participant FE2 as Frontend B
    participant BE as Backend (Spring Boot)
    participant WS as WebSocket
    participant DB as Database
    participant AI as AI Service

    U1->>FE1: Nhập tin nhắn
    FE1->>BE: POST /api/v1/chatrooms/{id}/messages
    BE->>BE: Xác thực JWT token
    BE->>AI: Kiểm tra nội dung tin nhắn
    AI-->>BE: Kết quả kiểm tra
    
    alt Phát hiện từ ngữ không phù hợp
        BE-->>FE1: 400 "Profanity detected"
        FE1-->>U1: "Tin nhắn chứa từ ngữ không phù hợp"
    else Nội dung hợp lệ
        BE->>DB: Lưu tin nhắn
        DB-->>BE: Tin nhắn đã lưu
        BE->>WS: Gửi tin nhắn qua WebSocket
        WS-->>FE1: Tin nhắn realtime
        WS-->>FE2: Tin nhắn realtime
        FE1-->>U1: Hiển thị tin nhắn đã gửi
        FE2-->>U2: Hiển thị tin nhắn mới nhận
    end
```

## 6. Sơ Đồ Tuần Tự - Tương Tác Bài Viết (Like/React)

```mermaid
sequenceDiagram
    participant U as Người dùng
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database
    participant NS as Notification Service

    U->>FE: Click like/react bài viết
    FE->>BE: POST /api/v1/post-reactions/posts/{id}/react
    BE->>BE: Xác thực JWT token
    BE->>DB: Kiểm tra reaction đã tồn tại
    
    alt Đã like/react trước đó
        BE->>DB: Cập nhật hoặc xóa reaction
        DB-->>BE: Kết quả cập nhật
        BE-->>FE: 200 + thông tin reaction
    else Chưa like/react
        BE->>DB: Tạo reaction mới
        BE->>DB: Lấy thông tin tác giả bài viết
        DB-->>BE: Thông tin tác giả
        BE->>NS: Tạo thông báo like cho tác giả
        DB-->>BE: Reaction đã tạo
        BE-->>FE: 201 + thông tin reaction
    end
    
    FE->>FE: Cập nhật UI reaction
    FE-->>U: Hiển thị trạng thái reaction mới
```

## 7. Sơ Đồ Tuần Tự - Quản Trị Hệ Thống

```mermaid
sequenceDiagram
    participant A as Admin
    participant FE as Frontend (React)
    participant BE as Backend (Spring Boot)
    participant DB as Database

    A->>FE: Truy cập trang admin
    FE->>BE: GET /api/admin/dashboard/stats (với admin token)
    BE->>BE: Kiểm tra quyền admin (@PreAuthorize)
    
    alt Không có quyền admin
        BE-->>FE: 403 Forbidden
        FE-->>A: "Không có quyền truy cập"
    else Có quyền admin
        BE->>DB: Lấy thống kê hệ thống
        DB-->>BE: Dữ liệu thống kê
        BE-->>FE: 200 + dữ liệu dashboard
        FE-->>A: Hiển thị dashboard admin
        
        A->>FE: Xem danh sách bài viết vi phạm
        FE->>BE: GET /api/admin/posts
        BE->>DB: Lấy danh sách posts
        DB-->>BE: Danh sách posts
        BE-->>FE: 200 + danh sách posts
        FE-->>A: Hiển thị danh sách
        
        A->>FE: Xóa bài viết vi phạm
        FE->>BE: DELETE /api/admin/posts/{id}
        BE->>DB: Xóa bài viết
        DB-->>BE: Xác nhận xóa
        BE-->>FE: 200 "Post deleted"
        FE-->>A: "Đã xóa bài viết thành công"
    end
```

## 8. Sơ Đồ Tuần Tự - Cập Nhật Thông Báo Realtime

```mermaid
sequenceDiagram
    participant U1 as Người dùng A
    participant FE1 as Frontend A
    participant U2 as Người dùng B  
    participant FE2 as Frontend B
    participant BE as Backend (Spring Boot)
    participant WS as WebSocket
    participant DB as Database

    Note over U1,DB: Người dùng A like bài viết của người dùng B
    
    U1->>FE1: Like bài viết của B
    FE1->>BE: POST /api/v1/post-reactions/posts/{id}/react
    BE->>DB: Tạo reaction
    BE->>DB: Tạo notification cho user B
    DB-->>BE: Notification đã tạo
    BE->>WS: Gửi notification realtime cho B
    WS-->>FE2: Thông báo realtime
    FE2->>FE2: Cập nhật số lượng thông báo chưa đọc
    FE2-->>U2: Hiển thị thông báo mới
    
    BE-->>FE1: 200 + reaction success
    FE1-->>U1: Cập nhật UI like
    
    Note over U2,DB: Người dùng B kiểm tra thông báo
    
    U2->>FE2: Click vào thông báo
    FE2->>BE: PUT /api/v1/notifications/{id}/read
    BE->>DB: Đánh dấu đã đọc
    DB-->>BE: Cập nhật thành công
    BE-->>FE2: 200 OK
    FE2-->>U2: Chuyển đến bài viết được like
```

## 3.2 TRIỂN KHAI HỆ THỐNG AI PHÁT HIỆN NỘI DUNG KHÔNG PHÙ HỢP

### 3.2.1 Xây dựng mô hình PhoBERT cho tiếng Việt
Hệ thống sử dụng mô hình PhoBERT (Vietnamese BERT) được huấn luyện đặc biệt để phát hiện từ ngữ không phù hợp trong tiếng Việt. Mô hình được xây dựng với kiến trúc:

```python
class PhoBERTForTokenClassification(nn.Module):
    def __init__(self, model_name, num_labels, dropout_rate=0.3):
        super().__init__()
        self.num_labels = num_labels
        self.phobert = AutoModel.from_pretrained(model_name)
        
        # Anti-overfitting layers
        self.dropout = nn.Dropout(dropout_rate)
        self.layer_norm = nn.LayerNorm(self.phobert.config.hidden_size)
        
        # Classification head
        self.classifier = nn.Linear(self.phobert.config.hidden_size, num_labels)
```

**Cấu hình mô hình:**
- Model name: `vinai/phobert-base`
- Max length: 128 tokens
- Labels: `['O', 'B-T', 'I-T']` (O: Clean, B-T: Begin Toxic, I-T: Inside Toxic)
- Confidence threshold: 0.7
- Dropout rate: 0.3

### 3.2.2 Thiết lập AI Server với Flask
Xây dựng AI server độc lập chạy trên Python Flask để xử lý các yêu cầu phát hiện nội dung:

```python
@app.route('/detect', methods=['POST'])
def detect_profanity():
    try:
        detector = get_detector()
        data = request.get_json()
        text = data['text']
        
        # Phát hiện từ ngữ không phù hợp
        result = detector.detect_profanity(text)
        result['timestamp'] = time.time()
        result['model_version'] = 'phobert-trained-1.0'
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}',
            'is_profane': False,
            'confidence': 0.0
        }), 500
```

**Endpoints AI Server:**
- `GET /health` - Kiểm tra trạng thái server và model
- `POST /detect` - Phát hiện nội dung không phù hợp
- `GET /model_info` - Thông tin chi tiết về model

### 3.2.3 Tích hợp AI vào Backend Spring Boot
Tạo service để kết nối từ Spring Boot backend đến AI server:

```java
@Service
public class ProfanityDetectionService {
    @Value("${profanity.detection.url:http://localhost:5000}")
    private String profanityServerUrl;
    
    public ProfanityResult checkProfanity(String text) {
        // Kiểm tra AI server có sẵn sàng
        if (!isServerHealthy()) {
            throw new RuntimeException("Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút.");
        }
        
        // Gửi request đến AI server
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("text", text);
        
        ResponseEntity<ProfanityApiResponse> response = restTemplate.postForEntity(
            profanityServerUrl + "/detect", requestBody, ProfanityApiResponse.class
        );
        
        // Xử lý kết quả
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            ProfanityApiResponse apiResponse = response.getBody();
            return ProfanityResult.builder()
                .profane(apiResponse.isProfane)
                .confidence(apiResponse.confidence)
                .originalText(text)
                .processedText(apiResponse.processedText)
                .toxicSpans(apiResponse.toxicSpans)
                .build();
        }
    }
}
```

### 3.2.4 Quy trình phát hiện nội dung trong Comment
Khi người dùng tạo bình luận, hệ thống sẽ kiểm tra nội dung qua AI:

```java
public CommentDTO createComment(Long postId, CreateCommentRequest request, Integer userId) {
    String commentText = request.getActualText();
    
    // Kiểm tra nội dung qua AI
    try {
        ProfanityResult profanityResult = profanityDetectionService.checkProfanity(commentText);
        
        if (profanityResult.isProfane()) {
            throw new RuntimeException("Bình luận chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại.");
        }
    } catch (RuntimeException e) {
        String errorMsg = e.getMessage();
        if (errorMsg.contains("đang khởi động") || errorMsg.contains("tạm thời không khả dụng")) {
            throw e; // Thông báo AI server đang loading
        }
        throw new RuntimeException("Hệ thống kiểm tra nội dung tạm thời không khả dụng. Vui lòng thử lại sau.");
    }
    
    // Lưu bình luận nếu nội dung hợp lệ
    Comment comment = new Comment();
    comment.setText(commentText);
    // ... save comment
}
```

### 3.2.5 Xử lý phản hồi cho người dùng
Dựa trên kết quả phân tích từ AI, hệ thống sẽ trả về phản hồi phù hợp:

**Frontend xử lý lỗi profanity:**
```typescript
try {
    await CommentService.createComment(commentData);
    // Hiển thị bình luận thành công
} catch (error: any) {
    const errorData = error?.response?.data;
    
    if (errorData?.isProfanityError === true || 
        errorData?.error === 'PROFANITY_DETECTED') {
        // Hiển thị modal cảnh báo từ ngữ không phù hợp
        setProfanityResult({
            is_profane: true,
            confidence: errorData?.confidence || 0.8,
            toxic_spans: errorData?.toxicSpans || [],
            processed_text: newComment
        });
        setShowProfanityWarning(true);
    } else {
        // Hiển thị lỗi khác
        alert("Không thể tạo bình luận. Vui lòng thử lại.");
    }
}
```

**Các trạng thái phản hồi:**
- **Nội dung hợp lệ**: "Bình luận thành công" - bình luận được đăng lên hệ thống
- **Phát hiện từ ngữ không phù hợp**: "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa và thử lại."
- **AI server đang loading**: "Hệ thống kiểm tra nội dung đang khởi động. Vui lòng thử lại sau 2-3 phút."
- **AI server lỗi**: "Hệ thống kiểm tra nội dung tạm thời không khả dụng. Vui lòng thử lại sau."

### 3.2.6 Tối ưu hóa hiệu suất AI
**Persistent Model Loading**: AI server giữ model trong memory để phản hồi nhanh:
```python
class ProfanityDetector:
    def __init__(self):
        self.model_loaded = False
        self.loading_in_progress = False
        # Load model trong background thread
        threading.Thread(target=self._load_model_async, daemon=True).start()
    
    def detect_profanity(self, text):
        if not self.is_ready():
            return {'error': 'Model is still loading, please wait...'}
        
        # Xử lý nhanh với model đã load
        return self._process_text_with_model(text, self.tokenizer, self.model)
```

**Health Check System**: Kiểm tra trạng thái AI server trước khi gửi request:
```java
public boolean isServerHealthy() {
    try {
        ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(
            profanityServerUrl + "/health", Map.class
        );
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> health = response.getBody();
            boolean isHealthy = "healthy".equals(health.get("status"));
            boolean modelLoaded = Boolean.TRUE.equals(health.get("model_loaded"));
            return isHealthy && modelLoaded;
        }
    } catch (Exception e) {
        return false;
    }
    return false;
}
```

## Ưu điểm của hệ thống AI:
1. **Đơn giản và hiệu quả**: Chỉ tập trung vào 1 tác vụ chính - phát hiện từ ngữ không phù hợp
2. **Tích hợp liền mạch**: AI server độc lập, dễ scale và maintain
3. **Phản hồi thân thiện**: Thông báo rõ ràng cho người dùng về trạng thái hệ thống
4. **Xử lý lỗi tốt**: Graceful degradation khi AI server không khả dụng
5. **Tối ưu memory**: Model persistent, phản hồi nhanh cho requests tiếp theo
