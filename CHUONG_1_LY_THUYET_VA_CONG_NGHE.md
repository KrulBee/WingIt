# CHƯƠNG 1: LÝ THUYẾT VÀ CÔNG NGHỆ

Hệ thống này tận dụng các công nghệ đương đại, được áp dụng rộng rãi và được tích hợp một cách chiến lược để cung cấp một giải pháp phản hồi nhanh và tập trung vào người dùng, đáp ứng hiệu quả nhu cầu và kỳ vọng của người dùng.

Để cung cấp cái nhìn sâu sắc hơn về nền tảng kỹ thuật của dự án này, tôi sẽ giới thiệu các khái niệm cốt lõi đằng sau những công nghệ chính được sử dụng.

## 1.1. PhoBERT - Mô hình BERT Tiếng Việt

PhoBERT là một mô hình ngôn ngữ dựa trên kiến trúc BERT (Bidirectional Encoder Representations from Transformers) được pre-train đặc biệt cho tiếng Việt. Nó được phát triển để giải quyết các thách thức đặc thù của ngôn ngữ tiếng Việt trong xử lý ngôn ngữ tự nhiên.

### 1.1.1. Kiến Trúc Transformer

PhoBERT dựa trên kiến trúc Transformer, sử dụng cơ chế Self-Attention để hiểu ngữ cảnh của từng token trong câu. Kiến trúc này bao gồm:

**a. Multi-Head Self-Attention**
Cơ chế attention cho phép mô hình tập trung vào các phần khác nhau của input sequence đồng thời:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Trong đó:
- Q (Query), K (Key), V (Value) là các ma trận được học từ input
- $d_k$ là dimension của key vectors
- Softmax đảm bảo tổng trọng số attention = 1

**b. Multi-Head Attention**
Mở rộng cơ chế attention để capture các loại thông tin khác nhau:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, ..., \text{head}_h)W^O$$

$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

### 1.1.2. Bidirectional Context Understanding

Khác với các mô hình ngôn ngữ truyền thống chỉ đọc từ trái sang phải, BERT sử dụng Masked Language Modeling (MLM) để học ngữ cảnh từ cả hai hướng:

- **Masked Language Modeling**: Ngẫu nhiên che giấu 15% tokens trong input và dự đoán chúng
- **Next Sentence Prediction**: Dự đoán xem câu B có theo sau câu A hay không

### 1.1.3. Vietnamese Language Adaptations

PhoBERT được thiết kế đặc biệt để xử lý các đặc điểm của tiếng Việt:

**a. Tokenization**
- Sử dụng word-level tokenization thay vì subword cho tiếng Việt
- Xử lý dấu thanh và các ký tự đặc biệt của tiếng Việt

**b. Pre-training Corpus**
- Được train trên corpus tiếng Việt lớn (20GB text)
- Bao gồm dữ liệu từ Wikipedia, báo chí, sách, và web crawling

### 1.1.4. Mathematical Foundation

**Input Representation:**
$$\text{Input} = \text{Token Embeddings} + \text{Position Embeddings} + \text{Segment Embeddings}$$

**Transformer Block:**
$$\text{Output} = \text{LayerNorm}(\text{x} + \text{MultiHead}(\text{x}))$$
$$\text{Final} = \text{LayerNorm}(\text{Output} + \text{FFN}(\text{Output}))$$

### 1.1.5. Fine-tuning Capabilities

PhoBERT có thể được fine-tune cho nhiều tác vụ NLP khác nhau:
- Text Classification
- Named Entity Recognition
- Question Answering
- Sentiment Analysis

## 1.2. Spring Boot Framework

Spring Boot là một framework Java được thiết kế để đơn giản hóa việc phát triển các ứng dụng Spring production-ready. Nó cung cấp cấu hình tự động, starter dependencies và embedded servers để tạo ra các ứng dụng standalone.

### 1.2.1. Inversion of Control (IoC) Container

Spring Boot dựa trên nguyên lý IoC, trong đó container quản lý việc tạo và inject dependencies:

**a. Dependency Injection**
Container tự động inject các dependencies thông qua:
- Constructor injection (được khuyến nghị)
- Setter injection  
- Field injection

**b. Bean Lifecycle Management**
Container quản lý toàn bộ lifecycle của beans từ khởi tạo đến destruction.

### 1.2.2. Auto-Configuration

Spring Boot sử dụng conditional annotations để tự động cấu hình dựa trên:
- Classpath dependencies
- Existing beans
- Configuration properties
- Application context

Cơ chế này giảm thiểu việc cấu hình thủ công và sử dụng "convention over configuration".

### 1.2.3. Embedded Server Architecture

Spring Boot tích hợp sẵn servlet containers:
- **Tomcat**: Default embedded server, phù hợp cho hầu hết ứng dụng
- **Jetty**: Alternative lightweight option
- **Undertow**: High-performance option cho concurrent loads

### 1.2.4. Production-Ready Features

