# CHƯƠNG 1: LÝ THUYẾT VÀ CÔNG NGHỆ

Hệ thống WingIt tận dụng các công nghệ hiện đại và được áp dụng rộng rãi, được tích hợp một cách chiến lược để cung cấp một giải pháp đáp ứng và lấy người dùng làm trung tâm, đáp ứng hiệu quả nhu cầu và kỳ vọng của người dùng.

Để cung cấp cái nhìn sâu sắc hơn về nền tảng kỹ thuật của dự án này, tôi sẽ giới thiệu các khái niệm cốt lõi đằng sau những công nghệ chính được sử dụng.

## 1.1. Spring Boot Framework

![Spring Boot](https://spring.io/img/spring-logo.svg)

Spring Boot là một framework phát triển ứng dụng Java được thiết kế để đơn giản hóa việc tạo ra các ứng dụng Spring độc lập, sẵn sàng cho production. Nó loại bỏ phần lớn cấu hình phức tạp truyền thống của Spring Framework thông qua auto-configuration và convention-over-configuration.

### 1.1.1. Các Thành Phần Chính

Spring Boot bao gồm các thành phần chính sau:

**a. Auto-Configuration (Tự Động Cấu Hình)**
- Tự động cấu hình các beans dựa trên classpath và các dependencies có sẵn
- Giảm thiểu việc cấu hình thủ công thông qua annotation `@EnableAutoConfiguration`

**b. Starter Dependencies**
- Các dependency được đóng gói sẵn cho các use case phổ biến
- Ví dụ: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`

**c. Embedded Servers**
- Tích hợp sẵn Tomcat, Jetty, hoặc Undertow
- Không cần triển khai external application server

### 1.1.2. Architecture Pattern trong WingIt

Trong dự án WingIt, Spring Boot được sử dụng theo mô hình MVC (Model-View-Controller):

```java
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
    
    @PostMapping
    public ResponseEntity<PostDTO> createPost(@RequestBody CreatePostRequest request) {
        PostDTO createdPost = postService.createPost(request);
        return ResponseEntity.ok(createdPost);
    }
}
```

### 1.1.3. Dependency Injection

Spring Boot sử dụng Inversion of Control (IoC) container để quản lý dependencies:

```java
@Service
public class PostService {
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    // Constructor injection (recommended)
    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }
}
```

### 1.1.4. Ưu Điểm của Spring Boot

- **Rapid Development**: Giảm thời gian phát triển thông qua auto-configuration
- **Production-Ready**: Tích hợp sẵn monitoring, health checks, metrics
- **Microservices Support**: Dễ dàng tạo ra các microservices độc lập
- **Testing Support**: Framework testing mạnh mẽ với `@SpringBootTest`
- **Community**: Cộng đồng lớn và documentation phong phú

## 1.2. JSON Web Tokens (JWT) Authentication

![JWT](https://jwt.io/img/pic_logo.svg)

JSON Web Token (JWT) là một standard mở (RFC 7519) định nghĩa cách truyền tải thông tin một cách an toàn giữa các bên dưới dạng JSON object. Trong WingIt, JWT được sử dụng làm cơ chế authentication chính.

### 1.2.1. Cấu Trúc JWT

JWT bao gồm ba phần được phân tách bởi dấu chấm (.):

```
header.payload.signature
```

**a. Header**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**b. Payload**
```json
{
  "sub": "user123",
  "name": "Nguyen Van A",
  "username": "nguyenvana",
  "iat": 1516239022,
  "exp": 1516325422
}
```

**c. Signature**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

### 1.2.2. JWT Implementation trong WingIt

**JWT Service Class:**
```java
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private int jwtExpirationMs;
    
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 1.2.3. Security Filter Chain

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 1.2.4. Ưu Điểm của JWT

- **Stateless**: Server không cần lưu trữ session state
- **Scalability**: Dễ dàng scale horizontal
- **Cross-Domain**: Hoạt động tốt với CORS
- **Mobile-Friendly**: Phù hợp cho mobile applications
- **Self-Contained**: Chứa tất cả thông tin cần thiết

## 1.3. PhoBERT - Vietnamese Language Model

![PhoBERT](https://raw.githubusercontent.com/VinAIResearch/PhoBERT/master/phobert_logo.png)

PhoBERT là mô hình ngôn ngữ pre-trained đầu tiên cho tiếng Việt, được phát triển bởi VinAI Research. Trong WingIt, PhoBERT được fine-tune để phát hiện nội dung độc hại trong tiếng Việt.

### 1.3.1. Kiến Trúc BERT

BERT (Bidirectional Encoder Representations from Transformers) sử dụng kiến trúc Transformer encoder:

**Transformer Block:**
```
Self-Attention → Add & Norm → Feed Forward → Add & Norm
```

**Multi-Head Attention:**
```
Attention(Q,K,V) = softmax(QK^T/√d_k)V
```

Trong đó:
- Q: Query matrix
- K: Key matrix  
- V: Value matrix
- d_k: Dimension của key vectors

### 1.3.2. Fine-tuning cho Vietnamese Toxicity Detection

**Model Architecture:**
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
    
    def forward(self, input_ids, attention_mask=None):
        outputs = self.phobert(input_ids=input_ids, attention_mask=attention_mask)
        
        sequence_output = outputs.last_hidden_state
        sequence_output = self.layer_norm(sequence_output)
        sequence_output = self.dropout(sequence_output)
        
        logits = self.classifier(sequence_output)
        
        return {'logits': logits}
```

### 1.3.3. Training Process

**Loss Function:**
```python
def compute_loss(predictions, labels, attention_mask):
    loss_fct = CrossEntropyLoss()
    
    # Flatten predictions and labels
    active_loss = attention_mask.view(-1) == 1
    active_logits = predictions.view(-1, num_labels)
    active_labels = labels.view(-1)
    
    # Compute loss only on active tokens
    active_logits = active_logits[active_loss]
    active_labels = active_labels[active_loss]
    
    loss = loss_fct(active_logits, active_labels)
    return loss
```

### 1.3.4. Integration với WingIt Backend

**AI Service Integration:**
```java
@Service
public class ProfanityDetectionService {
    
    @Value("${profanity.detection.url}")
    private String aiServerUrl;
    
    public ProfanityResult checkContent(String content) {
        try {
            HttpEntity<Map<String, String>> request = new HttpEntity<>(
                Map.of("text", content)
            );
            
            ResponseEntity<ProfanityResult> response = restTemplate.postForEntity(
                aiServerUrl + "/check-profanity", 
                request, 
                ProfanityResult.class
            );
            
            return response.getBody();
        } catch (Exception e) {
            throw new ProfanityCheckException("AI service unavailable", e);
        }
    }
}
```

### 1.3.5. Ưu Điểm của PhoBERT

- **Vietnamese-Specific**: Được train trên corpus tiếng Việt lớn
- **Contextual Understanding**: Hiểu được ngữ cảnh và ý nghĩa
- **Transfer Learning**: Fine-tune cho tasks cụ thể
- **High Accuracy**: Độ chính xác cao trong NLP tasks tiếng Việt

## 1.4. Next.js với TypeScript

![Next.js](https://nextjs.org/static/blog/next-13/twitter-card.png)

Next.js là một React framework mạnh mẽ hỗ trợ server-side rendering (SSR), static site generation (SSG), và client-side rendering (CSR) trong một setup thống nhất. Kết hợp với TypeScript, nó mang lại type safety và developer experience tốt hơn.

### 1.4.1. App Router Architecture

Next.js 13+ sử dụng App Router với file-based routing:

```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── globals.css        # Global styles
├── auth/
│   ├── page.tsx       # Auth page
│   └── layout.tsx     # Auth layout
├── home/
│   └── page.tsx       # Home feed
└── profile/
    ├── page.tsx       # Own profile
    └── [username]/
        └── page.tsx   # User profile
```

### 1.4.2. TypeScript Integration

**API Route Types:**
```typescript
// app/api/posts/route.ts
export async function GET(request: NextRequest) {
  const posts: PostData[] = await fetchPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body: CreatePostRequest = await request.json();
  const newPost: PostData = await createPost(body);
  return NextResponse.json(newPost);
}
```

**Component Props Typing:**
```typescript
interface PostProps {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  createdAt: Date;
  liked?: boolean;
}

const Post: React.FC<PostProps> = ({
  id,
  authorName,
  content,
  likes,
  createdAt
}) => {
  // Component implementation
};
```

### 1.4.3. Server Components vs Client Components

**Server Component (default):**
```typescript
// app/home/page.tsx
async function HomePage() {
  const posts = await fetchPosts(); // Server-side data fetching
  
  return (
    <div>
      <Feed posts={posts} />
    </div>
  );
}
```

**Client Component:**
```typescript
'use client';

import { useState, useEffect } from 'react';

function InteractivePost({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
    // API call to update like status
  };
  
  return (
    <button onClick={handleLike}>
      {liked ? 'Unlike' : 'Like'}
    </button>
  );
}
```

### 1.4.4. Data Fetching Patterns

**Static Generation:**
```typescript
export async function generateStaticParams() {
  const users = await fetchAllUsers();
  
  return users.map((user) => ({
    username: user.username,
  }));
}
```

**Dynamic Routes:**
```typescript
// app/profile/[username]/page.tsx
interface PageProps {
  params: { username: string };
}

export default async function UserProfile({ params }: PageProps) {
  const user = await fetchUserByUsername(params.username);
  
  return <UserProfileComponent user={user} />;
}
```

### 1.4.5. Ưu Điểm của Next.js + TypeScript

- **Type Safety**: Compile-time error checking
- **Performance**: Automatic code splitting và optimization
- **SEO-Friendly**: Server-side rendering support
- **Developer Experience**: Hot reloading, error boundaries
- **API Routes**: Full-stack development in one framework

## 1.5. WebSocket Real-time Communication

![WebSocket](https://upload.wikimedia.org/wikipedia/commons/1/10/Websocket_connection.png)

WebSocket là một giao thức truyền thông hai chiều qua một kết nối TCP duy nhất. Trong WingIt, WebSocket được sử dụng để implement real-time messaging và notifications.

### 1.5.1. WebSocket Protocol

WebSocket thiết lập kết nối thông qua HTTP upgrade:

```
GET /ws HTTP/1.1
Host: localhost:8080
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

**Server Response:**
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

### 1.5.2. Spring Boot WebSocket Configuration

**WebSocket Config:**
```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatWebSocketHandler(), "/ws")
                .setAllowedOrigins("*");
    }
}
```

**WebSocket Handler:**
```java
@Component
public class WebSocketHandler extends TextWebSocketHandler {
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String username = extractUsername(session);
        sessions.put(username, session);
        
        // Notify other users that user is online
        broadcastUserStatus(username, "online");
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) 
            throws Exception {
        
        MessageData messageData = objectMapper.readValue(
            message.getPayload(), 
            MessageData.class
        );
        
        // Save message to database
        chatService.saveMessage(messageData);
        
        // Broadcast to room participants
        broadcastToRoom(messageData.getRoomId(), message);
    }
    
    private void broadcastToRoom(Long roomId, TextMessage message) {
        List<String> participants = chatService.getRoomParticipants(roomId);
        
        participants.forEach(username -> {
            WebSocketSession session = sessions.get(username);
            if (session != null && session.isOpen()) {
                try {
                    session.sendMessage(message);
                } catch (IOException e) {
                    log.error("Failed to send message to user: " + username, e);
                }
            }
        });
    }
}
```

### 1.5.3. Frontend WebSocket Integration

**WebSocket Service:**
```typescript
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('auth-token');
      const wsUrl = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?token=${token}`;
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };
      
      this.socket.onclose = () => {
        this.handleDisconnection();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }
  
  sendMessage(roomId: number, content: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'CHAT_MESSAGE',
        roomId,
        content,
        timestamp: new Date().toISOString()
      };
      
      this.socket.send(JSON.stringify(message));
    }
  }
  
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'CHAT_MESSAGE':
        this.onMessageReceived(data);
        break;
      case 'USER_ONLINE':
        this.onUserOnline(data.username);
        break;
      case 'NOTIFICATION':
        this.onNotificationReceived(data);
        break;
    }
  }
}
```

### 1.5.4. Message Types và Protocol

**Message Structure:**
```typescript
interface WebSocketMessage {
  type: 'CHAT_MESSAGE' | 'USER_STATUS' | 'NOTIFICATION' | 'TYPING';
  roomId?: number;
  content?: string;
  username?: string;
  timestamp: string;
  data?: any;
}
```

**Typing Indicators:**
```typescript
const handleTyping = debounce((roomId: number) => {
  webSocketService.send({
    type: 'TYPING',
    roomId,
    username: currentUser.username,
    timestamp: new Date().toISOString()
  });
}, 300);
```

### 1.5.5. Ưu Điểm của WebSocket

- **Real-time**: Truyền tải dữ liệu tức thời
- **Bi-directional**: Giao tiếp hai chiều
- **Low Latency**: Độ trễ thấp so với HTTP polling
- **Efficient**: Ít overhead hơn HTTP requests
- **Persistent Connection**: Duy trì kết nối liên tục

## 1.6. MySQL Database Management

![MySQL](https://www.mysql.com/common/logos/logo-mysql-170x115.png)

MySQL là một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở, được sử dụng rộng rãi cho các ứng dụng web. Trong WingIt, MySQL được sử dụng để lưu trữ tất cả dữ liệu của ứng dụng.

### 1.6.1. Database Schema Design

**Entity Relationship Model:**

```sql
-- Core User Tables
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NULL,
    email VARCHAR(100) UNIQUE,
    provider VARCHAR(20),
    provider_id VARCHAR(100),
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES role(id)
);