**Actuator Monitoring:**
- Health checks và metrics collection
- Environment information
- Application monitoring endpoints

**Security Integration:**
- Seamless integration với Spring Security
- OAuth2 và JWT support
- CORS configuration

## 1.3. JSON Web Token (JWT)

JWT là một tiêu chuẩn mở (RFC 7519) cho việc truyền thông tin an toàn giữa các bên dưới dạng JSON object được ký số. Nó cho phép xác thực và authorization stateless.

### 1.3.1. Token Structure

JWT bao gồm ba phần được mã hóa Base64URL và ngăn cách bởi dấu chấm:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**a. Header**
Chứa thông tin về thuật toán ký:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**b. Payload** 
Chứa claims (thông tin về user):
```json
{
  "sub": "1234567890",
  "name": "John Doe", 
  "iat": 1516239022,
  "exp": 1516242622
}
```

**c. Signature**
Đảm bảo tính toàn vẹn của token:
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### 1.3.2. Cryptographic Signing

JWT hỗ trợ nhiều thuật toán ký:
- **HMAC**: Shared secret key
- **RSA**: Public/private key pairs
- **ECDSA**: Elliptic curve digital signatures

### 1.3.3. Claims Types

**a. Registered Claims**
- `iss` (issuer): Người phát hành token
- `exp` (expiration): Thời gian hết hạn
- `sub` (subject): Chủ thể của token
- `aud` (audience): Đối tượng sử dụng token

**b. Public Claims**
Có thể được định nghĩa tùy ý nhưng nên tránh xung đột

**c. Private Claims**
Claims tùy chỉnh để chia sẻ thông tin giữa các bên

### 1.3.4. Security Considerations

- **Token Expiration**: Sử dụng thời gian hết hạn ngắn
- **Secure Storage**: Lưu trữ token an toàn ở client
- **HTTPS Only**: Chỉ truyền token qua HTTPS
- **Secret Management**: Bảo vệ signing key

## 1.4. Next.js với TypeScript

Next.js là một React framework cung cấp server-side rendering, static site generation và nhiều tính năng optimization. TypeScript bổ sung type safety cho JavaScript, giúp phát hiện lỗi sớm và cải thiện developer experience.

### 1.4.1. Rendering Strategies

**a. Server-Side Rendering (SSR)**
HTML được generate trên server cho mỗi request:
- Cải thiện SEO
- Faster initial page load
- Better performance trên low-end devices

**b. Static Site Generation (SSG)**
HTML được generate tại build time:
- Excellent performance
- Better caching
- Reduced server load

**c. Incremental Static Regeneration (ISR)**
Kết hợp lợi ích của SSG và SSR:
- Static generation với ability to update
- Background regeneration
- Stale-while-revalidate pattern

### 1.4.2. TypeScript Integration

**a. Static Type Checking**
TypeScript phát hiện lỗi tại compile-time:
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  // Type-safe implementation
}
```

**b. Advanced Type Features**
- Generics for reusable code
- Union types for flexible APIs
- Mapped types for transformations
- Conditional types for complex logic

### 1.4.3. Code Splitting và Optimization

Next.js tự động tối ưu hóa:
- **Automatic Code Splitting**: Chỉ load code cần thiết
- **Image Optimization**: Lazy loading và responsive images
- **Font Optimization**: Automatic font loading optimization
- **Script Optimization**: Intelligent script loading

### 1.4.4. API Routes

Next.js cung cấp serverless functions:
```typescript
// pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorResponse>
) {
  // Type-safe API implementation
}
```

## 1.5. WebSocket Protocol

WebSocket là một giao thức truyền thông cung cấp kênh full-duplex communication qua một TCP connection duy nhất. Nó cho phép real-time, bidirectional communication giữa client và server.

### 1.5.1. Protocol Handshake

WebSocket bắt đầu với HTTP handshake sau đó upgrade thành WebSocket protocol:

**Client Request:**
```
GET /chat HTTP/1.1
Host: server.example.com
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

### 1.5.2. Frame Structure

WebSocket data được truyền trong frames với cấu trúc:
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

### 1.5.3. Connection States

WebSocket connection có các states:
- **CONNECTING**: Connection đang được thiết lập
- **OPEN**: Connection sẵn sàng để truyền data
- **CLOSING**: Connection đang được đóng
- **CLOSED**: Connection đã đóng hoặc không thể mở

### 1.5.4. Error Handling và Reconnection

Strategies để xử lý connection issues:
- **Heartbeat/Ping-Pong**: Kiểm tra connection alive
- **Exponential Backoff**: Retry với increasing delays
- **Queue Management**: Buffer messages khi disconnected
- **Graceful Degradation**: Fallback sang HTTP polling

## 1.6. PostgreSQL Database Management System