CREATE TABLE user_data (
    user_id INT PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    bio TEXT,
    profile_picture VARCHAR(255),
    cover_photo VARCHAR(255),
    date_of_birth DATE,
    created_at DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Social Features
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    post_type_id BIGINT,
    location_id INT,
    created_date DATETIME NOT NULL,
    updated_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (post_type_id) REFERENCES post_type(id),
    FOREIGN KEY (location_id) REFERENCES location(id)
);

CREATE TABLE friends (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    friendship_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (friend_id) REFERENCES user(id),
    UNIQUE KEY unique_friendship (user_id, friend_id)
);
```

### 1.6.2. JPA Entity Mapping

**User Entity:**
```java
@Entity
@Table(name = "user")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = true)
    private String password;
    
    @Column(unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    private AuthProvider provider;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserData userData;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post> posts = new ArrayList<>();
}
```

**Post Entity với Relationships:**
```java
@Entity
@Table(name = "posts")
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_type_id")
    private PostType postType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();
    
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PostReaction> reactions = new ArrayList<>();
    
    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;
}
```

### 1.6.3. Repository Pattern Implementation

**JPA Repository:**
```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdDate DESC")
    List<Post> findByUserIdOrderByCreatedDateDesc(@Param("userId") Integer userId);
    
    @Query("SELECT p FROM Post p JOIN p.user.friends f WHERE f.friend.id = :userId " +
           "ORDER BY p.createdDate DESC")
    Page<Post> findFriendsPosts(@Param("userId") Integer userId, Pageable pageable);
    
    @Query("SELECT COUNT(pr) FROM PostReaction pr WHERE pr.post.id = :postId " +
           "AND pr.reactionType.name = 'like'")
    Long countLikesByPostId(@Param("postId") Long postId);
    
    @Modifying
    @Query("UPDATE Post p SET p.content = :content WHERE p.id = :postId " +
           "AND p.user.id = :userId")
    int updatePostContent(@Param("postId") Long postId, 
                         @Param("userId") Integer userId, 
                         @Param("content") String content);
}
```

**Custom Repository Implementation:**
```java
@Repository
@Transactional
public class PostRepositoryCustomImpl implements PostRepositoryCustom {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public List<Post> findPostsWithComplexFiltering(PostSearchCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Post> query = cb.createQuery(Post.class);
        Root<Post> post = query.from(Post.class);
        
        List<Predicate> predicates = new ArrayList<>();
        
        if (criteria.getUserId() != null) {
            predicates.add(cb.equal(post.get("user").get("id"), criteria.getUserId()));
        }
        
        if (criteria.getLocationId() != null) {
            predicates.add(cb.equal(post.get("location").get("id"), criteria.getLocationId()));
        }
        
        if (criteria.getFromDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(post.get("createdDate"), criteria.getFromDate()));
        }
        