PostgreSQL là một hệ quản trị cơ sở dữ liệu quan hệ-đối tượng (ORDBMS) mã nguồn mở mạnh mẽ, nổi tiếng với tính extensibility và SQL compliance. Được phát triển ban đầu tại University of California, Berkeley, nó đã phát triển thành một database enterprise-grade được sử dụng rộng rãi.

### 1.6.1. ACID Properties

PostgreSQL đảm bảo các thuộc tính ACID cho transactions:

**a. Atomicity (Tính nguyên tử)**
- Transactions được thực hiện hoàn toàn hoặc không thực hiện
- Rollback mechanism khi có lỗi xảy ra

**b. Consistency (Tính nhất quán)**
- Database luôn ở trạng thái valid
- Constraints và business rules được enforce nghiêm ngặt

**c. Isolation (Tính cô lập)**
- Concurrent transactions không ảnh hưởng lẫn nhau
- Multiple isolation levels: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE

**d. Durability (Tính bền vững)**
- Committed transactions được lưu trữ vĩnh viễn
- Write-ahead logging (WAL) cho crash recovery

### 1.6.2. Multi-Version Concurrency Control (MVCC)

PostgreSQL sử dụng MVCC để xử lý concurrent access:
- Readers không block writers và ngược lại
- Mỗi transaction thấy một consistent snapshot của data
- Tự động garbage collection cho old versions

### 1.6.3. Advanced Data Types và Extensibility

**a. Built-in Data Types**
- JSON và JSONB cho semi-structured data
- Arrays, Ranges, và Geometric types
- Network address types (INET, CIDR)
- Full-text search types

**b. Extensibility**
- Custom data types và operators
- User-defined functions trong nhiều languages
- Extensions như PostGIS cho geographic data

### 1.6.4. Query Optimization và Performance

**a. Query Planner**
PostgreSQL optimizer sử dụng cost-based planning:
- Statistics collection về data distribution
- Multiple join algorithms (nested loop, hash, merge)
- Index usage optimization

**b. Index Types**
- **B-Tree**: Default index type cho equality và range queries
- **Hash**: Fast equality lookups
- **GIN/GiST**: Full-text search và complex data types
- **Partial Indexes**: Conditional indexing để tiết kiệm space

### 1.6.5. Replication và High Availability

**a. Streaming Replication**
- Asynchronous và synchronous replication
- Hot standby servers cho read scaling
- Automatic failover capabilities

**b. Logical Replication**
- Row-level replication
- Selective replication của tables
- Cross-version compatibility

## 1.7. Cloudinary Media Management

Cloudinary là một cloud-based media management platform cung cấp end-to-end image và video management solution. Nó bao gồm upload, storage, manipulation, optimization và delivery.

### 1.7.1. Cloud-Based Architecture

**a. Global CDN Network**
- Multiple edge locations worldwide
- Automatic geographic optimization
- Reduced latency cho end users

**b. Scalable Storage**
- Auto-scaling storage capacity
- Redundant backup systems
- High availability guarantees

### 1.7.2. Image Transformation Pipeline

**a. URL-Based Transformations**
Transformations được specify trong URL:
```
https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg
```

**b. Transformation Parameters**
- **Resize**: w_width, h_height
- **Crop**: c_crop_mode (fill, fit, scale, etc.)
- **Quality**: q_quality_value
- **Format**: f_format (auto, webp, jpg, png)

### 1.7.3. Automatic Optimization

**a. Format Selection**
Cloudinary tự động chọn format tối ưu:
- WebP cho browsers hỗ trợ
- JPEG cho compatibility
- PNG cho images với transparency

**b. Quality Optimization**
- Intelligent quality adjustment
- Visual quality analysis
- File size optimization

### 1.7.4. Advanced Features

**a. AI-Powered Transformations**
- Automatic cropping với gravity detection
- Background removal
- Object recognition và tagging

**b. Video Processing**
- Adaptive bitrate streaming
- Video transcoding
- Thumbnail generation

**c. Security Features**
- Signed URLs cho private content
- Access control policies
- Watermarking protection

## Kết Luận

Các công nghệ được trình bày trong chương này đại diện cho những tiến bộ quan trọng trong phát triển phần mềm hiện đại. PhoBERT thể hiện sự tiến bộ trong xử lý ngôn ngữ tự nhiên cho tiếng Việt, Spring Boot cung cấp nền tảng vững chắc cho backend development, JWT mang lại giải pháp authentication hiệu quả, Next.js với TypeScript tạo ra frontend experiences xuất sắc, WebSocket cho phép real-time communication, PostgreSQL đảm bảo data persistence đáng tin cậy, và Cloudinary tối ưu hóa media management.

Việc hiểu rõ các nguyên lý lý thuyết đằng sau những công nghệ này là cực kỳ quan trọng cho việc xây dựng các ứng dụng web hiện đại, scalable và user-friendly. Mỗi công nghệ đều có những ưu điểm riêng và khi được kết hợp một cách thông minh, chúng tạo ra một ecosystem mạnh mẽ cho việc phát triển các ứng dụng web phức tạp.