        query.where(predicates.toArray(new Predicate[0]));
        query.orderBy(cb.desc(post.get("createdDate")));
        
        return entityManager.createQuery(query)
                           .setMaxResults(criteria.getLimit())
                           .getResultList();
    }
}
```

### 1.6.4. Database Optimization

**Indexing Strategy:**
```sql
-- Performance indexes
CREATE INDEX idx_posts_user_created ON posts(user_id, created_date DESC);
CREATE INDEX idx_posts_location ON posts(location_id);
CREATE INDEX idx_friends_user_friend ON friends(user_id, friend_id);
CREATE INDEX idx_messages_room_created ON messages(room_id, created_date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_date);

-- Full-text search indexes
ALTER TABLE posts ADD FULLTEXT(content);
ALTER TABLE user_data ADD FULLTEXT(display_name, bio);
```

**Connection Pooling:**
```properties
# application.properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
spring.datasource.hikari.connection-timeout=20000
```

### 1.6.5. Ưu Điểm của MySQL

- **ACID Compliance**: Đảm bảo tính toàn vẹn dữ liệu
- **Performance**: Hiệu suất cao với large datasets
- **Scalability**: Hỗ trợ replication và clustering
- **Reliability**: Ổn định và tin cậy cao
- **Community**: Cộng đồng lớn và support tốt

## 1.7. Cloudinary Media Management

![Cloudinary](https://cloudinary-res.cloudinary.com/image/upload/c_scale,w_300/v1/logo/for_white_bg/cloudinary_logo_for_white_bg.svg)

Cloudinary là một cloud-based service cung cấp giải pháp quản lý media toàn diện, bao gồm upload, storage, manipulation, và delivery. Trong WingIt, Cloudinary được sử dụng để xử lý tất cả hình ảnh của người dùng.

### 1.7.1. Image Upload Architecture

**Backend Integration:**
```java
@Service
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        
        Map<String, String> config = Map.of(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        );
        
        this.cloudinary = new Cloudinary(config);
    }
    
    public CloudinaryResponse uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadParams = Map.of(
                "folder", folder,
                "resource_type", "image",
                "transformation", Map.of(
                    "quality", "auto:good",
                    "fetch_format", "auto"
                )
            );
            
            Map<String, Object> result = cloudinary.uploader()
                .upload(file.getBytes(), uploadParams);
            
            return CloudinaryResponse.builder()
                .publicId((String) result.get("public_id"))
                .url((String) result.get("secure_url"))
                .format((String) result.get("format"))
                .width((Integer) result.get("width"))
                .height((Integer) result.get("height"))
                .bytes((Integer) result.get("bytes"))
                .build();
                
        } catch (IOException e) {
            throw new ImageUploadException("Failed to upload image", e);
        }
    }
    
    public String generateOptimizedUrl(String publicId, int width, int height) {
        return cloudinary.url()
            .transformation(new Transformation()
                .width(width)
                .height(height)
                .crop("fill")
                .quality("auto:good")
                .fetchFormat("auto"))
            .generate(publicId);
    }
}
```

### 1.7.2. Frontend Image Handling

**Image Upload Component:**
```typescript
interface ImageUploadProps {
  onUploadSuccess: (imageUrl: string) => void;
  maxSize?: number;
  acceptedFormats?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!acceptedFormats.includes(file.type)) {
      toast.error('Định dạng file không được hỗ trợ');
      return;
    }
    
    if (file.size > maxSize) {
      toast.error('File quá lớn. Kích thước tối đa 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Upload file
    uploadImage(file);
  };
  
  const uploadImage = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'user-posts');
      
      const response = await fetch('/api/v1/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result: CloudinaryResponse = await response.json();
      onUploadSuccess(result.url);
      
      toast.success('Upload thành công');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload thất bại');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="image-upload">
      <input
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="image-upload"
      />
      
      <label htmlFor="image-upload" className="upload-button">
        {uploading ? (
          <Spinner size="sm" />
        ) : (
          <Camera size={20} />
        )}
        {uploading ? 'Đang upload...' : 'Chọn ảnh'}
      </label>
      
      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" className="preview-image" />
        </div>
      )}
    </div>
  );
};
```

### 1.7.3. Image Transformation và Optimization

**Responsive Images:**
```typescript
interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  publicId,
  alt,
  width,
  height,
  className
}) => {
  const generateSrcSet = () => {
    const sizes = [1, 1.5, 2]; // 1x, 1.5x, 2x
    return sizes.map(scale => {
      const scaledWidth = Math.round(width * scale);
      const scaledHeight = Math.round(height * scale);
      
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/` +
                  `w_${scaledWidth},h_${scaledHeight},c_fill,q_auto,f_auto/${publicId}`;
      
      return `${url} ${scale}x`;
    }).join(', ');
  };
  
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/` +
                  `w_${width},h_${height},c_fill,q_auto,f_auto/${publicId}`;
  
  return (
    <img
      src={baseUrl}
      srcSet={generateSrcSet()}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
};
```

**Dynamic URL Generation:**
```typescript
class ImageUrlGenerator {
  static generateProfileUrl(publicId: string, size: 'small' | 'medium' | 'large' = 'medium') {
    const dimensions = {
      small: { w: 64, h: 64 },
      medium: { w: 128, h: 128 },
      large: { w: 256, h: 256 }
    };
    
    const { w, h } = dimensions[size];
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/` +
           `w_${w},h_${h},c_fill,g_face,q_auto,f_auto/${publicId}`;
  }
  
  static generatePostImageUrl(publicId: string, maxWidth: number = 800) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/` +
           `w_${maxWidth},c_limit,q_auto,f_auto/${publicId}`;
  }
  
  static generateThumbnail(publicId: string) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/` +
           `w_200,h_200,c_fill,q_auto,f_auto/${publicId}`;
  }
}
```

### 1.7.4. Image Cropping Integration

**React Image Crop Integration:**
```typescript
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';

interface ImageCropModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 1
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  
  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Canvas to blob conversion failed');
        
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        const croppedUrl = await uploadCroppedImage(file);
        
        onCropComplete(croppedUrl);
        onClose();
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Crop error:', error);
      toast.error('Cắt ảnh thất bại');
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Cắt ảnh</ModalHeader>
        <ModalBody>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              className="max-w-full max-h-96"
            />
          </ReactCrop>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Hủy
          </Button>
          <Button color="primary" onPress={handleCropComplete}>
            Xác nhận
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```

### 1.7.5. Ưu Điểm của Cloudinary

- **Automatic Optimization**: Tự động tối ưu hóa format và quality
- **Responsive Delivery**: Cung cấp images phù hợp với device
- **Global CDN**: Delivery nhanh trên toàn cầu
- **Transformation API**: Xử lý ảnh real-time
- **Security**: Upload restrictions và access controls

## Kết Luận

Chương này đã trình bày các công nghệ và lý thuyết cốt lõi được sử dụng trong việc xây dựng nền tảng mạng xã hội WingIt. Mỗi công nghệ được lựa chọn dựa trên những ưu điểm cụ thể và khả năng tích hợp tốt với nhau, tạo nên một hệ thống hoàn chỉnh, scalable và hiệu quả.

Việc kết hợp Spring Boot cho backend, Next.js với TypeScript cho frontend, PhoBERT cho AI content moderation, WebSocket cho real-time communication, MySQL cho data persistence, và Cloudinary cho media management đã tạo ra một kiến trúc mạnh mẽ và hiện đại, đáp ứng được các yêu cầu của một ứng dụng mạng xã hội professional.

Các công nghệ này không chỉ giải quyết được các vấn đề kỹ thuật hiện tại mà còn cung cấp foundation vững chắc cho việc mở rộng và phát triển tính năng trong tương lai.
